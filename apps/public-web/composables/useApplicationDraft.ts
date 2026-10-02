import type { ApplicationConfirmation, ApplicationContact, ApplicationEducation, ApplicationProfile, ApplicationStatus, MembershipApplication, MembershipType } from '@dsoba/types'

const storageKey = 'dsoba-public-application-draft'
const apiStateKey = 'dsoba-public-application-api'
const blankProfile = (): ApplicationProfile => ({ firstName: '', lastName: '', middleName: '', chineseName: '', dateOfBirth: '', maritalStatus: '', profilePictureName: '' })
const blankContact = (): ApplicationContact => ({ addressLine1: '', addressLine2: '', city: '', region: '', postalCode: '', country: 'Hong Kong', homePhone: '', mobile: '', email: '', companyName: '', industry: '', occupation: '', officePhone: '' })
const blankEducation = (): ApplicationEducation => ({ classYear: '', yearJoined: '', yearLeft: '', house: '', studiedTwoYears: true, hobbies: '', college: '', degree: '', graduationYear: '' })
const blankConfirmation = (): ApplicationConfirmation => ({ reason: '', introducedBy: '', comments: '', membershipType: 'Trial', rulesAccepted: false, consentAccepted: false })

export const recommendedMembership = (dateOfBirth: string): MembershipType => {
  if (!dateOfBirth) return 'Trial'
  const birth = new Date(dateOfBirth + 'T00:00:00')
  if (Number.isNaN(birth.getTime())) return 'Trial'
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const beforeBirthday = now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
  if (beforeBirthday) age -= 1
  return age < 18 ? 'Youth' : 'Trial'
}

export const useApplicationDraft = () => {
  const profile = useState<ApplicationProfile>('application-profile', blankProfile)
  const contact = useState<ApplicationContact>('application-contact', blankContact)
  const education = useState<ApplicationEducation>('application-education', blankEducation)
  const confirmation = useState<ApplicationConfirmation>('application-confirmation', blankConfirmation)
  const status = useState<ApplicationStatus>('application-status', () => 'Draft')
  const editable = computed(() => ['Draft', 'More Information Required'].includes(status.value))
  const resumeExpiresAt = ref<string | null>(null)
  const reviewReason = ref('')
  const resumeUrl = computed(() => import.meta.client && serverDraftId.value && resumeToken.value ? `${location.origin}/membership/apply?id=${encodeURIComponent(serverDraftId.value)}#token=${encodeURIComponent(resumeToken.value)}` : '')
  const step = useState('application-step', () => 1)
  const hydrated = useState('application-hydrated', () => false)
  const savedAt = useState<string | null>('application-saved-at', () => null)
  const serverDraftId = useState<string | null>('application-server-id', () => null)
  const resumeToken = useState<string | null>('application-resume-token', () => null)
  const apiBase = useRuntimeConfig().public.apiBase
  const resume = async (id: string, token: string) => {
    const result = await $fetch<{ status: ApplicationStatus; fields: Record<string, unknown>; resumeExpiresAt?: string; reviewReason?: string }>(apiBase + '/applications/' + encodeURIComponent(id), { headers: { 'x-resume-token': token } })
    const fields = result.fields
    const restore = (target: object, defaults: object, extras: string[]) => {
      const values: Record<string, unknown> = { ...defaults }
      for (const key of [...Object.keys(defaults), ...extras]) if (Object.hasOwn(fields, key)) values[key] = fields[key]
      for (const key of Object.keys(target)) delete (target as Record<string, unknown>)[key]
      Object.assign(target, values)
    }
    restore(profile.value, blankProfile(), [])
    restore(contact.value, blankContact(), ['position'])
    restore(education.value, blankEducation(), ['enteredDbsMonth', 'leftDbsMonth', 'certificateType', 'certificateClass', 'certificateYearProjected', 'dpsOnly', 'enteredDpsYear', 'leftDpsYear', 'otherClubs'])
    restore(confirmation.value, blankConfirmation(), ['joiningSource', 'introducerCertificateYear', 'signatureName'])
    profile.value.profilePictureName = String(fields.profilePictureName ?? fields.profilePictureKey ?? '')
    education.value.yearJoined = String(fields.yearJoiningSchool ?? fields.yearJoined ?? '')
    education.value.yearLeft = String(fields.yearLeavingSchool ?? fields.yearLeft ?? '')
    confirmation.value.consentAccepted = fields.consent === true || fields.consentAccepted === true
    serverDraftId.value = id
    resumeToken.value = token
    status.value = result.status
    resumeExpiresAt.value = result.resumeExpiresAt ?? null
    reviewReason.value = result.reviewReason ?? ''
    step.value = 1
    localStorage.setItem(apiStateKey, JSON.stringify({ id, resumeToken: token }))
    saveLocal()
  }
  const snapshot = (): MembershipApplication => ({ id: 'local-draft', status: status.value, paymentStatus: confirmation.value.membershipType === 'Life' ? 'Unpaid' : 'Not Required', profile: profile.value, contact: contact.value, education: education.value, confirmation: confirmation.value, updatedAt: savedAt.value ?? new Date().toISOString() })
  const saveLocal = () => { if (!import.meta.client) return; savedAt.value = new Date().toISOString(); localStorage.setItem(storageKey, JSON.stringify({ profile: profile.value, contact: contact.value, education: education.value, confirmation: confirmation.value, status: status.value, savedAt: savedAt.value })) }
  const restoreLocal = () => { if (!import.meta.client || hydrated.value) return; hydrated.value = true; const raw = localStorage.getItem(storageKey); const apiRaw = localStorage.getItem(apiStateKey); try { if (apiRaw) { const api = JSON.parse(apiRaw); serverDraftId.value = api.id ?? null; resumeToken.value = api.resumeToken ?? null } if (raw) { const parsed = JSON.parse(raw); Object.assign(profile.value, parsed.profile ?? {}); Object.assign(contact.value, parsed.contact ?? {}); Object.assign(education.value, parsed.education ?? {}); Object.assign(confirmation.value, parsed.confirmation ?? {}); status.value = parsed.status === 'Pending' ? 'Pending' : 'Draft'; savedAt.value = parsed.savedAt ?? null } } catch { localStorage.removeItem(storageKey); localStorage.removeItem(apiStateKey) } }
  const clearLocal = () => { if (import.meta.client) { localStorage.removeItem(storageKey); localStorage.removeItem(apiStateKey) } }
  const clearServerReference = () => { serverDraftId.value = null; resumeToken.value = null; resumeExpiresAt.value = null; if (import.meta.client) localStorage.removeItem(apiStateKey) }
  const apiPayload = () => ({ ...profile.value, ...contact.value, ...education.value, ...confirmation.value, profilePictureKey: profile.value.profilePictureName, yearJoiningSchool: education.value.yearJoined, yearLeavingSchool: education.value.yearLeft, consent: confirmation.value.consentAccepted })
  const ensureServerDraft = async () => { if (serverDraftId.value && resumeToken.value) return; const result = await $fetch<{ id: string; resumeToken: string }>(apiBase + '/applications/draft', { method: 'POST', body: apiPayload() }); serverDraftId.value = result.id; resumeToken.value = result.resumeToken; if (import.meta.client) localStorage.setItem(apiStateKey, JSON.stringify({ id: result.id, resumeToken: result.resumeToken })) }
  const saveServerDraft = async () => { await ensureServerDraft(); if (!serverDraftId.value || !resumeToken.value) return; await $fetch(apiBase + '/applications/' + serverDraftId.value + '/draft', { method: 'POST', headers: { 'x-resume-token': resumeToken.value }, body: apiPayload() }) }
  const recommend = () => { if (confirmation.value.membershipType !== 'Life') confirmation.value.membershipType = recommendedMembership(profile.value.dateOfBirth) }
  const submit = async () => { await ensureServerDraft(); if (!serverDraftId.value || !resumeToken.value) return; await $fetch(apiBase + '/applications/' + serverDraftId.value + '/submit', { method: 'POST', headers: { 'x-resume-token': resumeToken.value }, body: apiPayload() }); status.value = 'Pending'; saveLocal() }
  const fee = computed(() => confirmation.value.membershipType === 'Life' ? 2000 : 0)
  const refreshServer = async () => {
    if (!serverDraftId.value || !resumeToken.value) return
    // Check authority without overwriting newer locally autosaved edits.
    const result = await $fetch<{ status: ApplicationStatus; reviewReason?: string }>(apiBase + '/applications/' + encodeURIComponent(serverDraftId.value), { headers: { 'x-resume-token': resumeToken.value } })
    status.value = result.status
    reviewReason.value = result.reviewReason ?? ''
  }
  return { profile, contact, education, confirmation, status, editable, reviewReason, resumeUrl, resumeExpiresAt, resume, refreshServer, step, savedAt, snapshot, saveLocal, restoreLocal, clearLocal, clearServerReference, recommend, submit, saveServerDraft, fee }
}
