export const DEFAULT_MEMBERSHIP_GRACE_DAYS = 60

export function membershipGraceDays(value = process.env.MEMBERSHIP_GRACE_DAYS): number {
  if (value === undefined) return DEFAULT_MEMBERSHIP_GRACE_DAYS
  if (!/^\d+$/.test(value)) throw new Error('MEMBERSHIP_GRACE_DAYS must be a non-negative integer.')
  const days = Number(value)
  if (!Number.isSafeInteger(days)) throw new Error('MEMBERSHIP_GRACE_DAYS must be a safe integer.')
  return days
}

/** Date-only boundary: suspend on this date if upgrade payment remains unverified. */
export function lifeUpgradeGraceEndsOn(trialExpiresOn: string, days = membershipGraceDays()): string {
  const date = new Date(`${trialExpiresOn}T00:00:00.000Z`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trialExpiresOn) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== trialExpiresOn) throw new Error('Invalid Trial expiry date.')
  if (!Number.isSafeInteger(days) || days < 0) throw new Error('Invalid grace period.')
  date.setUTCDate(date.getUTCDate() + days)
  if (Number.isNaN(date.getTime())) throw new Error('Grace deadline is outside the supported date range.')
  return date.toISOString().slice(0, 10)
}
