import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
}))

vi.mock("resend", () => ({
  Resend: class MockResend {
    emails = { send: sendMock }
    constructor(_apiKey: string) {}
  },
}))

describe("sendOtpEmail", () => {
  const originalEnv = { ...process.env }
  let consoleLogSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.resetModules()
    sendMock.mockReset()
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  it("logs OTP in development when RESEND_API_KEY is missing", async () => {
    process.env.NODE_ENV = "development"
    delete process.env.RESEND_API_KEY

    const { sendOtpEmail } = await import("../send-otp-email")
    await sendOtpEmail("user@example.com", "123456")

    expect(sendMock).not.toHaveBeenCalled()
    expect(consoleWarnSpy).toHaveBeenCalled()
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("123456"))
  })

  it("throws in production when RESEND_API_KEY is missing", async () => {
    process.env.NODE_ENV = "production"
    delete process.env.RESEND_API_KEY

    const { sendOtpEmail } = await import("../send-otp-email")
    await expect(sendOtpEmail("user@example.com", "123456")).rejects.toThrow(
      "RESEND_API_KEY is not configured",
    )
  })

  it("sends email via Resend when API key is configured", async () => {
    process.env.NODE_ENV = "production"
    process.env.RESEND_API_KEY = "re_test_key"
    process.env.RESEND_FROM = "Jaliz <auth@jaliz.ir>"
    sendMock.mockResolvedValue({ data: { id: "msg_1" }, error: null })

    const { sendOtpEmail } = await import("../send-otp-email")
    await sendOtpEmail("user@example.com", "654321")

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Jaliz <auth@jaliz.ir>",
        to: ["user@example.com"],
        subject: expect.stringContaining("Jaliz"),
        html: expect.stringContaining("654321"),
        text: expect.stringContaining("654321"),
      }),
    )
  })

  it("throws when Resend returns an error", async () => {
    process.env.NODE_ENV = "production"
    process.env.RESEND_API_KEY = "re_test_key"
    sendMock.mockResolvedValue({ data: null, error: { message: "Invalid API key" } })

    const { sendOtpEmail } = await import("../send-otp-email")
    await expect(sendOtpEmail("user@example.com", "111111")).rejects.toThrow("Invalid API key")
  })
})
