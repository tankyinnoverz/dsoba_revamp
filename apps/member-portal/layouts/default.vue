<script setup lang="ts">
const open = ref(false)
const { t } = useLocale()
const { session, logout } = useMemberAuth()
const signOut = async () => { await logout(); await navigateTo('/login') }
const links = computed(() => [
  [t('dashboard'), '/'],
  [t('profile'), '/profile'],
  [t('membership'), '/membership'],
  [t('events'), '/events'],
  [t('transactions'), '/transactions'],
  [t('directory'), '/directory'],
  [t('messages'), '/messages']
])
</script>
<template>
  <div class="min-h-screen">
    <header class="relative bg-[#102231] text-white">
      <div class="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <NuxtLink to="/" class="font-serif text-2xl text-[#d6ad55]">{{ t('memberPortal') }}</NuxtLink>
        <div class="flex items-center gap-4">
          <button class="text-2xl md:hidden" aria-label="Toggle menu" @click="open=!open">☰</button>
        </div>
        <nav class="hidden gap-5 md:flex">
          <NuxtLink v-for="i in links" :key="i[1]" :to="i[1]" class="text-sm font-bold text-white/70">{{i[0]}}</NuxtLink>
        </nav>
      </div>
      <nav v-if="open" class="absolute inset-x-0 top-full z-50 border-t border-white/10 bg-[#102231] p-4 md:hidden">
        <NuxtLink v-for="i in links" :key="i[1]" :to="i[1]" class="block py-2">{{i[0]}}</NuxtLink>
      </nav>
    </header>
    <div v-if="session?.membershipStatus === 'Suspended'" class="bg-[#7a2737] px-5 py-3 text-center text-xs font-bold text-white">{{ t('suspendedAlert') }} <NuxtLink to="/membership" class="ml-2 underline">{{ t('upgradeNow') }}</NuxtLink></div>
    <div class="bg-[#d6ad55] px-5 py-2 text-center text-xs font-bold text-[#102231]">{{ t('demoBanner') }}</div>
    <main class="mx-auto max-w-6xl px-5 py-10"><slot/></main>
    <aside v-if="session?.upgradeRequired && session.membershipStatus === 'Active'" class="mx-auto mb-8 max-w-6xl border border-[#d6ad55] p-5" role="status">Your Trial membership has reached its upgrade date. Upgrade to Life Membership (HKD 2,000) before {{ session.graceEndsOn }} to retain access. <NuxtLink to="/membership" class="underline">Membership details</NuxtLink></aside>
    <p v-if="!session" class="pb-8 text-center"><NuxtLink to="/reset-password" class="underline">Forgot your password?</NuxtLink></p>
    <button v-if="session" class="fixed bottom-5 right-5 rounded-full bg-[#102231] px-4 py-2 text-xs font-bold text-white shadow-lg" @click="signOut">{{ t('signOut') }}</button>
  </div>
</template>
