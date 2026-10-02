export interface ApiError{statusCode:number;message:string;timestamp:string}
export interface HealthResponse{status:'ok';service:string;version:string;timestamp:string}
export interface PageResult<T>{items:T[];total:number;page:number;pageSize:number}
export * from './application.js'

export type PersistedApplicationStatus='DRAFT'|'PENDING'|'MORE_INFORMATION_REQUIRED'|'APPROVED'|'REJECTED'|'WITHDRAWN'|'EXPIRED'
export type PersistedPaymentStatus='NOT_REQUIRED'|'UNPAID'|'ONLINE_PAYMENT_PENDING'|'PROOF_UPLOADED'|'VERIFYING'|'PAID'|'FAILED'|'REFUNDED'
export type PersistedMembershipType='YOUTH'|'TRIAL'|'LIFE'
/** Account/persona classification; this is intentionally separate from membership type. */
export type MemberAccountType='GUEST'|'APPLICANT'|'MEMBER'
/** Lifecycle state; legacy/source values not yet mapped remain in legacyStatus. */
export type MembershipLifecycleStatus='PENDING'|'ACTIVE'|'SUSPENDED'|'EXPIRED'|'TERMINATED'|'DECEASED'|'REJECTED'|'WITHDRAWN'|'CANCELLED'
export type AccountStatus='PENDING'|'ACTIVE'|'SUSPENDED'|'DISABLED'
export interface ApplicationRecord {
  id:string
  reference:string
  email:string
  status:PersistedApplicationStatus
  paymentStatus:PersistedPaymentStatus
  membershipType:PersistedMembershipType|null
}
export interface CreateApplicationRequest {
  email:string
  firstName:string
  lastName:string
  dateOfBirth:string
  mobile:string
  classYear:number
  yearJoiningSchool:number
  yearLeavingSchool:number
  house:string
  membershipType?:PersistedMembershipType
  comments?:string
  consent:boolean
}
export interface CreateApplicationResponse {
  application:ApplicationRecord
  resumeToken?:string
}
export interface AccountSummary {
  id:string
  email:string
  status:AccountStatus
  emailVerifiedAt:string|null
  forcePasswordSetup:boolean
}
export interface SignedObjectUrl {url:string;expiresAt:string}
export interface PaymentProviderCallback {
  providerReference:string
  idempotencyKey:string
  status:'PAID'|'FAILED'
  amountHkd:number
  occurredAt:string
}
