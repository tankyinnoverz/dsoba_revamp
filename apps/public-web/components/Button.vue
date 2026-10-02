<script setup lang="ts">
withDefaults(defineProps<{to?:string;variant?:'gold'|'outline'}>(),{variant:'gold'})
</script>
<template><NuxtLink v-if="to" :to="to" class="inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5" :class="variant==='gold'?'bg-[#d6ad55] text-[#102231]':'border border-current bg-transparent'"><slot/></NuxtLink><button v-else type="button" class="inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-sm font-bold" :class="variant==='gold'?'bg-[#d6ad55] text-[#102231]':'border border-current bg-transparent'"><slot/></button></template>
