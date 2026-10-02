<script setup lang="ts">
import{events}from'~/data/member'
const { t } = useLocale()
</script>
<template><div><h1 class="text-5xl">{{ t('myEvents') }}</h1><div class="mt-8 grid gap-4 md:grid-cols-2"><PortalCard v-for="e in events" :key="e.title"><p class="text-sm font-bold text-[#7a2737]">{{e.date}}</p><h2 class="mt-2 text-2xl">{{e.title}}</h2><p class="mt-3 text-sm">{{e.status}} · demo</p></PortalCard></div></div></template>
