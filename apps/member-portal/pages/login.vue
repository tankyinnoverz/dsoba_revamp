<script setup lang="ts">
const { t } = useLocale()
const { login, busy, error } = useMemberAuth()
const route = useRoute()
const email = ref('')
const password = ref('')
const submit = async () => {
  try {
    await login(email.value, password.value)
    const target = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await navigateTo(target.startsWith('/') && !target.startsWith('//') && !target.includes('\\') ? target : '/')
  } catch { /* The auth composable displays the failure. */ }
}
</script>
<template><div class="mx-auto max-w-md py-10"><p class="text-xs font-bold uppercase tracking-widest text-[#7a2737]">{{ t('signIn') }}</p><h1 class="mt-3 text-5xl">{{ t('welcome') }}</h1><PortalCard class="mt-8"><form @submit.prevent="submit"><label class="font-bold">Email<input v-model="email" required autocomplete="email" type="email" class="mt-2 w-full border p-3"></label><label class="mt-5 block font-bold">Password<input v-model="password" required autocomplete="current-password" type="password" class="mt-2 w-full border p-3"></label><p v-if="error" role="alert" class="mt-4 text-sm text-[#7a2737]">{{ error }}</p><button :disabled="busy" class="mt-6 block w-full bg-[#d6ad55] p-3 text-center font-bold disabled:opacity-60">{{ busy ? 'Signing in…' : t('enter') }}</button></form><p class="mt-4 text-sm text-[#7a2737]">{{ t('noCredentials') }}</p></PortalCard></div></template>
