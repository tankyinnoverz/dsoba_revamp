<script setup lang="ts">
import { isEmail, isNonEmptyString } from '@dsoba/validation'
const application = useApplicationDraft()
const errors = ref<string[]>([])
const complete = ref(false)
const busy = ref(true)
const loadFailed = ref(false)
const notice = ref('')
const route = useRoute()
const hasResumeLink = typeof route.query.id === 'string' && typeof route.query.token === 'string'
const showError = (error: unknown) => {
  const failure = error as { data?: { message?: string | string[] }; status?: number }
  const message = failure.data?.message
  errors.value = [Array.isArray(message) ? message.join(' ') : message || 'Unable to connect. Your local draft is retained. Please retry.']
}
const labels = ['Profile', 'Contact & work', 'School & education', 'Confirmation']
onMounted(async () => {
  try {
    const id = typeof route.query.id === 'string' ? route.query.id : ''
    const token = typeof route.query.token === 'string' ? route.query.token : new URLSearchParams(location.hash.slice(1)).get('token') || ''
    if (id && token) {
      // Remove bearer credentials before any further navigation or sharing.
      history.replaceState(history.state, '', location.pathname)
      await application.resume(id, token)
    } else {
      application.restoreLocal()
      await application.refreshServer()
    }
  } catch (error) {
    showError(error)
    if (hasResumeLink) {
      loadFailed.value = true
    } else {
      // A local draft remains usable when the API is offline. Drop a stale
      // server reference so the next save can create a fresh server draft.
      application.clearServerReference()
      notice.value = 'The server is unavailable. Your draft is still saved on this device.'
    }
  }
  finally { busy.value = false }
})
watch([application.profile, application.contact, application.education, application.confirmation], application.saveLocal, { deep: true })
const validateStep = () => {
  const result: string[] = []
  if (application.step.value === 1) {
    if (!isNonEmptyString(application.profile.value.firstName).valid) result.push('First name is required.')
    if (!isNonEmptyString(application.profile.value.lastName).valid) result.push('Last name is required.')
    if (!application.profile.value.dateOfBirth) result.push('Date of birth is required.')
    if (!application.profile.value.profilePictureName) result.push('Profile picture is required.')
  }
  if (application.step.value === 2) {
    if (!isNonEmptyString(application.contact.value.mobile).valid) result.push('Mobile is required.')
    if (!isEmail(application.contact.value.email).valid) result.push('Enter a valid email address.')
  }
  if (application.step.value === 3) {
    const school = application.education.value
    if (!school.classYear || (school.dpsOnly ? !school.enteredDpsYear || !school.leftDpsYear : !school.yearJoined || !school.yearLeft || !school.house)) result.push('Complete the required school fields.')
  }
  if (application.step.value === 4) {
    if (!application.confirmation.value.rulesAccepted || !application.confirmation.value.consentAccepted) result.push('Accept the rules and consent to continue.')
    if (application.confirmation.value.comments.length > 300) result.push('Comments must be 300 characters or fewer.')
  }
  errors.value = result
  return result.length === 0
}
const next = () => { if (!validateStep()) return; application.recommend(); application.step.value = Math.min(4, application.step.value + 1) }
const previous = () => { errors.value = []; application.step.value = Math.max(1, application.step.value - 1) }
const submit = async () => {
  if (busy.value || !application.editable.value || !validateStep()) return
  busy.value = true
  try { await application.submit(); complete.value = true } catch (error) { showError(error) } finally { busy.value = false }
}
const saveDraft = async () => {
  if (busy.value || !application.editable.value) return
  busy.value = true; errors.value = []; notice.value = ''
  try {
    application.saveLocal()
    await application.saveServerDraft()
    notice.value = 'Draft saved securely. Keep your private resume link below.'
  } catch {
    // Local persistence is the primary offline-safe save path.
    notice.value = 'Draft saved on this device. Secure resume access will be available when the server is online.'
    errors.value = []
  } finally { busy.value = false }
}
const filePicked = (event: Event) => { const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return; if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024) { errors.value = ['Profile picture must be JPG or PNG and no larger than 5 MB.']; return }; application.profile.value.profilePictureName = file.name }
</script>
<template>
  <ContentPageLayout eyebrow="Membership" title="Membership application" intro="Complete the four steps below. Your progress is saved on this device so you can continue later.">
    <p v-if="busy" role="status" class="mb-6">Please wait…</p>
    <div v-if="loadFailed" role="alert" class="mb-6 rounded-xl border border-[#7a2737] p-5"><p>{{ errors.join(' ') }}</p><p class="mt-2">The application could not be loaded. Open your latest resume link or reload to retry. Editing is locked until its status can be checked.</p></div>
    <div v-if="!loadFailed && !busy && application.status.value !== 'Draft' && !complete" role="status" class="mb-6 rounded-xl border border-[#d6ad55] bg-white p-5"><h2 class="text-2xl">Application: {{ application.status.value }}</h2><p v-if="application.reviewReason.value" class="mt-2">{{ application.reviewReason.value }}</p><p class="mt-2">{{ application.editable.value ? 'Please update the requested information and submit again.' : 'This application is read-only. Approval and email verification are required before Member Portal access.' }}</p></div>
    <div v-if="complete" class="mx-auto max-w-2xl rounded-2xl border border-[#d6ad55] bg-white p-8 shadow-sm" role="status"><p class="eyebrow">Application submitted</p><h2 class="mt-3 text-4xl">Thank you, {{ application.profile.value.firstName || 'applicant' }}.</h2><p class="mt-4 leading-7 text-[#102231]/70">Your application is now Pending review. Member Portal access is only provisioned after General Committee approval.</p><NuxtLink to="/membership" class="mt-7 inline-flex min-h-11 items-center rounded-full bg-[#d6ad55] px-5 py-3 font-bold">Back to membership</NuxtLink></div>
    <div v-else class="grid gap-10 lg:grid-cols-[1fr_18rem]">
      <form class="space-y-7" @submit.prevent="application.step.value < 4 ? next() : submit()">
        <fieldset :disabled="busy || loadFailed || !application.editable.value" class="space-y-7 disabled:opacity-70">
        <ol class="grid grid-cols-4 gap-2" aria-label="Application steps"><li v-for="(label, index) in ['Profile', 'Contact & work', 'School & education', 'Confirmation']" :key="label" class="border-t-4 pt-3 text-xs font-bold" :class="index + 1 <= application.step.value ? 'border-[#7a2737] text-[#7a2737]' : 'border-[#102231]/15 text-[#102231]/45'">{{ index + 1 }}. {{ label }}</li></ol>
        <div v-if="errors.length" class="rounded-lg border border-[#7a2737] bg-[#7a2737]/10 p-4 text-sm text-[#7a2737]" role="alert"><ul class="list-disc pl-5"><li v-for="error in errors" :key="error">{{ error }}</li></ul></div>
        <fieldset v-if="application.step.value === 1" class="grid gap-4 sm:grid-cols-2"><legend class="mb-2 text-3xl serif">Your profile</legend><label>First name *<input v-model="application.profile.value.firstName" required autocomplete="given-name"></label><label>Last name *<input v-model="application.profile.value.lastName" required autocomplete="family-name"></label><label>Middle name<input v-model="application.profile.value.middleName"></label><label>Chinese name<input v-model="application.profile.value.chineseName"></label><label>Date of birth *<input v-model="application.profile.value.dateOfBirth" type="date" required></label><label>Marital status<select v-model="application.profile.value.maritalStatus"><option value="">Prefer not to say</option><option>Single</option><option>Married</option><option>Other</option></select></label><label class="sm:col-span-2">Profile picture *<input type="file" accept="image/jpeg,image/png" @change="filePicked"><small class="mt-1 block text-xs opacity-70">JPG or PNG, maximum 5 MB.</small></label></fieldset>
        <fieldset v-else-if="application.step.value === 2" class="grid gap-4 sm:grid-cols-2"><legend class="mb-2 text-3xl serif">Contact and work</legend><label>Address line 1<input v-model="application.contact.value.addressLine1"></label><label>Address line 2<input v-model="application.contact.value.addressLine2"></label><label>City<input v-model="application.contact.value.city"></label><label>Region<input v-model="application.contact.value.region"></label><label>Country<input v-model="application.contact.value.country"></label><label>Mobile *<input v-model="application.contact.value.mobile" required autocomplete="tel"></label><label>Email *<input v-model="application.contact.value.email" type="email" required autocomplete="email"></label><label>Company name<input v-model="application.contact.value.companyName"></label><label>Industry<input v-model="application.contact.value.industry"></label><label>Occupation / profession<input v-model="application.contact.value.occupation"></label></fieldset>
        <fieldset v-else-if="application.step.value === 3" class="grid gap-4 sm:grid-cols-2"><legend class="mb-2 text-3xl serif">School and education</legend><label>Class year *<input v-model="application.education.value.classYear"  :required="!application.education.value.dpsOnly"></label><label>House *<input v-model="application.education.value.house"  :required="!application.education.value.dpsOnly"></label><label>Year joined school *<input v-model="application.education.value.yearJoined"  :required="!application.education.value.dpsOnly"></label><label>Year left school *<input v-model="application.education.value.yearLeft"  :required="!application.education.value.dpsOnly"></label><p class="sm:col-span-2">School attendance is reviewed by the General Committee.</p><label>Hobbies<input v-model="application.education.value.hobbies"></label><label>College / university<input v-model="application.education.value.college"></label><label>Degree / major<input v-model="application.education.value.degree"></label><label>Year of graduation<input v-model="application.education.value.graduationYear"></label></fieldset>
        <fieldset v-else class="grid gap-4"><legend class="mb-2 text-3xl serif">Confirmation and membership</legend><label>Why would you like to join?<textarea v-model="application.confirmation.value.reason" rows="3"></textarea></label><label>Introduced by / event<input v-model="application.confirmation.value.introducedBy"></label><label>Comments (maximum 300 characters)<textarea v-model="application.confirmation.value.comments" maxlength="300" rows="3"></textarea></label><div class="rounded-xl bg-[#102231] p-5 text-white"><p class="text-sm uppercase tracking-widest text-[#d6ad55]">Recommended membership</p><p class="mt-2 text-3xl serif">{{ application.confirmation.value.membershipType }}</p><p class="mt-2 text-white/70">{{ application.fee.value ? 'HKD 2,000 Life Membership fee.' : 'No membership fee is required for this application.' }}</p><label class="mt-5 block">Membership type<select v-model="application.confirmation.value.membershipType"><option>Youth</option><option>Trial</option><option>Life</option></select></label></div><label class="inline-flex items-start gap-3"><input v-model="application.confirmation.value.rulesAccepted" type="checkbox" class="mt-1 h-5 w-5"> I acknowledge the DSOBA rules and by-laws.</label><label class="inline-flex items-start gap-3"><input v-model="application.confirmation.value.consentAccepted" type="checkbox" class="mt-1 h-5 w-5"> I consent to the use of my information for membership processing.</label></fieldset>
        <label v-if="application.step.value === 2">Position / job title<input v-model="application.contact.value.position"></label>
        <fieldset v-if="application.step.value === 3" class="grid gap-4 sm:grid-cols-2">
          <legend class="mb-4 text-2xl">Additional school details</legend>
          <label>DBS entry month (01–12)<input v-model="application.education.value.enteredDbsMonth" pattern="0[1-9]|1[0-2]"></label>
          <label>DBS leaving month (01–12)<input v-model="application.education.value.leftDbsMonth" pattern="0[1-9]|1[0-2]"></label>
          <label>Certificate type<select v-model="application.education.value.certificateType"><option>School Cert.</option><option>HKDSE</option><option>IB</option></select></label>
          <label>Class in certificate year<input v-model="application.education.value.certificateClass" placeholder="e.g. A, Arts, G"></label>
          <label><input v-model="application.education.value.certificateYearProjected" type="checkbox"> Certificate year above is projected</label>
          <label><input v-model="application.education.value.dpsOnly" type="checkbox"> I attended DPS but not DBS</label>
          <label v-if="application.education.value.dpsOnly">Year entered DPS<input v-model="application.education.value.enteredDpsYear" required pattern="[0-9]{4}"></label>
          <label v-if="application.education.value.dpsOnly">Year left DPS<input v-model="application.education.value.leftDpsYear" required pattern="[0-9]{4}"></label>
          <label>Other clubs joined<input v-model="application.education.value.otherClubs"></label>
        </fieldset>
        <fieldset v-if="application.step.value === 4" class="grid gap-4 sm:grid-cols-2">
          <legend class="mb-4 text-2xl">Declaration details</legend>
          <label>Decision to join<select v-model="application.confirmation.value.joiningSource"><option>Self-initiated</option><option>Introduced by another person</option></select></label>
          <label>Introducer's Cert. / DSE / IB year<input v-model="application.confirmation.value.introducerCertificateYear"></label>
          <label>Typed signature / full name<input v-model="application.confirmation.value.signatureName"></label>
        </fieldset>
        <div class="flex flex-wrap justify-between gap-3"><button v-if="application.step.value > 1" type="button" class="min-h-11 rounded-full border border-[#102231] px-5 py-3 font-bold" @click="previous">Back</button><button type="submit" class="min-h-11 rounded-full bg-[#d6ad55] px-5 py-3 font-bold">{{ application.step.value < 4 ? 'Save and continue' : 'Submit application' }}</button><button type="button" class="min-h-11 rounded-full border border-[#102231]/30 px-5 py-3 text-sm font-bold" @click="saveDraft">Save draft</button></div>
        </fieldset>
        <div v-if="!application.editable.value && !loadFailed" class="flex gap-3"><button type="button" @click="previous">Previous section</button><button type="button" @click="application.step.value = Math.min(4, application.step.value + 1)">Next section</button></div>
      </form>
      <aside class="h-fit rounded-xl border border-[#102231]/10 bg-white p-5 text-sm leading-6 text-[#102231]/65"><p class="eyebrow">Draft access</p><h2 class="mt-2 text-2xl serif">Continue later</h2><p class="mt-3">Save a server draft to obtain private, expiring resume access. Anyone with this link can view your application; do not share it. It never grants Member Portal access. Email delivery depends on the configured service.</p><p v-if="notice" role="status" class="mt-3">{{ notice }}</p><a v-if="application.resumeUrl.value && !loadFailed" :href="application.resumeUrl.value" rel="noreferrer" class="mt-4 block font-bold underline">Private application resume link</a><p v-if="application.savedAt.value" class="mt-4 text-xs">Last saved on this device {{ new Date(application.savedAt.value).toLocaleString() }}</p></aside>
    </div>
  </ContentPageLayout>
</template>
<style scoped>
label { display: block; font-weight: 700; }
input:not([type='checkbox']), select, textarea { display: block; width: 100%; margin-top: .5rem; border: 1px solid rgb(16 34 49 / .25); background: white; padding: .75rem; font-weight: 400; }
</style>
