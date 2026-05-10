import { AuthError, AuthErrorCode } from "./types"

const TRANSLATION_KEY_BY_CODE: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: "auth_error_invalid_credentials",
  EMAIL_EXISTS: "auth_error_email_exists",
  USER_INACTIVE: "auth_error_user_inactive",
  USER_NOT_FOUND: "auth_error_user_not_found",
  WEAK_PASSWORD: "auth_error_weak_password",
  INVALID_EMAIL: "auth_error_invalid_email",
  EMPTY_FIELD: "auth_error_empty_field",
  FORBIDDEN: "auth_error_generic",
  GENERIC: "auth_error_generic",
}

/** Map an unknown thrown value to the i18n key the UI should render. */
export function authErrorTranslationKey(err: unknown): string {
  if (err instanceof AuthError) {
    return TRANSLATION_KEY_BY_CODE[err.code] ?? "auth_error_generic"
  }
  return "auth_error_generic"
}
