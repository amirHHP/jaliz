const ZARINPAL_REQUEST_URL = "https://api.zarinpal.com/pg/v4/payment/request.json"
const ZARINPAL_VERIFY_URL = "https://api.zarinpal.com/pg/v4/payment/verify.json"
const ZARINPAL_START_PAY_URL = "https://www.zarinpal.com/pg/StartPay"

export function getZarinpalMerchantId(): string {
  return (
    process.env.ZARINPAL_MERCHANT_ID?.trim() ||
    "f7ca2a9d-f8bc-43ca-a72c-a13addf1e507"
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
  data?: T & { code?: number; message?: string }
  errors?: unknown
}

export type ZarinpalRequestResult =
  | { ok: true; authority: string; fee: number }
  | { ok: false; code: number; message: string }

export type ZarinpalVerifyResult =
  | { ok: true; code: 100 | 101; refId: number; cardPan?: string }
  | { ok: false; code: number; message: string }

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

  if (!res.ok) {
    throw new Error(`ZarinPal HTTP ${res.status}`)
  }

  return (await res.json()) as ZarinpalEnvelope<T>
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

  const code = result.data?.code ?? -1
  if (code === 100 && result.data?.authority) {
    return {
      ok: true,
      authority: result.data.authority,
      fee: result.data.fee ?? 0,
    }
  }

  return {
    ok: false,
    code,
    message: result.data?.message || "ZarinPal request failed",
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

  const code = result.data?.code ?? -1
  if ((code === 100 || code === 101) && result.data?.ref_id != null) {
    return {
      ok: true,
      code,
      refId: result.data.ref_id,
      cardPan: result.data.card_pan,
    }
  }

  // Already-verified responses sometimes omit ref_id on 101 depending on API version
  if (code === 101) {
    return {
      ok: true,
      code: 101,
      refId: result.data?.ref_id ?? 0,
      cardPan: result.data?.card_pan,
    }
  }

  return {
    ok: false,
    code,
    message: result.data?.message || "ZarinPal verify failed",
  }
}
