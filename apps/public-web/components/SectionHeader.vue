<script setup lang="ts">
defineProps<{eyebrow:string;title:string;link?:string;linkLabel?:string}>()
</script>
<template><div class="flex items-end justify-between gap-6 border-b border-[#102231]/20 pb-5"><div><p class="eyebrow">{{eyebrow}}</p><h2 class="mt-2 text-4xl text-[#102231] md:text-5xl">{{title}}</h2></div><NuxtLink v-if="link" :to="link" class="hidden text-sm font-bold text-[#7a2737] sm:block">{{linkLabel}} →</NuxtLink></div></template>
