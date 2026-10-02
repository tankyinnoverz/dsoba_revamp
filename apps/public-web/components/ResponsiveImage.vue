<script setup lang="ts">
withDefaults(defineProps<{src:string;alt:string;ratio?:string}>(),{ratio:'aspect-[4/3]'})
</script>
<template><div :class="['overflow-hidden bg-[#102231]/10',ratio]"><img :src="src" :alt="alt" loading="lazy" class="h-full w-full object-cover transition duration-500 hover:scale-[1.02]"></div></template>
