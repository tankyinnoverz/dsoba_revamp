import { test } from 'node:test'
import assert from 'node:assert/strict'
import { evaluateLifecycle, hongKongDate } from '../../apps/api/dist/platform/membership-lifecycle.js'
import { SqliteStore } from '../../apps/api/dist/platform/sqlite-store.js'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
test('Youth transition, 60-day boundary, terminal states and replay', () => {
  delete process.env.MEMBERSHIP_GRACE_DAYS
  const youth = { id:'test', membershipType:'Youth', membershipStatus:'Active', dateOfBirth:'2008-01-01' }
  assert.equal(evaluateLifecycle(youth, '2025-12-31').membershipType, 'Youth')
  const trial = evaluateLifecycle(youth, '2026-01-01')
  assert.equal(trial.membershipType, 'Trial')
  assert.equal(trial.trialExpiryDate, '2036-12-31')
  assert.equal(evaluateLifecycle(trial, '2036-12-31').upgradeRequired, undefined)
  const due = evaluateLifecycle(trial, '2037-01-01')
  assert.equal(due.graceEndsOn, '2037-03-01')
  assert.equal(evaluateLifecycle(due, '2037-02-28').membershipStatus, 'Active')
  const suspended = evaluateLifecycle(due, '2037-03-01')
  assert.equal(suspended.membershipStatus, 'Suspended')
  assert.deepEqual(evaluateLifecycle(suspended, '2036-04-01'), suspended)
  for (const membershipStatus of ['Terminated', 'Deceased', 'Suspended']) {
    const record = { ...trial, membershipStatus }
    assert.deepEqual(evaluateLifecycle(record, '2040-01-01'), record)
  }
  assert.equal(hongKongDate(new Date('2026-09-29T16:00:00Z')), '2026-09-30')
})
test('Life Youth voting record changes at 18 without changing membership type', () => {
  const member = { id:'life', membershipType:'Life', membershipStatus:'Active', dateOfBirth:'2008-10-01' }
  assert.equal(evaluateLifecycle(member, '2026-09-30').membershipLabel, 'Life (Youth)')
  assert.equal(evaluateLifecycle(member, '2026-09-30').votingEligible, false)
  assert.equal(evaluateLifecycle(member, '2026-10-01').votingEligible, true)
  assert.equal(evaluateLifecycle(member, '2026-10-01').membershipType, 'Life')
})
test('lifecycle history persists and repeat reconciliation does not duplicate it', () => {
  const file = join(mkdtempSync(join(tmpdir(), 'dsoba-lifecycle-')), 'test.sqlite')
  const store = new SqliteStore(file)
  store.saveMember({ id:'member', membershipType:'Trial', membershipStatus:'Active', trialExpiryDate:'2026-01-01' })
  const result = store.refreshLifecycle('member', '2026-03-02')
  assert.equal(result.membershipStatus, 'Suspended')
  assert.equal(result.history.length, 2)
  const restarted = new SqliteStore(file)
  assert.deepEqual(restarted.refreshLifecycle('member', '2026-03-03'), result)
})
