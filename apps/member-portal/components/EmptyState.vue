<script setup lang="ts">
defineProps<{title:string}>()
</script>
<template><div class="border border-dashed border-[#102231]/25 bg-white p-8 text-center"><h2 class="text-2xl">{{title}}</h2><p class="mt-2 text-sm text-[#102231]/60"><slot>Nothing to show in this demonstration state.</slot></p></div></template>
