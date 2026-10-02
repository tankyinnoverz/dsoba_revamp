<script setup lang="ts">
defineProps<{eyebrow:string;title:string;intro:string}>()
</script>
<template><div><header class="bg-[#102231] text-white"><div class="page-wrap py-20 md:py-28"><p class="text-xs font-bold uppercase tracking-[.22em] text-[#d6ad55]">{{eyebrow}}</p><h1 class="mt-4 max-w-4xl text-5xl leading-tight md:text-7xl">{{title}}</h1><p class="mt-6 max-w-2xl text-lg leading-8 text-white/70">{{intro}}</p></div></header><div class="page-wrap py-14 md:py-20"><slot/></div></div></template>
