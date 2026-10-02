<script setup lang="ts">
defineProps<{title:string;loading?:boolean}>()
</script>
<template><div role="status" class="border border-dashed border-[#102231]/25 bg-white p-8 text-center"><div v-if="loading" class="mx-auto h-8 w-8 animate-pulse rounded-full bg-[#d6ad55]"></div><h2 class="mt-3 text-2xl">{{title}}</h2><p class="mt-2 text-sm text-gray-500"><slot/></p></div></template>
