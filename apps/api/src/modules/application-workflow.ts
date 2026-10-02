import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { SqliteStore } from '../platform/sqlite-store.js'
import { createOpaqueToken, hashOpaqueToken } from '../platform/tokens.js'
import { trialExpiresOn, evaluateLifecycle } from '../platform/membership-lifecycle.js'

export type ApplicationStatus = 'Draft' | 'Pending' | 'More Information Required' | 'Approved' | 'Rejected' | 'Withdrawn' | 'Expired'
export type PaymentStatus = 'Not Required' | 'Unpaid' | 'Online Payment Pending' | 'Proof Uploaded' | 'Verifying' | 'Paid' | 'Failed' | 'Refunded'
export type MembershipType = 'Youth' | 'Trial' | 'Life'

export interface ApplicationRecord {
  id: string
  resumeToken: string
  resumeExpiresAt?: string
  status: ApplicationStatus
  paymentStatus: PaymentStatus
  membershipType: MembershipType
  fields: Record<string, unknown>
  memberId?: string
  reviewReason?: string
  declarationAcceptedAt?: string
  createdAt: string
  updatedAt: string
  audit: Array<{ actor: string; action: string; at: string; previousStatus?: ApplicationStatus; nextStatus?: ApplicationStatus }>
}

export interface MemberRecord {
  applicationDetails?: Record<string, unknown>
  dateOfBirth?: string
  name: string
  id: string
  applicationId: string
  email: string
  membershipType: MembershipType
  membershipStatus: 'Active' | 'Pending' | 'Suspended'
  trialExpiryDate?: string
  createdAt: string
}

const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'profilePictureKey', 'mobile', 'email', 'classYear', 'yearJoiningSchool', 'yearLeavingSchool', 'house', 'membershipType', 'consent']

@Injectable()
export class ApplicationWorkflowService {
  private readonly applications = new Map<string, ApplicationRecord>()
  private readonly members = new Map<string, MemberRecord>()
  private readonly store: SqliteStore

  constructor() {
    if (process.env.NODE_ENV === 'production' || process.env.PERSISTENCE_DRIVER === 'mysql') {
      throw new Error('MySQL persistence adapter is required before production startup.')
    }
    this.store = new SqliteStore()
    for (const application of this.store.loadApplications<ApplicationRecord>()) this.applications.set(application.id, application)
    for (const member of this.store.loadMembers<MemberRecord>()) this.members.set(member.id, member)
  }

  createDraft(fields: Record<string, unknown> = {}) {
    const now = new Date().toISOString()
    const token = createOpaqueToken()
    const record: ApplicationRecord = {
      id: 'app_' + randomUUID(),
      resumeToken: hashOpaqueToken(token),
      resumeExpiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      status: 'Draft',
      paymentStatus: 'Not Required',
      membershipType: this.deriveMembershipType(fields),
      fields,
      createdAt: now,
      updatedAt: now,
      audit: [{ actor: 'anonymous', action: 'draft_created', at: now, nextStatus: 'Draft' }]
    }
    this.store.transaction(() => { this.store.saveApplication(record); this.queueResume(record, token) })
    this.applications.set(record.id, record)
    return { id: record.id, resumeToken: token, status: record.status, updatedAt: record.updatedAt }
  }

  resume(id: string, token: string) { return this.publicApplication(this.getByToken(id, token)) }

  saveDraft(id: string, resumeToken: string, fields: Record<string, unknown>) {
    const record = structuredClone(this.getByToken(id, resumeToken))
    if (!['Draft', 'More Information Required'].includes(record.status)) throw new BadRequestException('Application is not editable.')
    record.fields = { ...record.fields, ...fields }
    record.membershipType = this.deriveMembershipType(record.fields)
    record.updatedAt = new Date().toISOString()
    this.store.transaction(() => { this.store.saveApplication(record); this.queueResume(record, resumeToken) })
    this.applications.set(record.id, record)
    return this.publicApplication(record)
  }

  submit(id: string, resumeToken: string, fields: Record<string, unknown>) {
    const record = structuredClone(this.getByToken(id, resumeToken))
    if (!['Draft', 'More Information Required'].includes(record.status)) throw new BadRequestException('Application cannot be submitted.')
    record.fields = { ...record.fields, ...fields }
    const schoolFields = ['yearJoiningSchool', 'yearLeavingSchool', 'house']
    const required = record.fields.dpsOnly === true ? [...requiredFields.filter(field => !schoolFields.includes(field)), 'enteredDpsYear', 'leftDpsYear'] : requiredFields
    const missing = required.filter((field) => record.fields[field] === undefined || record.fields[field] === null || record.fields[field] === '')
    if (missing.length) throw new BadRequestException('Missing required fields: ' + missing.join(', '))
    const dob = String(record.fields.dateOfBirth)
    const parsed = new Date(dob)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== dob || parsed > new Date()) throw new BadRequestException('A valid date of birth is required.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(record.fields.email))) throw new BadRequestException('A valid email is required.')
    if (record.fields.consent !== true) throw new BadRequestException('Consent is required.')
    if (record.fields.rulesAccepted !== true) throw new BadRequestException('Rules and by-laws acknowledgement is required.')
    const joined = Number(record.fields.dpsOnly === true ? record.fields.enteredDpsYear : record.fields.yearJoiningSchool), left = Number(record.fields.dpsOnly === true ? record.fields.leftDpsYear : record.fields.yearLeavingSchool)
    if (!Number.isInteger(joined) || !Number.isInteger(left) || joined < parsed.getUTCFullYear() || left < joined) throw new BadRequestException('School entry and leaving years must be valid and in order.')
    for (const key of ['enteredDbsMonth', 'leftDbsMonth']) {
      const value = record.fields[key]
      if (value !== undefined && value !== '' && !/^(0[1-9]|1[0-2])$/.test(String(value))) throw new BadRequestException('School months must be 01–12.')
    }
    if (record.fields.dpsOnly !== true && joined === left && record.fields.enteredDbsMonth && record.fields.leftDbsMonth && String(record.fields.enteredDbsMonth) > String(record.fields.leftDbsMonth)) throw new BadRequestException('Leaving month must not precede entry month.')
    for (const key of ['dpsOnly', 'certificateYearProjected']) if (record.fields[key] !== undefined && typeof record.fields[key] !== 'boolean') throw new BadRequestException(`${key} must be true or false.`)
    if (String(record.fields.comments ?? '').length > 300) throw new BadRequestException('Comments must not exceed 300 characters.')
    record.membershipType = this.deriveMembershipType(record.fields)
    record.paymentStatus = record.membershipType === 'Life' ? 'Unpaid' : 'Not Required'
    const previousStatus = record.status
    record.status = 'Pending'
    record.reviewReason = undefined
    record.declarationAcceptedAt = new Date().toISOString()
    record.updatedAt = new Date().toISOString()
    record.audit.push({ actor: 'anonymous', action: 'application_submitted', at: record.updatedAt, previousStatus, nextStatus: 'Pending' })
    this.store.transaction(() => {
      this.store.saveApplication(record)
      this.store.execute('DELETE FROM application_outbox WHERE application_id=?', record.id)
    })
    this.applications.set(record.id, record)
    return this.publicApplication(record)
  }

  listPending() {
    return [...this.applications.values()].filter((record) => record.status === 'Pending').map((record) => this.publicApplication(record))
  }

  review(id: string, actor: string, decision: string, reason: string) {
    if (!['Rejected', 'More Information Required'].includes(decision) || !reason.trim() || reason.length > 2000) throw new BadRequestException('A valid decision and reason are required.')
    const record = structuredClone(this.get(id))
    if (record.status !== 'Pending') throw new BadRequestException('Only Pending applications can be reviewed.')
    record.status = decision as ApplicationStatus
    record.reviewReason = reason.trim()
    record.updatedAt = new Date().toISOString()
    record.audit.push({ actor, action: `${decision}: ${reason}`, at: record.updatedAt, previousStatus: 'Pending', nextStatus: record.status })
    this.store.transaction(() => {
      if (decision === 'More Information Required') {
        const token = createOpaqueToken()
        record.resumeToken = hashOpaqueToken(token)
        record.resumeExpiresAt = new Date(Date.now() + 7 * 86400000).toISOString()
        this.queueResume(record, token)
      } else {
        this.store.execute('DELETE FROM application_outbox WHERE application_id=?', record.id)
      }
      this.store.saveApplication(record)
    })
    this.applications.set(id, record)
    return this.publicApplication(record)
  }

  approve(id: string, actor: string) {
    const record = structuredClone(this.get(id))
    if (record.status === 'Approved' && record.memberId) {
      const member = this.store.refreshLifecycle(record.memberId)
      if (member) return { application: this.publicApplication(record), member }
    }
    if (record.status !== 'Pending') throw new BadRequestException('Only Pending applications can be approved.')
    if (record.membershipType === 'Life' && record.paymentStatus !== 'Paid') throw new BadRequestException('Verified Life payment is required before activation.')
    const now = new Date().toISOString()
    record.status = 'Approved'
    record.memberId = 'mem_' + randomUUID()
    record.audit.push({ actor, action: 'application_approved', at: now, previousStatus: 'Pending', nextStatus: 'Approved' })
    record.updatedAt = now
    const dob = new Date(String(record.fields.dateOfBirth))
    const trialExpiryDate = new Date(dob)
    trialExpiryDate.setFullYear(trialExpiryDate.getFullYear() + 28)
    const member: MemberRecord = evaluateLifecycle({
      applicationDetails: Object.fromEntries(['middleName', 'chineseName', 'maritalStatus', 'addressLine1', 'addressLine2', 'city', 'region', 'postalCode', 'country', 'mobile', 'homePhone', 'companyName', 'industry', 'occupation', 'position', 'officePhone', 'classYear', 'yearJoiningSchool', 'yearLeavingSchool', 'enteredDbsMonth', 'leftDbsMonth', 'house', 'certificateType', 'certificateClass', 'certificateYearProjected', 'dpsOnly', 'enteredDpsYear', 'leftDpsYear', 'otherClubs', 'college', 'degree', 'graduationYear', 'joiningSource', 'introducedBy', 'introducerCertificateYear', 'signatureName'].filter(key => record.fields[key] !== undefined).map(key => [key, record.fields[key]])),
      dateOfBirth: String(record.fields.dateOfBirth),
      name: `${record.fields.firstName} ${record.fields.lastName}`,
      id: record.memberId,
      applicationId: record.id,
      email: String(record.fields.email),
      membershipType: record.membershipType,
      membershipStatus: 'Active',
      trialExpiryDate: record.membershipType === 'Trial' ? trialExpiresOn(String(record.fields.dateOfBirth)) : undefined,
      createdAt: now
    })
    this.store.saveApproval(record, member)
    this.applications.set(record.id, record)
    this.members.set(member.id, member)
    return { application: this.publicApplication(record), member }
  }

  getMember(id: string) {
    const member = this.store.refreshLifecycle(id)
    if (!member) throw new NotFoundException('Member not found.')
    return member
  }

  get(id: string) {
    const record = this.applications.get(id)
    if (!record) throw new NotFoundException('Application not found.')
    return record
  }

  private getByToken(id: string, resumeToken: string) {
    const record = this.get(id)
    if (!resumeToken || !record.resumeExpiresAt || Date.parse(record.resumeExpiresAt) <= Date.now() || record.resumeToken !== hashOpaqueToken(resumeToken)) throw new NotFoundException('Application resume link is invalid or expired.')
    return record
  }

  private deriveMembershipType(fields: Record<string, unknown>): MembershipType {
    // This is the requested application path, never evidence of verified payment.
    if (fields.membershipType === 'Life') return 'Life'
    const dob = new Date(String(fields.dateOfBirth ?? ''))
    if (Number.isNaN(dob.getTime())) return 'Trial'
    const now = new Date()
    let age = now.getFullYear() - dob.getFullYear()
    const beforeBirthday = now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())
    if (beforeBirthday) age -= 1
    return age < 18 ? 'Youth' : 'Trial'
  }

  private publicApplication(record: ApplicationRecord) {
    return { id: record.id, status: record.status, paymentStatus: record.paymentStatus, membershipType: record.membershipType, fields: record.fields, memberId: record.memberId, reviewReason: record.reviewReason, createdAt: record.createdAt, updatedAt: record.updatedAt }
  }

  private queueResume(record: ApplicationRecord, token: string) {
    const recipient = String(record.fields.email ?? '').trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) return
    this.store.execute('INSERT INTO application_outbox(id,application_id,recipient,template,payload) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET recipient=excluded.recipient,template=excluded.template,payload=excluded.payload',
      `resume:${record.id}`, record.id, recipient, record.status === 'More Information Required' ? 'more-information' : 'draft-resume',
      JSON.stringify({ path: `/membership/apply?id=${encodeURIComponent(record.id)}&token=${encodeURIComponent(token)}`, expiresAt: record.resumeExpiresAt, reason: record.reviewReason }))
  }
}
