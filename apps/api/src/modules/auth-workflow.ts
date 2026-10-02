import { BadRequestException, Body, Controller, Get, Headers, Inject, Injectable, Post, UnauthorizedException, ForbiddenException, Query } from '@nestjs/common'
import { createOpaqueToken, hashOpaqueToken, hashPassword, verifyPassword } from '../platform/tokens.js'
import { SqliteStore } from '../platform/sqlite-store.js'

@Injectable()
export class AuthWorkflowService {
  private readonly store = new SqliteStore()
  private active(authorization?: string) {
    const { member } = this.session(authorization)
    if (member.membershipStatus !== 'Active') throw new ForbiddenException('Active membership is required.')
    return member
  }
  profile(authorization?: string) {
    const member = this.active(authorization)
    const row = this.store.query('SELECT payload FROM portal_profiles WHERE member_id=?', member.memberId)[0]
    return { ...member, mobile: '', industry: '', profession: '', directoryVisible: false, phoneVisible: false, ...(row ? JSON.parse(String(row.payload)) : {}) }
  }
  updateProfile(authorization: string | undefined, body: Record<string, unknown>) {
    const member = this.active(authorization)
    const fields = ['mobile', 'industry', 'profession', 'directoryVisible', 'phoneVisible']
    if (Object.keys(body).some(key => !fields.includes(key))) throw new BadRequestException('Unsupported profile field.')
    for (const key of ['mobile', 'industry', 'profession']) if (body[key] !== undefined && (typeof body[key] !== 'string' || String(body[key]).length > 160)) throw new BadRequestException('Profile text must be at most 160 characters.')
    for (const key of ['directoryVisible', 'phoneVisible']) if (body[key] !== undefined && typeof body[key] !== 'boolean') throw new BadRequestException('Visibility must be true or false.')
    return this.store.transaction(() => {
      const before = this.profile(authorization)
      const updated = { ...before, ...body }
      const payload = Object.fromEntries(fields.map(key => [key, updated[key]]))
      this.store.execute('INSERT INTO portal_profiles(member_id,payload) VALUES (?,?) ON CONFLICT(member_id) DO UPDATE SET payload=excluded.payload', member.memberId, JSON.stringify(payload))
      this.store.execute('INSERT INTO portal_profile_audit(member_id,created_at,payload) VALUES (?,?,?)', member.memberId, new Date().toISOString(), JSON.stringify({ before: Object.fromEntries(fields.map(key => [key, before[key]])), after: payload }))
      return updated
    })
  }
  directory(authorization: string | undefined, search = '', industry = '', profession = '') {
    this.active(authorization)
    for (const row of this.store.query('SELECT id FROM members')) this.store.refreshLifecycle(String(row.id))
    const entries = this.store.query('SELECT m.payload AS member, p.payload AS profile FROM members m JOIN portal_profiles p ON p.member_id=m.id')
    return entries.flatMap(row => {
      const member = JSON.parse(String(row.member)), profile = JSON.parse(String(row.profile))
      if (member.membershipStatus !== 'Active' || profile.directoryVisible !== true) return []
      if (!String(member.name ?? '').toLowerCase().includes(search.toLowerCase()) || !String(profile.industry ?? '').toLowerCase().includes(industry.toLowerCase()) || !String(profile.profession ?? '').toLowerCase().includes(profession.toLowerCase())) return []
      return [{ id: member.id, name: member.name, industry: profile.industry, profession: profile.profession, ...(profile.phoneVisible === true ? { mobile: profile.mobile } : {}) }]
    }).slice(0, 100)
  }
  private member(id: string) {
    this.store.refreshLifecycle(id)
    const row = this.store.query('SELECT payload FROM members WHERE id=?', id)[0]
    if (!row) throw new UnauthorizedException('Member unavailable.')
    const member = JSON.parse(String(row.payload))
    if (!['Active', 'Suspended'].includes(member.membershipStatus)) throw new UnauthorizedException('Membership does not permit access.')
    return { memberId: member.id, name: member.name ?? 'Member', email: member.email, membershipType: member.membershipType, membershipLabel: member.membershipLabel ?? member.membershipType, votingEligible: member.votingEligible === true, membershipStatus: member.membershipStatus, expiresAt: member.trialExpiryDate, upgradeRequired: member.upgradeRequired ?? false, graceEndsOn: member.graceEndsOn, history: member.history ?? [], mustChangePassword: false }
  }
  async setup(token: string, password: string) {
    if (password.length < 12 || password.length > 256) throw new BadRequestException('Use a password between 12 and 256 characters.')
    const passwordHash = await hashPassword(password)
    this.store.transaction(() => {
      const row = this.store.query('SELECT * FROM portal_tokens WHERE hash=? AND used=0 AND expires_at>?', hashOpaqueToken(token), Date.now())[0]
      if (!row) throw new BadRequestException('Verification link is invalid or expired.')
      this.store.execute('UPDATE portal_accounts SET password_hash=?, verified_at=? WHERE member_id=?', passwordHash, new Date().toISOString(), String(row.member_id))
      this.store.execute('UPDATE portal_tokens SET used=1 WHERE member_id=?', String(row.member_id))
      this.store.execute('DELETE FROM portal_sessions WHERE member_id=?', String(row.member_id))
      this.store.execute('DELETE FROM portal_outbox WHERE member_id=? AND template=?', String(row.member_id), 'onboarding')
    })
    return { ok: true }
  }
  requestReset(email: string) {
    const result = { message: 'If an eligible account exists, a reset link will be sent.' }
    const account = this.store.query('SELECT * FROM portal_accounts WHERE email=? AND verified_at IS NOT NULL', email.trim().toLowerCase())[0]
    if (!account) return result
    const memberId = String(account.member_id)
    try { this.member(memberId) } catch { return result }
    this.store.transaction(() => {
      // A one-minute cooldown avoids repeated requests invalidating a link immediately.
      if (this.store.query('SELECT hash FROM password_resets WHERE member_id=? AND used=0 AND expires_at>?', memberId, Date.now() + 29 * 60000).length) return
      const token = createOpaqueToken()
      this.store.execute('UPDATE password_resets SET used=1 WHERE member_id=?', memberId)
      this.store.execute('INSERT INTO password_resets(hash,member_id,expires_at) VALUES (?,?,?)', hashOpaqueToken(token), memberId, Date.now() + 30 * 60000)
      this.store.execute('INSERT INTO portal_outbox(id,member_id,recipient,template,payload) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload', `reset:${memberId}`, memberId, String(account.email), 'password-reset', JSON.stringify({ path: `/reset-password?token=${token}` }))
    })
    return result
  }
  async resetPassword(token: string, password: string) {
    if (password.length < 12 || password.length > 256) throw new BadRequestException('Use a password between 12 and 256 characters.')
    const passwordHash = await hashPassword(password)
    this.store.transaction(() => {
      const row = this.store.query('SELECT * FROM password_resets WHERE hash=? AND used=0 AND expires_at>?', hashOpaqueToken(token), Date.now())[0]
      if (!row) throw new BadRequestException('Reset link is invalid or expired.')
      const id = String(row.member_id)
      this.member(id)
      this.store.execute('UPDATE portal_accounts SET password_hash=? WHERE member_id=?', passwordHash, id)
      this.store.execute('UPDATE password_resets SET used=1 WHERE member_id=?', id)
      this.store.execute('DELETE FROM portal_sessions WHERE member_id=?', id)
      this.store.execute('DELETE FROM portal_outbox WHERE id=?', `reset:${id}`)
      this.store.execute('INSERT INTO auth_audit(member_id,action,created_at) VALUES (?,?,?)', id, 'password_reset', new Date().toISOString())
    })
    return { ok: true }
  }
  async login(email: string, password: string) {
    const account = this.store.query('SELECT * FROM portal_accounts WHERE email=?', email.trim().toLowerCase())[0]
    if (!account?.verified_at || !account.password_hash || password.length > 256 || !(await verifyPassword(password, String(account.password_hash)))) throw new UnauthorizedException('Invalid email or password.')
    const member = this.member(String(account.member_id))
    const accessToken = createOpaqueToken()
    this.store.execute('INSERT INTO portal_sessions(hash,member_id,expires_at) VALUES (?,?,?)', hashOpaqueToken(accessToken), member.memberId, Date.now() + 8 * 3600000)
    return { accessToken, member }
  }
  session(authorization?: string) {
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : ''
    const row = this.store.query('SELECT member_id FROM portal_sessions WHERE hash=? AND expires_at>?', hashOpaqueToken(token), Date.now())[0]
    if (!row) throw new UnauthorizedException('Session is missing or expired.')
    return { member: this.member(String(row.member_id)) }
  }
  logout(authorization?: string) {
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : ''
    this.store.execute('DELETE FROM portal_sessions WHERE hash=?', hashOpaqueToken(token))
    return { ok: true }
  }
}
@Controller('auth')
export class AuthWorkflowController {
  constructor(@Inject(AuthWorkflowService) private readonly auth: AuthWorkflowService) {}
  @Post('request-reset') requestReset(@Body() body: { email?: string }) { return this.auth.requestReset(String(body?.email ?? '')) }
  @Post('reset-password') resetPassword(@Body() body: { token?: string; password?: string }) { return this.auth.resetPassword(String(body?.token ?? ''), String(body?.password ?? '')) }
  @Get('profile') profile(@Headers('authorization') authorization?: string) { return this.auth.profile(authorization) }
  @Post('profile') updateProfile(@Headers('authorization') authorization: string, @Body() body: Record<string, unknown>) { return this.auth.updateProfile(authorization, body ?? {}) }
  @Get('directory') directory(@Headers('authorization') authorization: string, @Query('search') search?: string, @Query('industry') industry?: string, @Query('profession') profession?: string) { return this.auth.directory(authorization, search, industry, profession) }
  @Post('setup') setup(@Body() body: { token?: string; password?: string }) { return this.auth.setup(String(body?.token ?? ''), String(body?.password ?? '')) }
  @Post('login') login(@Body() body: { email?: string; password?: string }) { return this.auth.login(String(body?.email ?? ''), String(body?.password ?? '')) }
  @Get('session') session(@Headers('authorization') authorization?: string) { return this.auth.session(authorization) }
  @Post('logout') logout(@Headers('authorization') authorization?: string) { return this.auth.logout(authorization) }
}
