import { Resend } from "resend"

const OTP_EXPIRY_MINUTES = 5

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) return null
  return new Resend(apiKey)
}

function getFromAddress(): string {
  return process.env.RESEND_FROM?.trim() || "Jaliz <onboarding@resend.dev>"
}

function buildOtpText(code: string): string {
  return [
    `Your Jaliz login code: ${code}`,
    "",
    `This code expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    "If you did not request this, you can ignore this email.",
    "",
    "---",
    `کد ورود جالیز: ${code}`,
    "",
    `این کد تا ${OTP_EXPIRY_MINUTES} دقیقه دیگر معتبر است.`,
    "اگر این درخواست را شما نداده‌اید، این ایمیل را نادیده بگیرید.",
  ].join("\n")
}

function buildOtpHtml(code: string): string {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 420px; margin: 0 auto; color: #0f172a;">
      <p style="font-size: 16px; margin-bottom: 8px;">Your Jaliz login code:</p>
      <p style="font-size: 32px; font-weight: 700; letter-spacing: 0.25em; margin: 16px 0; color: #059669;">${code}</p>
      <p style="font-size: 14px; color: #64748b;">Expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 16px; margin-bottom: 8px; direction: rtl; text-align: right;">کد ورود جالیز:</p>
      <p style="font-size: 32px; font-weight: 700; letter-spacing: 0.25em; margin: 16px 0; color: #059669; direction: ltr; text-align: center;">${code}</p>
      <p style="font-size: 14px; color: #64748b; direction: rtl; text-align: right;">این کد تا ${OTP_EXPIRY_MINUTES} دقیقه دیگر معتبر است.</p>
    </div>
  `.trim()
}

/** Sends a one-time login code. Falls back to server logs when RESEND_API_KEY is unset. */
export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const client = getResendClient()

  if (!client) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not configured")
    }

    console.warn("[sendOtpEmail] RESEND_API_KEY not set — logging OTP to console (development only)")
    console.log(`
    ==================================================
    [OTP CODE] Sent to: ${to}
    Code: ${code}
    ==================================================
    `)
    return
  }

  const { error } = await client.emails.send({
    from: getFromAddress(),
    to: [to],
    subject: "Your Jaliz login code | کد ورود جالیز",
    html: buildOtpHtml(code),
    text: buildOtpText(code),
  })

  if (error) {
    console.error("[sendOtpEmail] Resend error:", error)
    throw new Error(error.message || "Failed to send OTP email")
  }
}
