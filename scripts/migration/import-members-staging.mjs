import fs from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const input = process.argv.slice(2).find((argument) => !argument.startsWith('--')) ?? 'resources/Old_Data/Members.csv'
const apply = process.argv.includes('--apply')
const report = process.argv.includes('--report')
const dbPath = process.env.SQLITE_PATH ?? 'data/dsoba.sqlite'
const batch = process.env.IMPORT_BATCH ?? new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)

function parseCsv(text) {
  const rows = []; let row = []; let value = ''; let quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i]; const n = text[i + 1]
    if (quoted) { if (c === '"' && n === '"') { value += '"'; i += 1 } else if (c === '"') quoted = false; else value += c }
    else if (c === '"') quoted = true
    else if (c === ',') { row.push(value); value = '' }
    else if (c === '\n') { row.push(value.replace(/\r$/, '')); rows.push(row); row = []; value = '' }
    else value += c
  }
  if (value.length || row.length) { row.push(value); rows.push(row) }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''))
}

const rows = parseCsv(fs.readFileSync(input, 'utf8'))
const rawHeaders = rows.shift() ?? []
const seen = new Map()
const headers = rawHeaders.map((header) => { const count = (seen.get(header) ?? 0) + 1; seen.set(header, count); return count === 1 ? header : `${header} [${count}]` })
const position = (name) => headers.indexOf(name)
const get = (row, name) => String(row[position(name)] ?? '').trim()
const statusMap = { Active: 'ACTIVE', Suspended: 'SUSPENDED', Pending: 'PENDING', 'Trial Expired': 'EXPIRED', Terminated: 'TERMINATED', Deceased: 'DECEASED' }
const typeMap = { 'Life Member': 'LIFE', 'Trial Member': 'TRIAL', Youth: 'YOUTH' }
const emailCounts = new Map(); const memberNumberCounts = new Map()
for (const row of rows) { const email = get(row, 'Email Address').toLowerCase(); const number = get(row, 'Member Number'); if (email) emailCounts.set(email, (emailCounts.get(email) ?? 0) + 1); if (number) memberNumberCounts.set(number, (memberNumberCounts.get(number) ?? 0) + 1) }

let ready = 0; let quarantined = 0; const reasons = new Map()
const quarantineRows = []
const db = apply ? new DatabaseSync(resolve(dbPath)) : null
if (db) {
  mkdirSync(dirname(resolve(dbPath)), { recursive: true })
  db.exec('CREATE TABLE IF NOT EXISTS legacy_member_import_staging (id INTEGER PRIMARY KEY AUTOINCREMENT, import_batch TEXT NOT NULL, source_row_number INTEGER NOT NULL, legacy_id TEXT, raw_payload TEXT NOT NULL, validation_status TEXT NOT NULL, validation_errors TEXT, UNIQUE(import_batch, source_row_number))')
}
const insert = db?.prepare('INSERT INTO legacy_member_import_staging (import_batch, source_row_number, legacy_id, raw_payload, validation_status, validation_errors) VALUES (?, ?, ?, ?, ?, ?)')

for (let i = 0; i < rows.length; i += 1) {
  const row = rows[i]
  const email = get(row, 'Email Address').toLowerCase(); const memberNumber = get(row, 'Member Number')
  const sourceStatus = get(row, 'Member Status'); const sourceType = get(row, 'Membership Type  (cancel)')
  const errors = []
  if (!get(row, 'ID')) errors.push('missing_legacy_id')
  if (!get(row, 'First Name') && !get(row, 'Last Name')) errors.push('missing_name')
  if (email && emailCounts.get(email) > 1) errors.push('duplicate_email')
  if (memberNumber && memberNumberCounts.get(memberNumber) > 1) errors.push('duplicate_member_number')
  if (sourceStatus && !statusMap[sourceStatus]) errors.push('unmapped_status')
  if (sourceType && !typeMap[sourceType] && sourceType !== 'Guest') errors.push('unmapped_membership_type')
  const status = errors.length ? 'QUARANTINED' : 'READY'
  if (status === 'READY') ready += 1; else quarantined += 1
  for (const reason of errors) reasons.set(reason, (reasons.get(reason) ?? 0) + 1)
  if (report && errors.length) quarantineRows.push([i + 2, get(row, 'ID'), get(row, 'First Name'), get(row, 'Last Name'), email, memberNumber, errors.join('|')])
  if (insert) {
    const payload = { legacyId: get(row, 'ID'), firstName: get(row, 'First Name'), lastName: get(row, 'Last Name'), displayNameZh: get(row, 'Chinese Name'), email: email || null, mobile: get(row, 'Mobile') || null, dateOfBirth: get(row, 'Birthdate') || null, memberNumber: memberNumber || null, accountType: sourceType === 'Guest' ? 'GUEST' : 'MEMBER', membershipStatus: statusMap[sourceStatus] ?? null, membershipType: typeMap[sourceType] ?? null, legacyStatus: sourceStatus || null, legacyMembershipType: sourceType || null }
    insert.run(batch, i + 2, payload.legacyId, JSON.stringify(payload), status, JSON.stringify(errors))
  }
}
db?.close()
if (report) {
  const escape = (value) => `"${String(value).replaceAll('"', '""')}"`
  const reportPath = 'resources/Old_Data/Members.quarantine.csv'
  fs.writeFileSync(reportPath, [['sourceRow', 'legacyId', 'firstName', 'lastName', 'email', 'memberNumber', 'reasons'], ...quarantineRows].map((row) => row.map(escape).join(',')).join('\n') + '\n', 'utf8')
}
console.log(JSON.stringify({ input, batch, mode: apply ? 'apply' : 'dry-run', rows: rows.length, ready, quarantined, reasons: Object.fromEntries(reasons) }, null, 2))
