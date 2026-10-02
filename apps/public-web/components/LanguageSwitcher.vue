<script setup lang="ts">
const { locale, t, toggleLocale } = useLocale()
</script>
<template><button type="button" class="rounded-full border border-white/30 px-3 py-2 text-xs font-bold text-white/90 hover:border-[#d6ad55] hover:text-[#d6ad55]" :aria-label="t('languageLabel') + ': ' + locale" @click="toggleLocale">{{ locale === 'en' ? 'ZH-HK' : 'EN' }}</button></template>
