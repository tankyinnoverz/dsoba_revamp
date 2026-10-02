import { test } from 'node:test'
import assert from 'node:assert/strict'
import { membershipGraceDays, lifeUpgradeGraceEndsOn } from '../../apps/api/dist/platform/membership-grace.js'

test('grace defaults to 60 days and supports explicit configuration', () => {
  delete process.env.MEMBERSHIP_GRACE_DAYS
  assert.equal(membershipGraceDays(), 60)
  assert.equal(membershipGraceDays('90'), 90)
  for (const invalid of ['', '-1', '1.5', 'NaN']) assert.throws(() => membershipGraceDays(invalid))
})
test('deadline uses calendar days across leap years and year boundaries', () => {
  assert.equal(lifeUpgradeGraceEndsOn('2026-01-01'), '2026-03-02')
  assert.equal(lifeUpgradeGraceEndsOn('2024-01-01'), '2024-03-01')
  assert.equal(lifeUpgradeGraceEndsOn('2026-12-01'), '2027-01-30')
  assert.throws(() => lifeUpgradeGraceEndsOn('2026-02-30'))
})
