<script setup lang="ts">
const { t, locale } = useLocale()
const menu = computed(() => [
  { label: t('about'), to: '/about', children: [{ label: locale.value === 'en' ? 'Our story' : '我們的故事', to: '/about/history' }, { label: locale.value === 'en' ? 'Governance' : '管治架構', to: '/about/governance' }] },
  { label: t('news'), to: '/news', children: [{ label: locale.value === 'en' ? 'All news' : '所有消息', to: '/news' }] },
  { label: t('events'), to: '/events', children: [{ label: locale.value === 'en' ? 'Event calendar' : '活動日程', to: '/events' }] },
  { label: t('chapters'), to: '/chapters', children: [{ label: locale.value === 'en' ? 'Professional chapters' : '專業組別', to: '/chapters' }, { label: locale.value === 'en' ? 'Overseas chapters' : '海外組別', to: '/chapters' }] },
  { label: t('membership'), to: '/membership', children: [{ label: locale.value === 'en' ? 'Eligibility' : '申請資格', to: '/membership/eligibility' }, { label: locale.value === 'en' ? 'Fees' : '會費', to: '/membership/fees' }, { label: locale.value === 'en' ? 'Apply' : '申請會員', to: '/membership/apply' }] },
])
</script>
<template>
  <nav aria-label="Primary" class="hidden items-center gap-5 lg:flex">
    <NuxtLink to="/" class="text-sm font-bold text-white/80 hover:text-[#d6ad55]">{{ t('home') }}</NuxtLink>
    <div v-for="item in menu" :key="item.to" class="group relative">
      <NuxtLink :to="item.to" class="inline-flex items-center gap-1 py-3 text-sm font-bold text-white/80 hover:text-[#d6ad55]">{{ item.label }} <span aria-hidden="true" class="text-xs text-[#d6ad55]">⌄</span></NuxtLink>
      <div class="invisible absolute left-0 top-full z-50 min-w-52 translate-y-1 rounded-b-xl border border-white/10 bg-[#102231] p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <NuxtLink v-for="child in item.children" :key="child.to + child.label" :to="child.to" class="block rounded-lg px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-[#d6ad55]">{{ child.label }}</NuxtLink>
      </div>
    </div>
    <NuxtLink to="/contact" class="text-sm font-bold text-white/80 hover:text-[#d6ad55]">{{ t('contact') }}</NuxtLink>
    <a href="http://localhost:3001/login" class="rounded-full border border-[#d6ad55]/60 px-4 py-2 text-sm font-bold text-[#d6ad55]">{{ t('memberPortal') }}</a>
  </nav>
</template>
