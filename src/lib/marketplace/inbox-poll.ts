/** Chat inbox poll cadence for MarketplaceInboxProvider (ms). */
export const INBOX_POLL_MS = 30_000

/**
 * Whether a background inbox poll should run.
 * Skip when the tab is hidden to avoid wasted Fast Origin Transfer.
 */
export function shouldPollInbox(opts: {
  authenticated: boolean
  documentHidden: boolean
}): boolean {
  return opts.authenticated && !opts.documentHidden
}
