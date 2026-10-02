// Local-development persistence. Production uses the MySQL migrations.
// Node 24 provides node:sqlite; the API deployment must use the documented runtime.
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { createOpaqueToken, hashOpaqueToken } from './tokens.js'
import { evaluateLifecycle, type LifecycleMember } from './membership-lifecycle.js'

export class SqliteStore {
  private readonly db: InstanceType<typeof DatabaseSync>

  constructor(filePath = process.env.SQLITE_PATH ?? 'data/dsoba.sqlite') {
    const resolved = resolve(filePath)
    mkdirSync(dirname(resolved), { recursive: true })
    this.db = new DatabaseSync(resolved)
    this.db.exec('PRAGMA busy_timeout=5000')
    this.db.exec('CREATE TABLE IF NOT EXISTS application_outbox (id TEXT PRIMARY KEY, application_id TEXT NOT NULL, recipient TEXT NOT NULL, template TEXT NOT NULL, payload TEXT NOT NULL)')
    this.db.exec('CREATE TABLE IF NOT EXISTS password_resets (hash TEXT PRIMARY KEY, member_id TEXT NOT NULL, expires_at INTEGER NOT NULL, used INTEGER NOT NULL DEFAULT 0); CREATE TABLE IF NOT EXISTS auth_audit (id INTEGER PRIMARY KEY, member_id TEXT NOT NULL, action TEXT NOT NULL, created_at TEXT NOT NULL)')
    this.db.exec('CREATE TABLE IF NOT EXISTS portal_profiles (member_id TEXT PRIMARY KEY, payload TEXT NOT NULL); CREATE TABLE IF NOT EXISTS portal_profile_audit (id INTEGER PRIMARY KEY, member_id TEXT NOT NULL, created_at TEXT NOT NULL, payload TEXT NOT NULL)')
    this.db.exec('CREATE TABLE IF NOT EXISTS applications (id TEXT PRIMARY KEY, payload TEXT NOT NULL)')
    this.db.exec('CREATE TABLE IF NOT EXISTS members (id TEXT PRIMARY KEY, payload TEXT NOT NULL)')
    this.db.exec(`CREATE TABLE IF NOT EXISTS portal_accounts (member_id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT, verified_at TEXT);
      CREATE TABLE IF NOT EXISTS portal_tokens (hash TEXT PRIMARY KEY, member_id TEXT NOT NULL, expires_at INTEGER NOT NULL, used INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE IF NOT EXISTS portal_sessions (hash TEXT PRIMARY KEY, member_id TEXT NOT NULL, expires_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS portal_outbox (id TEXT PRIMARY KEY, member_id TEXT NOT NULL, recipient TEXT NOT NULL, template TEXT NOT NULL, payload TEXT NOT NULL);`)
  }

  query(sql: string, ...values: Array<string | number>) { return this.db.prepare(sql).all(...values) }
  execute(sql: string, ...values: Array<string | number>) { return this.db.prepare(sql).run(...values) }
  transaction<T>(work: () => T): T {
    const name = 'tx_' + createOpaqueToken(8).replace(/[^a-zA-Z0-9]/g, '')
    this.db.exec(`SAVEPOINT ${name}`)
    try { const result = work(); this.db.exec(`RELEASE ${name}`); return result } catch (error) { this.db.exec(`ROLLBACK TO ${name}`); this.db.exec(`RELEASE ${name}`); throw error }
  }
  refreshLifecycle(id: string, today?: string) {
    return this.transaction(() => {
      const row = this.query('SELECT payload FROM members WHERE id=?', id)[0]
      if (!row) return undefined
      const before = JSON.parse(String(row.payload)) as LifecycleMember
      const member = evaluateLifecycle(before, today)
      if (JSON.stringify(member) !== JSON.stringify(before)) this.saveMember(member)
      return member
    })
  }

  loadApplications<T>() { return this.load<T>('applications') }
  loadMembers<T>() { return this.load<T>('members') }
  saveApplication(value: { id: string }) { this.save('applications', value.id, value) }
  saveMember(value: { id: string }) { this.save('members', value.id, value) }
  saveApproval(application: { id: string }, member: { id: string; email: string }) {
    this.db.exec('BEGIN IMMEDIATE')
    try {
      this.saveApplication(application)
      this.saveMember(member)
      const token = createOpaqueToken()
      this.execute('INSERT INTO portal_accounts(member_id,email) VALUES (?,?)', member.id, member.email.trim().toLowerCase())
      this.execute('INSERT INTO portal_tokens(hash,member_id,expires_at) VALUES (?,?,?)', hashOpaqueToken(token), member.id, Date.now() + 86400000)
      this.execute('INSERT INTO portal_outbox(id,member_id,recipient,template,payload) VALUES (?,?,?,?,?)', `onboarding:${member.id}`, member.id, member.email, 'onboarding', JSON.stringify({ path: `/verify?token=${token}` }))
      this.db.exec('COMMIT')
    } catch (error) {
      this.db.exec('ROLLBACK')
      throw error
    }
  }

  private load<T>(table: string) {
    return this.db.prepare(`SELECT payload FROM ${table}`).all().map((row: any) => JSON.parse(String(row.payload)) as T)
  }

  private save(table: string, id: string, value: unknown) {
    this.db.prepare(`INSERT INTO ${table} (id, payload) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload`).run(id, JSON.stringify(value))
  }
}
