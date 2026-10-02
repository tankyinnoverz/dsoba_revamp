<script setup lang="ts">
const open = ref(false)
const expanded = ref<string | null>(null)
const { t, locale } = useLocale()
watch(() => useRoute().fullPath, () => { open.value = false; expanded.value = null })
const menu = computed(() => [
  { label: t('about'), to: '/about', children: [{ label: locale.value === 'en' ? 'Our story' : '我們的故事', to: '/about/history' }, { label: locale.value === 'en' ? 'Governance' : '管治架構', to: '/about/governance' }] },
  { label: t('news'), to: '/news', children: [{ label: locale.value === 'en' ? 'All news' : '所有消息', to: '/news' }] },
  { label: t('events'), to: '/events', children: [{ label: locale.value === 'en' ? 'Event calendar' : '活動日程', to: '/events' }] },
  { label: t('chapters'), to: '/chapters', children: [{ label: locale.value === 'en' ? 'Professional chapters' : '專業組別', to: '/chapters' }, { label: locale.value === 'en' ? 'Overseas chapters' : '海外組別', to: '/chapters' }] },
  { label: t('membership'), to: '/membership', children: [{ label: locale.value === 'en' ? 'Eligibility' : '申請資格', to: '/membership/eligibility' }, { label: locale.value === 'en' ? 'Fees' : '會費', to: '/membership/fees' }, { label: locale.value === 'en' ? 'Apply' : '申請會員', to: '/membership/apply' }] },
])
function toggle(item: string) { expanded.value = expanded.value === item ? null : item }
</script>
<template>
  <div class="lg:hidden">
    <button type="button" class="p-2 text-2xl text-white" :aria-expanded="open" aria-controls="mobile-menu" aria-label="Toggle navigation" @click="open = !open">{{ open ? '×' : '☰' }}</button>
    <nav v-if="open" id="mobile-menu" aria-label="Mobile" class="absolute inset-x-0 top-full z-50 max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-white/10 bg-[#102231] p-5 shadow-xl">
      <NuxtLink to="/" class="block border-b border-white/10 py-3 font-bold text-white">{{ t('home') }}</NuxtLink>
      <div v-for="item in menu" :key="item.to" class="border-b border-white/10">
        <div class="flex items-center justify-between">
          <NuxtLink :to="item.to" class="py-3 font-bold text-white">{{ item.label }}</NuxtLink>
          <button type="button" class="p-3 text-[#d6ad55]" :aria-expanded="expanded === item.to" :aria-label="'Toggle ' + item.label + ' submenu'" @click="toggle(item.to)">{{ expanded === item.to ? '−' : '+' }}</button>
        </div>
        <div v-if="expanded === item.to" class="mb-2 ml-3 border-l border-[#d6ad55]/40 pl-3">
          <NuxtLink v-for="child in item.children" :key="child.to + child.label" :to="child.to" class="block py-2 text-sm font-semibold text-white/70">{{ child.label }}</NuxtLink>
        </div>
      </div>
      <NuxtLink to="/contact" class="block border-b border-white/10 py-3 font-bold text-white">{{ t('contact') }}</NuxtLink>
      <a href="http://localhost:3001/login" class="mt-4 block rounded-full border border-[#d6ad55]/60 px-4 py-3 text-center text-sm font-bold text-[#d6ad55]">{{ t('memberPortal') }}</a>
    </nav>
  </div>
</template>
