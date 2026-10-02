// Operator-only local inbox for development. Do not expose through a public API.
import { DatabaseSync } from 'node:sqlite'
const db = new DatabaseSync(process.env.SQLITE_PATH ?? 'data/dsoba.sqlite', { readOnly: true })
const rows = db.prepare('SELECT recipient, payload FROM portal_outbox WHERE template IN (?,?)').all('onboarding', 'password-reset')
for (const row of rows) console.log(`${row.recipient}: http://localhost:3001${JSON.parse(row.payload).path}`)
const applications = db.prepare('SELECT recipient,payload FROM application_outbox').all()
for (const row of applications) console.log(`${row.recipient}: http://localhost:3000${JSON.parse(row.payload).path}`)
db.close()
