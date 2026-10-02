import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createServer } from 'node:net'
import { randomBytes } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'
import { setTimeout as delay } from 'node:timers/promises'

// Build the API first. All requests go through the real HTTP controllers;
// SQLite is read only to simulate delivery from the local email outbox.
test('HTTP acceptance: application, approval, identity, privacy and review', { timeout: 120000 }, async t => {
  const directory = mkdtempSync(join(tmpdir(), 'dsoba-http-'))
  const database = join(directory, 'acceptance.sqlite')
  const internalToken = randomBytes(32).toString('hex')
  const portProbe = createServer()
  portProbe.listen(0, '127.0.0.1')
  await once(portProbe, 'listening')
  const port = portProbe.address().port
  await new Promise(resolveClose => portProbe.close(resolveClose))
  const child = spawn(process.execPath, [resolve('apps/api/dist/main.js')], {
    env: { ...process.env, NODE_ENV: 'test', PERSISTENCE_DRIVER: 'sqlite', SQLITE_PATH: database, API_PORT: String(port), INTERNAL_API_TOKEN: internalToken },
    stdio: 'ignore', windowsHide: true
  })
  let startupError
  child.on('error', error => { startupError = error })
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = once(child, 'exit')
      child.kill()
      await exited
    }
    rmSync(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
  })
  const base = `http://127.0.0.1:${port}/api/v1`
  async function request(method, path, body, headers = {}) {
    const response = await fetch(base + path, { method, headers: { 'content-type': 'application/json', ...headers }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(5000) })
    return { status: response.status, body: await response.json() }
  }
  for (let attempt = 0; ; attempt++) {
    if (startupError) throw startupError
    assert.equal(child.exitCode, null, 'API must stay running')
    try { await request('GET', '/health'); break } catch (error) {
      if (attempt >= 450) throw new Error('API did not become reachable within 45 seconds', { cause: error })
      await delay(100)
    }
  }
  const admin = { authorization: `Bearer ${internalToken}` }
  const password = 'HttpAcceptancePassword123!'
  const fields = email => ({ firstName: 'HTTP', lastName: 'Acceptance', dateOfBirth: '2004-01-01', profilePictureKey: 'acceptance/photo', mobile: '91234567', email, classYear: 2022, yearJoiningSchool: 2016, yearLeavingSchool: 2022, house: 'Blue', membershipType: 'Trial', consent: true, rulesAccepted: true })
  const readRows = (sql, ...params) => {
    const db = new DatabaseSync(database, { readOnly: true })
    try { return db.prepare(sql).all(...params) } finally { db.close() }
  }
  const outboxToken = (memberId, template) => {
    const rows = readRows('SELECT payload FROM portal_outbox WHERE member_id=? AND template=?', memberId, template)
    assert.equal(rows.length, 1, 'Exactly one delivery message is expected')
    return new URL(JSON.parse(rows[0].payload).path, 'http://localhost').searchParams.get('token')
  }
  let draft, resume, memberId, session
  await t.test('draft token is required; validation is enforced by HTTP', async () => {
    const created = await request('POST', '/applications/draft', { email: 'http@example.test' })
    assert.equal(created.status, 201)
    draft = created.body
    resume = { 'x-resume-token': draft.resumeToken }
    for (const headers of [{}, { 'x-resume-token': 'invalid' }]) {
      assert.ok((await request('GET', `/applications/${draft.id}`, undefined, headers)).status >= 400)
    }
    const resumed = await request('GET', `/applications/${draft.id}`, undefined, resume)
    assert.equal(resumed.status, 200)
    assert.equal('resumeToken' in resumed.body, false)
    assert.equal((await request('POST', `/applications/${draft.id}/submit`, {}, resume)).status, 400)
    assert.equal((await request('POST', `/applications/${draft.id}/submit`, { ...fields('http@example.test'), rulesAccepted: false }, resume)).status, 400)
    assert.equal((await request('POST', `/applications/${draft.id}/submit`, { ...fields('http@example.test'), dateOfBirth: '2004-02-30' }, resume)).status, 400)
    assert.equal((await request('POST', `/applications/${draft.id}/draft`, fields('http@example.test'), resume)).status, 201)
    const submitted = await request('POST', `/applications/${draft.id}/submit`, {}, resume)
    assert.equal(submitted.status, 201)
    assert.equal(submitted.body.status, 'Pending')
    assert.equal((await request('POST', '/auth/login', { email: 'http@example.test', password })).status, 401)
  })
  await t.test('approval is protected and idempotent; onboarding gates access', async () => {
    assert.equal((await request('POST', `/internal/applications/${draft.id}/approve`, {}, { 'x-role': 'admin' })).status, 401)
    assert.equal((await request('GET', '/internal/applications/pending')).status, 401)
    const approved = await request('POST', `/internal/applications/${draft.id}/approve`, {}, admin)
    assert.equal(approved.status, 201)
    memberId = approved.body.member.id
    const repeated = await request('POST', `/internal/applications/${draft.id}/approve`, {}, admin)
    assert.equal(repeated.body.member.id, memberId)
    assert.equal((await request('POST', '/auth/login', { email: 'http@example.test', password })).status, 401)
    const token = outboxToken(memberId, 'onboarding')
    assert.equal((await request('POST', '/auth/setup', { token, password: 'short' })).status, 400)
    assert.equal((await request('POST', '/auth/setup', { token, password })).status, 201)
    assert.equal((await request('POST', '/auth/setup', { token, password })).status, 400)
    const login = await request('POST', '/auth/login', { email: 'http@example.test', password })
    assert.equal(login.status, 201)
    session = { authorization: `Bearer ${login.body.accessToken}` }
    assert.equal((await request('GET', '/auth/session', undefined, session)).body.member.memberId, memberId)
    assert.equal((await request('GET', `/members/${memberId}`, undefined, session)).status, 401)
  })
  await t.test('profile changes and directory privacy are enforced by the API', async () => {
    assert.equal((await request('GET', '/auth/directory')).status, 401)
    assert.deepEqual((await request('GET', '/auth/directory', undefined, session)).body, [])
    assert.equal((await request('POST', '/auth/profile', { membershipStatus: 'Active' }, session)).status, 400)
    assert.equal((await request('POST', '/auth/profile', { mobile: '91234567', industry: 'Education', profession: 'Teacher', directoryVisible: true, phoneVisible: false }, session)).status, 201)
    const entries = (await request('GET', '/auth/directory?search=HTTP&industry=Education&profession=Teacher', undefined, session)).body
    assert.equal(entries.length, 1)
    assert.equal(entries[0].id, memberId)
    for (const privateField of ['mobile', 'email', 'dateOfBirth', 'applicationDetails']) assert.equal(privateField in entries[0], false)
    assert.deepEqual((await request('GET', '/auth/directory?industry=Unmatched', undefined, session)).body, [])
    await request('POST', '/auth/profile', { phoneVisible: true }, session)
    assert.equal((await request('GET', '/auth/directory', undefined, session)).body[0].mobile, '91234567')
    await request('POST', '/auth/profile', { directoryVisible: false }, session)
    assert.deepEqual((await request('GET', '/auth/directory', undefined, session)).body, [])
    assert.equal(readRows('SELECT * FROM portal_profile_audit WHERE member_id=?', memberId).length, 3)
  })
  await t.test('password reset is single-use and revokes previous sessions; logout works', async () => {
    const unknown = await request('POST', '/auth/request-reset', { email: 'unknown@example.test' })
    const known = await request('POST', '/auth/request-reset', { email: 'http@example.test' })
    assert.deepEqual(unknown, known)
    const token = outboxToken(memberId, 'password-reset')
    const newPassword = 'HttpReplacementPassword123!'
    assert.equal((await request('POST', '/auth/setup', { token, password: newPassword })).status, 400)
    assert.equal((await request('POST', '/auth/reset-password', { token, password: newPassword })).status, 201)
    assert.equal((await request('GET', '/auth/session', undefined, session)).status, 401)
    assert.equal((await request('POST', '/auth/reset-password', { token, password: newPassword })).status, 400)
    assert.equal((await request('POST', '/auth/login', { email: 'http@example.test', password })).status, 401)
    const login = await request('POST', '/auth/login', { email: 'http@example.test', password: newPassword })
    assert.equal(login.status, 201)
    session = { authorization: `Bearer ${login.body.accessToken}` }
    assert.equal((await request('POST', '/auth/logout', {}, session)).status, 201)
    assert.equal((await request('GET', '/auth/session', undefined, session)).status, 401)
  })
  await t.test('more-information resubmission and rejection never provision an account', async () => {
    const other = (await request('POST', '/applications/draft', fields('rejected@example.test'))).body
    const access = { 'x-resume-token': other.resumeToken }
    assert.equal((await request('POST', `/applications/${other.id}/submit`, {}, access)).status, 201)
    assert.equal((await request('POST', `/internal/applications/${other.id}/review`, { decision: 'Rejected', reason: '' }, admin)).status, 400)
    const moreInfo = await request('POST', `/internal/applications/${other.id}/review`, { decision: 'More Information Required', reason: 'Please confirm school dates.' }, admin)
    assert.equal(moreInfo.body.status, 'More Information Required')
    assert.equal((await request('GET', `/applications/${other.id}`, undefined, access)).status, 404)
    const delivery = readRows('SELECT payload FROM application_outbox WHERE application_id=?', other.id)[0]
    access['x-resume-token'] = new URL(JSON.parse(delivery.payload).path, 'http://localhost').searchParams.get('token')
    assert.equal((await request('GET', `/applications/${other.id}`, undefined, access)).body.reviewReason, 'Please confirm school dates.')
    assert.equal((await request('POST', `/applications/${other.id}/draft`, { yearLeavingSchool: 2021 }, access)).status, 201)
    assert.equal((await request('POST', `/applications/${other.id}/submit`, {}, access)).body.status, 'Pending')
    assert.equal((await request('POST', `/internal/applications/${other.id}/review`, { decision: 'Rejected', reason: 'School eligibility not confirmed.' }, admin)).body.status, 'Rejected')
    assert.equal((await request('POST', `/internal/applications/${other.id}/approve`, {}, admin)).status, 400)
    assert.equal((await request('POST', '/auth/login', { email: 'rejected@example.test', password })).status, 401)
    assert.equal(readRows('SELECT member_id FROM portal_accounts WHERE email=?', 'rejected@example.test').length, 0)
  })
})
