<script setup lang="ts">
import{messages}from'~/data/member'
const { t } = useLocale()
</script>
<template><div><h1 class="text-5xl">{{ t('messageHistory') }}</h1><div class="mt-8 space-y-3"><PortalCard v-for="m in messages" :key="m.title"><p class="text-xs font-bold uppercase text-[#7a2737]">{{m.channel}} · demonstration</p><h2 class="mt-2 text-xl">{{m.title}}</h2></PortalCard></div><EmptyState class="mt-5" title="No more messages">{{ t('noLive') }}</EmptyState></div></template>
