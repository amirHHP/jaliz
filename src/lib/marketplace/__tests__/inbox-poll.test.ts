import { describe, expect, it } from "vitest"

import { INBOX_POLL_MS, shouldPollInbox } from "../inbox-poll"

describe("shouldPollInbox", () => {
  it("polls only when authenticated and tab is visible", () => {
    expect(
      shouldPollInbox({ authenticated: true, documentHidden: false }),
    ).toBe(true)
    expect(
      shouldPollInbox({ authenticated: true, documentHidden: true }),
    ).toBe(false)
    expect(
      shouldPollInbox({ authenticated: false, documentHidden: false }),
    ).toBe(false)
  })

  it("uses a slower cadence than the previous 4s full reload", () => {
    expect(INBOX_POLL_MS).toBeGreaterThanOrEqual(15_000)
  })
})
