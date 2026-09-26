import { beforeEach, describe, expect, it, vi } from "vitest";
import { signSessionValue, verifyAndExtractSessionUserId } from "@/lib/auth/session-cookie";

const mockCookies = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => mockCookies),
}));

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  },
  otpVerification: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  payment: {
    findMany: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  default: mockPrisma,
}));

vi.mock("@/lib/email/send-otp-email", () => ({
  sendOtpEmail: vi.fn(async () => ({ success: true })),
}));

describe("Auth Server Actions - Session Security & OTP", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Session Security (HMAC-SHA256)", () => {
    it("extracts user ID when session cookie signature is valid", async () => {
      const { getSessionUserId } = await import("../auth");
      const signed = signSessionValue("user-real-id");
      mockCookies.get.mockReturnValue({ value: signed });

      const userId = await getSessionUserId();
      expect(userId).toBe("user-real-id");
    });

    it("rejects tampered or unsigned session cookie unconditionally", async () => {
      const { getSessionUserId } = await import("../auth");
      mockCookies.get.mockReturnValue({ value: "spoofed-admin-id" });

      const userId = await getSessionUserId();
      expect(userId).toBeNull();
    });

    it("returns null if session cookie is missing", async () => {
      const { getSessionUserId } = await import("../auth");
      mockCookies.get.mockReturnValue(undefined);

      const userId = await getSessionUserId();
      expect(userId).toBeNull();
    });
  });

  describe("OTP Generation & Rate Limiting", () => {
    it("sends OTP and does NOT create a user record in User table", async () => {
      const { sendOtpAction } = await import("../auth");
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.otpVerification.findUnique.mockResolvedValue(null);
      mockPrisma.otpVerification.upsert.mockResolvedValue({ id: "otp-1" });

      const res = await sendOtpAction("newuser@jaliz.local");
      expect(res).toEqual({ success: true });

      // User must NOT be created before verification
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      // OTP record must be upserted
      expect(mockPrisma.otpVerification.upsert).toHaveBeenCalledTimes(1);
      const upsertArgs = mockPrisma.otpVerification.upsert.mock.calls[0][0];
      expect(upsertArgs.where.email).toBe("newuser@jaliz.local");
      expect(upsertArgs.create.code).toMatch(/^\d{6}$/);
    });

    it("enforces minimum 2-minute cooldown between OTP sends", async () => {
      const { sendOtpAction } = await import("../auth");
      mockPrisma.user.findUnique.mockResolvedValue(null);
      // Last sent 30 seconds ago
      mockPrisma.otpVerification.findUnique.mockResolvedValue({
        email: "ratelimited@jaliz.local",
        lastSentAt: new Date(Date.now() - 30 * 1000),
      });

      const res = await sendOtpAction("ratelimited@jaliz.local");
      expect(res).toHaveProperty("__authError", "OTP_RATE_LIMITED");
      expect(mockPrisma.otpVerification.upsert).not.toHaveBeenCalled();
    });

    it("allows resending OTP after 2-minute cooldown expires", async () => {
      const { sendOtpAction } = await import("../auth");
      mockPrisma.user.findUnique.mockResolvedValue(null);
      // Last sent 2 minutes and 5 seconds ago
      mockPrisma.otpVerification.findUnique.mockResolvedValue({
        email: "allowed@jaliz.local",
        lastSentAt: new Date(Date.now() - 125 * 1000),
      });
      mockPrisma.otpVerification.upsert.mockResolvedValue({ id: "otp-2" });

      const res = await sendOtpAction("allowed@jaliz.local");
      expect(res).toEqual({ success: true });
      expect(mockPrisma.otpVerification.upsert).toHaveBeenCalledTimes(1);
    });

    it("blocks inactive users from requesting OTP", async () => {
      const { sendOtpAction } = await import("../auth");
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "disabled-user",
        email: "disabled@jaliz.local",
        isActive: false,
      });

      const res = await sendOtpAction("disabled@jaliz.local");
      expect(res).toHaveProperty("__authError", "USER_INACTIVE");
      expect(mockPrisma.otpVerification.upsert).not.toHaveBeenCalled();
    });
  });

  describe("OTP Verification & Lockout & Deferred User Creation", () => {
    it("increments attempts on incorrect code", async () => {
      const { loginWithOtpAction } = await import("../auth");
      mockPrisma.otpVerification.findUnique.mockResolvedValue({
        email: "user@jaliz.local",
        code: "123456",
        attempts: 1,
        expiresAt: new Date(Date.now() + 60000),
      });

      const res = await loginWithOtpAction("user@jaliz.local", "999999");
      expect(res).toHaveProperty("__authError", "INVALID_CREDENTIALS");
      expect(mockPrisma.otpVerification.update).toHaveBeenCalledWith({
        where: { email: "user@jaliz.local" },
        data: { attempts: 2 },
      });
    });

    it("locks out after 5 failed attempts by updating attempts without deleting record", async () => {
      const { loginWithOtpAction } = await import("../auth");
      mockPrisma.otpVerification.findUnique.mockResolvedValue({
        email: "user@jaliz.local",
        code: "123456",
        attempts: 4,
        expiresAt: new Date(Date.now() + 60000),
      });

      // 5th failed attempt
      const res = await loginWithOtpAction("user@jaliz.local", "000000");
      expect(res).toHaveProperty("__authError", "OTP_LOCKED");
      expect(mockPrisma.otpVerification.update).toHaveBeenCalledWith({
        where: { email: "user@jaliz.local" },
        data: { attempts: 5 },
      });
      // Crucial: record must NOT be deleted so cooldown and lockout persist
      expect(mockPrisma.otpVerification.delete).not.toHaveBeenCalled();
    });

    it("continues to report OTP_LOCKED on subsequent attempts when already locked out", async () => {
      const { loginWithOtpAction } = await import("../auth");
      mockPrisma.otpVerification.findUnique.mockResolvedValue({
        email: "locked@jaliz.local",
        code: "123456",
        attempts: 5,
        expiresAt: new Date(Date.now() + 60000),
      });

      const res = await loginWithOtpAction("locked@jaliz.local", "123456");
      expect(res).toHaveProperty("__authError", "OTP_LOCKED");
      expect(mockPrisma.otpVerification.delete).not.toHaveBeenCalled();
    });

    it("prevents locked out user from immediately bypassing cooldown via sendOtpAction", async () => {
      const { sendOtpAction } = await import("../auth");
      mockPrisma.user.findUnique.mockResolvedValue(null);
      // Locked out 30 seconds ago
      mockPrisma.otpVerification.findUnique.mockResolvedValue({
        email: "locked@jaliz.local",
        attempts: 5,
        lastSentAt: new Date(Date.now() - 30 * 1000),
      });

      const res = await sendOtpAction("locked@jaliz.local");
      expect(res).toHaveProperty("__authError", "OTP_RATE_LIMITED");
      expect(mockPrisma.otpVerification.upsert).not.toHaveBeenCalled();
    });

    it("creates user in DB only upon valid OTP verification and sets signed cookie", async () => {
      const { loginWithOtpAction } = await import("../auth");
      const email = "firsttime@jaliz.local";
      const validCode = "654321";

      mockPrisma.otpVerification.findUnique.mockResolvedValue({
        email,
        code: validCode,
        attempts: 0,
        expiresAt: new Date(Date.now() + 60000),
      });
      mockPrisma.otpVerification.delete.mockResolvedValue({});
      mockPrisma.user.findUnique.mockResolvedValue(null); // not found yet
      mockPrisma.user.count.mockResolvedValue(0); // first user -> admin
      mockPrisma.user.create.mockImplementation(({ data }: any) =>
        Promise.resolve({
          id: "created-user-id",
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          isActive: true,
          createdAt: new Date(),
        })
      );
      mockPrisma.payment.findMany.mockResolvedValue([]);

      const res = await loginWithOtpAction(email, validCode);
      expect(res).not.toHaveProperty("__authError");
      const user = res as any;
      expect(user.id).toBe("created-user-id");
      expect(user.email).toBe(email);
      expect(user.role).toBe("admin");

      // Verify OTP consumed
      expect(mockPrisma.otpVerification.delete).toHaveBeenCalledWith({ where: { email } });
      // Verify user created
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);

      // Verify session cookie was signed
      expect(mockCookies.set).toHaveBeenCalledTimes(1);
      const setCall = mockCookies.set.mock.calls[0];
      const cookieValue = setCall[1];
      expect(cookieValue).toContain("created-user-id.");
      expect(verifyAndExtractSessionUserId(cookieValue)).toBe("created-user-id");
    });
  });
});
