import 'reflect-metadata'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomBytes } from 'node:crypto'
import { ApplicationWorkflowService } from '../../apps/api/dist/modules/application-workflow.js'
import { requireInternalAccess } from '../../apps/api/dist/platform/internal-access.js'
import { AuthWorkflowService } from '../../apps/api/dist/modules/auth-workflow.js'
import { SqliteStore } from '../../apps/api/dist/platform/sqlite-store.js'

test('internal access requires a server credential and fails closed', () => {
  delete process.env.INTERNAL_API_TOKEN
  assert.throws(() => requireInternalAccess('Bearer admin'))
  process.env.INTERNAL_API_TOKEN = randomBytes(32).toString('hex')
  assert.throws(() => requireInternalAccess())
  assert.throws(() => requireInternalAccess('Bearer admin'))
  assert.equal(requireInternalAccess(`Bearer ${process.env.INTERNAL_API_TOKEN}`), 'internal-service')
})

test('resume token protection, persistent approval and repeat approval', async () => {
  process.env.NODE_ENV = 'test'
  process.env.SQLITE_PATH = join(mkdtempSync(join(tmpdir(), 'dsoba-acceptance-')), 'test.sqlite')
  const service = new ApplicationWorkflowService()
  const draft = service.createDraft({})
  service.saveDraft(draft.id, draft.resumeToken, { position: 'Teacher', certificateType: 'HKDSE', certificateClass: 'A', introducedBy: 'Test introducer', introducerCertificateYear: '2000', signatureName: 'Test Member', internalOnly: 'must-not-copy' })
  assert.throws(() => service.resume(draft.id, 'wrong'))
  assert.notEqual(service.get(draft.id).resumeToken, draft.resumeToken)
  assert.equal('resumeToken' in service.resume(draft.id, draft.resumeToken), false)
  service.submit(draft.id, draft.resumeToken, { firstName:'Test', lastName:'Member', dateOfBirth:'2004-01-01', profilePictureKey:'test/photo', mobile:'91234567', email:'test@example.test', classYear:2022, yearJoiningSchool:2016, yearLeavingSchool:2022, house:'Blue', membershipType:'Trial', consent:true, rulesAccepted:true })
  const first = service.approve(draft.id, 'internal-service')
  const saved = new SqliteStore().loadMembers().find(member => member.id === first.member.id)
  assert.equal(saved.applicationDetails.position, 'Teacher')
  assert.equal(saved.applicationDetails.certificateClass, 'A')
  assert.equal(saved.applicationDetails.introducerCertificateYear, '2000')
  assert.equal('internalOnly' in saved.applicationDetails, false)
  const auth = new AuthWorkflowService()
  await assert.rejects(() => auth.login('test@example.test', 'AcceptancePassword123!'))
  const store = new SqliteStore()
  const messages = store.query('SELECT payload FROM portal_outbox WHERE member_id=?', first.member.id)
  assert.equal(messages.length, 1)
  const token = new URL(JSON.parse(messages[0].payload).path, 'http://localhost').searchParams.get('token')
  await auth.setup(token, 'AcceptancePassword123!')
  await assert.rejects(() => auth.setup(token, 'DifferentPassword123!'))
  const login = await auth.login('test@example.test', 'AcceptancePassword123!')
  assert.equal(login.member.memberId, first.member.id)
  const authorization = `Bearer ${login.accessToken}`
  assert.deepEqual(auth.directory(authorization), [])
  auth.updateProfile(authorization, { mobile: '91234567', industry: 'Education', profession: 'Teacher', directoryVisible: true, phoneVisible: false })
  const visible = auth.directory(authorization, 'Test', 'Education')
  assert.equal(visible.length, 1)
  assert.equal('mobile' in visible[0], false)
  assert.equal('email' in visible[0], false)
  assert.equal('applicationDetails' in visible[0], false)
  assert.throws(() => auth.updateProfile(authorization, { membershipStatus: 'Active' }))
  assert.throws(() => auth.directory(undefined))
  auth.updateProfile(authorization, { phoneVisible: true })
  assert.equal(auth.directory(authorization)[0].mobile, '91234567')
  auth.updateProfile(authorization, { directoryVisible: false })
  assert.deepEqual(auth.directory(authorization), [])
  assert.equal(store.query('SELECT * FROM portal_profile_audit WHERE member_id=?', first.member.id).length, 3)
  const storedMember = JSON.parse(store.query('SELECT payload FROM members WHERE id=?', first.member.id)[0].payload)
  store.saveMember({ ...storedMember, membershipStatus: 'Suspended' })
  assert.equal(auth.session(authorization).member.membershipStatus, 'Suspended')
  assert.throws(() => auth.directory(authorization))
  assert.throws(() => auth.updateProfile(authorization, { directoryVisible: true }))
  store.saveMember(storedMember)
  assert.deepEqual(auth.requestReset('unknown@example.test'), auth.requestReset('test@example.test'))
  const resetMessage = store.query('SELECT payload FROM portal_outbox WHERE id=?', `reset:${first.member.id}`)[0]
  const resetToken = new URL(JSON.parse(resetMessage.payload).path, 'http://localhost').searchParams.get('token')
  await assert.rejects(() => auth.setup(resetToken, 'NewAcceptancePassword123!'))
  await auth.resetPassword(resetToken, 'NewAcceptancePassword123!')
  assert.throws(() => auth.session(authorization))
  await assert.rejects(() => auth.resetPassword(resetToken, 'OtherAcceptancePassword123!'))
  await assert.rejects(() => auth.login('test@example.test', 'AcceptancePassword123!'))
  const newLogin = await auth.login('test@example.test', 'NewAcceptancePassword123!')
  login.accessToken = newLogin.accessToken
  const restartedAuth = new AuthWorkflowService()
  assert.equal(restartedAuth.session(`Bearer ${login.accessToken}`).member.memberId, first.member.id)
  restartedAuth.logout(`Bearer ${login.accessToken}`)
  assert.throws(() => auth.session(`Bearer ${login.accessToken}`))
  const restarted = new ApplicationWorkflowService()
  const second = restarted.approve(draft.id, 'internal-service')
  assert.equal(first.member.id, second.member.id)
  assert.equal(restarted.get(draft.id).audit.filter(x => x.action === 'application_approved').length, 1)
  assert.equal(restarted.getMember(first.member.id).membershipStatus, 'Active')
  const additional = restarted.createDraft({})
  const dpsDraft = restarted.createDraft({})
  const dpsFields = { firstName: 'DPS', lastName: 'Applicant', dateOfBirth: '2004-01-01', profilePictureKey: 'test/photo', mobile: '91234567', email: 'dps@example.test', classYear: '2022', dpsOnly: true, enteredDpsYear: '2010', leftDpsYear: '2010', membershipType: 'Trial', consent: true, rulesAccepted: true }
  assert.throws(() => restarted.submit(dpsDraft.id, dpsDraft.resumeToken, { ...dpsFields, enteredDbsMonth: '13' }))
  assert.equal(restarted.submit(dpsDraft.id, dpsDraft.resumeToken, dpsFields).status, 'Pending', 'DPS-only and short attendance require review, not automatic rejection')
  restarted.submit(additional.id, additional.resumeToken, { firstName:'Other', lastName:'Member', dateOfBirth:'2004-01-01', profilePictureKey:'test/photo', mobile:'91234567', email:'other@example.test', classYear:2022, yearJoiningSchool:2016, yearLeavingSchool:2022, house:'Blue', membershipType:'Life', consent:true, rulesAccepted:true })
  assert.equal(restarted.get(additional.id).membershipType, 'Life', 'Younger applicants may request Life')
  assert.throws(() => restarted.approve(additional.id, 'internal-service'), 'Unverified payment must not activate Life')
  restarted.review(additional.id, 'internal-service', 'More Information Required', 'Please clarify school dates.')
  assert.throws(() => restarted.resume(additional.id, additional.resumeToken))
  const resumeMessage = store.query('SELECT payload FROM application_outbox WHERE application_id=?', additional.id)[0]
  additional.resumeToken = new URL(JSON.parse(resumeMessage.payload).path, 'http://localhost').searchParams.get('token')
  restarted.submit(additional.id, additional.resumeToken, {})
  restarted.review(additional.id, 'internal-service', 'Rejected', 'Eligibility not confirmed.')
  assert.throws(() => restarted.approve(additional.id, 'internal-service'))
  await assert.rejects(() => auth.login('other@example.test', 'AcceptancePassword123!'))
})
