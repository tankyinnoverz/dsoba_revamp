<script setup lang="ts">
const { t } = useLocale()
</script>
<template><header class="relative sticky top-0 z-40 bg-[#102231] text-white"><div class="page-wrap relative flex h-20 items-center justify-between"><NuxtLink to="/" class="flex items-center gap-3" aria-label="DSOBA home"><img src="/assets/logo.png" alt="" class="h-14 w-12 object-contain"><span><b class="serif block text-2xl leading-none text-[#d6ad55]">DSOBA</b><small class="hidden text-[10px] uppercase tracking-widest text-white/60 sm:block">{{t('oldBoys')}}</small></span></NuxtLink><div class="flex items-center gap-3"><DesktopNavigation/><MobileNavigation/></div></div></header></template>
