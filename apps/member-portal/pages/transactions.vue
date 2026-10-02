<script setup lang="ts">
import{transactions}from'~/data/member'
const { t } = useLocale()
</script>
<template><div><h1 class="text-5xl">{{ t('transactionHistory') }}</h1><div class="mt-8 space-y-3"><PortalCard v-for="t in transactions" :key="t.title" class="flex justify-between gap-5"><div><h2 class="text-xl">{{t.title}}</h2><p class="mt-1 text-sm text-gray-500">{{t.date}} · {{t.status}}</p></div><b>{{t.amount}}</b></PortalCard></div></div></template>
