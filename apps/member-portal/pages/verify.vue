<script setup lang="ts">
const route = useRoute()
const apiBase = useRuntimeConfig().public.apiBase
const password = ref('')
const confirmation = ref('')
const busy = ref(false)
const error = ref('')
const complete = ref(false)
const submit = async () => {
  error.value = ''
  if (password.value !== confirmation.value) { error.value = 'Passwords must match.'; return }
  busy.value = true
  try {
    await $fetch(`${apiBase}/auth/setup`, { method: 'POST', body: { token: String(route.query.token ?? ''), password: password.value } })
    complete.value = true
    password.value = ''; confirmation.value = ''
    await navigateTo('/verify', { replace: true })
  } catch { error.value = 'Unable to activate your account. The link may have expired or already been used.' }
  finally { busy.value = false }
}
</script>
<template>
  <section class="mx-auto max-w-md py-10">
    <p class="text-xs font-bold uppercase tracking-widest text-[#7a2737]">Member welcome</p>
    <h1 class="mt-3 text-4xl">Activate your account.</h1>
    <PortalCard class="mt-8">
      <div v-if="complete" role="status"><p>Your email is verified and your password is set.</p><NuxtLink to="/login" class="mt-6 block bg-[#d6ad55] p-3 text-center font-bold">Continue to sign in</NuxtLink></div>
      <form v-else @submit.prevent="submit">
        <p class="mb-6 text-sm">Choose a password of at least 12 characters to complete your membership account setup.</p>
        <label class="block font-bold">New password<input v-model="password" required minlength="12" maxlength="256" autocomplete="new-password" type="password" class="mt-2 w-full border p-3"></label>
        <label class="mt-5 block font-bold">Confirm password<input v-model="confirmation" required minlength="12" maxlength="256" autocomplete="new-password" type="password" class="mt-2 w-full border p-3"></label>
        <p v-if="error" role="alert" class="mt-4 text-sm text-[#7a2737]">{{ error }}</p>
        <button :disabled="busy || !route.query.token" class="mt-6 w-full bg-[#d6ad55] p-3 font-bold disabled:opacity-50">{{ busy ? 'Activating…' : 'Verify email and set password' }}</button>
      </form>
    </PortalCard>
  </section>
</template>
