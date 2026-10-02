<script setup lang="ts">
const route = useRoute()
const apiBase = useRuntimeConfig().public.apiBase
const email = ref(''), password = ref(''), confirmation = ref(''), message = ref('')
const busy = ref(false), complete = ref(false)
const submit = async () => {
  message.value = ''
  if (route.query.token && password.value !== confirmation.value) { message.value = 'Passwords must match.'; return }
  busy.value = true
  try {
    if (route.query.token) {
      await $fetch(`${apiBase}/auth/reset-password`, { method: 'POST', body: { token: String(route.query.token), password: password.value } })
      password.value = ''; confirmation.value = ''; complete.value = true
      message.value = 'Password changed. Please sign in again.'
      await navigateTo('/reset-password', { replace: true })
    } else {
      const result = await $fetch<{ message: string }>(`${apiBase}/auth/request-reset`, { method: 'POST', body: { email: email.value } })
      message.value = result.message
    }
  } catch { message.value = 'Unable to complete the request. Request a new link if yours has expired.' }
  finally { busy.value = false }
}
</script>
<template>
  <section class="mx-auto max-w-md py-10"><h1 class="text-4xl">Reset your password</h1>
    <PortalCard class="mt-8"><form v-if="!complete" class="space-y-5" @submit.prevent="submit">
      <template v-if="route.query.token">
        <label class="block font-bold">New password<input v-model="password" type="password" required minlength="12" maxlength="256" autocomplete="new-password" class="mt-2 w-full border p-3"></label>
        <label class="block font-bold">Confirm password<input v-model="confirmation" type="password" required minlength="12" maxlength="256" autocomplete="new-password" class="mt-2 w-full border p-3"></label>
      </template>
      <label v-else class="block font-bold">Email<input v-model="email" type="email" required autocomplete="email" class="mt-2 w-full border p-3"></label>
      <button :disabled="busy" class="w-full bg-[#d6ad55] p-3 font-bold disabled:opacity-50">{{ busy ? 'Please wait…' : route.query.token ? 'Set new password' : 'Request reset link' }}</button>
    </form><p v-if="message" role="status" class="mt-5">{{ message }}</p><NuxtLink to="/login" class="mt-5 block underline">Back to sign in</NuxtLink></PortalCard>
  </section>
</template>
