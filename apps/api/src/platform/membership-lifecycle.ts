import { lifeUpgradeGraceEndsOn } from './membership-grace.js'
export interface LifecycleMember {
  id: string; membershipType: string; membershipStatus: string; dateOfBirth?: string; trialExpiryDate?: string; upgradeRequired?: boolean; graceEndsOn?: string
  membershipLabel?: string; votingEligible?: boolean
  history?: Array<{ action: string; effectiveOn: string; previousType: string; previousStatus: string; nextType: string; nextStatus: string }>
}
export function hongKongDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)!.value).join('-')
}
export function birthdayOn(dob: string, age: number): string {
  const date = new Date(`${dob}T00:00:00Z`)
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dob) throw new Error('Invalid birth date.')
  date.setUTCFullYear(date.getUTCFullYear() + age)
  return date.toISOString().slice(0, 10)
}
export function evaluateLifecycle<T extends LifecycleMember>(source: T, today = hongKongDate()): T {
  const member = structuredClone(source)
  const adult = Boolean(member.dateOfBirth && today >= birthdayOn(member.dateOfBirth, 18))
  member.membershipLabel = member.membershipType === 'Life' && !adult ? 'Life (Youth)' : member.membershipType
  member.votingEligible = member.membershipType === 'Life' && adult && member.membershipStatus === 'Active'
  if (member.membershipStatus !== 'Active' || member.membershipType === 'Life') return member
  const record = (action: string, effectiveOn: string, nextType: string, nextStatus: string) => {
    member.history ??= []
    member.history.push({ action, effectiveOn, previousType: member.membershipType, previousStatus: member.membershipStatus, nextType, nextStatus })
    member.membershipType = nextType; member.membershipStatus = nextStatus
  }
  if (member.membershipType === 'Youth' && member.dateOfBirth && today >= birthdayOn(member.dateOfBirth, 18)) {
    record('youth_to_trial', birthdayOn(member.dateOfBirth, 18), 'Trial', 'Active')
    member.trialExpiryDate = trialExpiresOn(member.dateOfBirth)
    member.membershipLabel = 'Trial'
  }
  if (member.membershipType === 'Trial' && member.trialExpiryDate && today > member.trialExpiryDate) {
    if (!member.upgradeRequired) {
      member.upgradeRequired = true; member.graceEndsOn = lifeUpgradeGraceEndsOn(member.trialExpiryDate)
      record('life_upgrade_due', member.trialExpiryDate, 'Trial', 'Active')
    }
    if (member.graceEndsOn && today >= member.graceEndsOn) record('grace_expired', member.graceEndsOn, 'Trial', 'Suspended')
  }
  return member
}
export function trialExpiresOn(dob: string): string { return `${birthdayOn(dob, 28).slice(0, 4)}-12-31` }
