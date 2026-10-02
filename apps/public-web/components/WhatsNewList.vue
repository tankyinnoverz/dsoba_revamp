<script setup lang="ts">
defineProps<{items:{date:string;title:string;to:string}[]}>()
</script>
<template><div class="divide-y divide-[#102231]/15 border-y border-[#102231]/20"><NuxtLink v-for="item in items" :key="item.title" :to="item.to" class="group grid grid-cols-[5rem_1fr_auto] items-center gap-4 py-5"><b class="text-xs tracking-wider text-[#7a2737]">{{item.date}}</b><span class="serif text-xl text-[#102231] group-hover:text-[#7a2737]">{{item.title}}</span><span aria-hidden="true">→</span></NuxtLink></div></template>
