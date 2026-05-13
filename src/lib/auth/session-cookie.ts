/**
 * Session cookie `Secure` flag.
 * In production, Next sets NODE_ENV=production even on plain HTTP (e.g. VM IP:port).
 * Browsers ignore Secure cookies on http://, so login never sticks unless HTTPS is used
 * or COOKIE_SECURE is set to "false".
 */
export function useSecureSessionCookie(): boolean {
  if (process.env.COOKIE_SECURE === "true") return true
  if (process.env.COOKIE_SECURE === "false") return false
  return process.env.NODE_ENV === "production"
}
