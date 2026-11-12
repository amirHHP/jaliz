import { NextRequest, NextResponse } from "next/server"
import { getPaymentGatewayBaseUrl, zarinpalStartPayUrl } from "@/lib/zarinpal"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ authority: string }> },
) {
  const { authority } = await context.params

  if (!authority || typeof authority !== "string" || !/^[A-Za-z0-9_-]+$/.test(authority)) {
    return new NextResponse("کد پیگیری پرداخت نامعتبر است.", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }

  const gatewayBase = getPaymentGatewayBaseUrl()
  let targetHost = ""
  try {
    targetHost = new URL(gatewayBase).hostname
  } catch {
    targetHost = "jaliz.noxte.ir"
  }

  const currentHost = req.nextUrl.hostname

  // If the request landed on jalizapp.ir or another non-gateway domain,
  // redirect over to the canonical gateway domain so the subsequent
  // navigation to ZarinPal carries the approved Referer.
  if (
    currentHost !== targetHost &&
    currentHost !== "localhost" &&
    currentHost !== "127.0.0.1" &&
    !currentHost.includes("localhost")
  ) {
    return NextResponse.redirect(`${gatewayBase}/payments/pay/${authority}`)
  }

  const zarinpalUrl = zarinpalStartPayUrl(authority)

  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>انتقال به درگاه پرداخت زرین‌پال · جالیز</title>
  <meta name="referrer" content="origin" />
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #e0f2fe 100%);
      color: #064e3b;
      padding: 1rem;
    }
    .card {
      background: white;
      border-radius: 1.5rem;
      padding: 2.25rem 2rem;
      max-width: 420px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03);
      border: 1px solid rgba(16, 185, 129, 0.15);
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #a7f3d0;
      border-top-color: #059669;
      border-radius: 50%;
      animation: spin 0.9s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite;
      margin: 0 auto 1.5rem;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    h1 {
      font-size: 1.25rem;
      font-weight: 800;
      margin: 0 0 0.5rem;
      color: #065f46;
    }
    p {
      font-size: 0.9rem;
      color: #047857;
      margin: 0 0 1.5rem;
      line-height: 1.5;
    }
    .btn {
      display: inline-block;
      width: 100%;
      padding: 0.875rem 1.25rem;
      background: #059669;
      color: white;
      text-decoration: none;
      border-radius: 0.875rem;
      font-size: 0.95rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn:hover {
      background: #047857;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h1>در حال اتصال به درگاه پرداخت...</h1>
    <p>لطفاً چند لحظه شکیبا باشید. در حال انتقال امن به شبکه شاپرک / زرین‌پال هستید.</p>
    <form id="payForm" method="GET" action="${zarinpalUrl}">
      <button type="submit" class="btn">
        اگر به صورت خودکار منتقل نشدید، اینجا کلیک کنید
      </button>
    </form>
  </div>
  <script>
    try {
      document.getElementById('payForm').submit();
    } catch (e) {
      window.location.replace("${zarinpalUrl}");
    }
  </script>
</body>
</html>`

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Referrer-Policy": "origin",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  })
}
