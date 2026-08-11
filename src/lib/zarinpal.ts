const ZARINPAL_REQUEST_URL = "https://api.zarinpal.com/pg/v4/payment/request.json"
const ZARINPAL_VERIFY_URL = "https://api.zarinpal.com/pg/v4/payment/verify.json"
const ZARINPAL_START_PAY_URL = "https://www.zarinpal.com/pg/StartPay"

export function getZarinpalMerchantId(): string {
  return (
    process.env.ZARINPAL_MERCHANT_ID?.trim() ||
    "ad39dd80-569a-4ca9-9ba7-b73ddbd128ce"
  )
}

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, "")
  return "https://jaliz.ir"
}

export function zarinpalStartPayUrl(authority: string): string {
  return `${ZARINPAL_START_PAY_URL}/${authority}`
}

type ZarinpalEnvelope<T> = {
  data?: (T & { code?: number; message?: string }) | Record<string, never>
  errors?: { code?: number; message?: string; validations?: unknown } | unknown[] | null
}

export type ZarinpalRequestResult =
  | { ok: true; authority: string; fee: number }
  | { ok: false; code: number; message: string }

export type ZarinpalVerifyResult =
  | { ok: true; code: 100 | 101; refId: number; cardPan?: string }
  | { ok: false; code: number; message: string }

function readZarinpalError(result: ZarinpalEnvelope<unknown>): { code: number; message: string } {
  const errors = result.errors
  if (errors && !Array.isArray(errors) && typeof errors === "object") {
    const obj = errors as { code?: number; message?: string }
    if (obj.message || obj.code != null) {
      return {
        code: obj.code ?? -1,
        message: obj.message || "ZarinPal request failed",
      }
    }
  }
  const data = result.data
  if (data && typeof data === "object" && "message" in data) {
    return {
      code: typeof data.code === "number" ? data.code : -1,
      message: String(data.message || "ZarinPal request failed"),
    }
  }
  return { code: -1, message: "ZarinPal request failed" }
}

/** Map common ZarinPal codes to clear Persian copy for the UI. */
export function zarinpalErrorMessageFa(code: number, fallback: string): string {
  switch (code) {
    case -9:
      return "خطای اعتبارسنجی درگاه پرداخت."
    case -10:
      return "ایپی یا مرچنت‌کد درگاه معتبر نیست."
    case -11:
      return "مرچنت‌کد فعال نیست. وضعیت ترمینال را در پنل زرین‌پال بررسی کنید."
    case -12:
      return "تلاش زیاد؛ کمی بعد دوباره تلاش کنید."
    case -14:
      return "دامنه callback با دامنه ثبت‌شده در پنل زرین‌پال یکی نیست. در Vercel مقدار NEXT_PUBLIC_SITE_URL را روی همان دامنه بگذارید."
    case -15:
      return "درگاه در انتظار تایید یا تعلیق است."
    case -16:
      return "سطح تایید مرچنت برای این درگاه کافی نیست."
    case -17:
      return "محدودیت دسترسی به درگاه برای این مرچنت."
    default:
      return fallback || "درگاه پرداخت درخواست را رد کرد."
  }
}

async function postZarinpal<T>(
  url: string,
  body: Record<string, unknown>,
): Promise<ZarinpalEnvelope<T>> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  let json: ZarinpalEnvelope<T>
  try {
    json = (await res.json()) as ZarinpalEnvelope<T>
  } catch {
    throw new Error(`ZarinPal HTTP ${res.status} (invalid JSON)`)
  }

  // ZarinPal often returns business errors with HTTP 4xx + errors in the body.
  return json
}

export async function requestZarinpalPayment(input: {
  amountRial: number
  description: string
  callbackUrl: string
  email?: string | null
  mobile?: string | null
}): Promise<ZarinpalRequestResult> {
  const payload: Record<string, unknown> = {
    merchant_id: getZarinpalMerchantId(),
    amount: input.amountRial,
    description: input.description,
    callback_url: input.callbackUrl,
  }
  if (input.email) payload.email = input.email
  if (input.mobile) payload.mobile = input.mobile

  const result = await postZarinpal<{
    authority?: string
    fee?: number
  }>(ZARINPAL_REQUEST_URL, payload)

  const data = result.data
  const code = data && typeof data === "object" && "code" in data ? Number(data.code) : -1
  if (code === 100 && data && "authority" in data && data.authority) {
    return {
      ok: true,
      authority: String(data.authority),
      fee: typeof data.fee === "number" ? data.fee : 0,
    }
  }

  const err = readZarinpalError(result)
  return {
    ok: false,
    code: err.code !== -1 ? err.code : code,
    message: err.message,
  }
}

export async function verifyZarinpalPayment(input: {
  amountRial: number
  authority: string
}): Promise<ZarinpalVerifyResult> {
  const result = await postZarinpal<{
    ref_id?: number
    card_pan?: string
  }>(ZARINPAL_VERIFY_URL, {
    merchant_id: getZarinpalMerchantId(),
    amount: input.amountRial,
    authority: input.authority,
  })

  const data = result.data
  const code = data && typeof data === "object" && "code" in data ? Number(data.code) : -1
  if ((code === 100 || code === 101) && data && "ref_id" in data && data.ref_id != null) {
    return {
      ok: true,
      code: code as 100 | 101,
      refId: Number(data.ref_id),
      cardPan: typeof data.card_pan === "string" ? data.card_pan : undefined,
    }
  }

  if (code === 101) {
    return {
      ok: true,
      code: 101,
      refId: data && "ref_id" in data && data.ref_id != null ? Number(data.ref_id) : 0,
      cardPan: data && "card_pan" in data && typeof data.card_pan === "string" ? data.card_pan : undefined,
    }
  }

  const err = readZarinpalError(result)
  return {
    ok: false,
    code: err.code !== -1 ? err.code : code,
    message: err.message,
  }
}
