<script setup lang="ts">
import type{ChapterItem}from'~/types/content';defineProps<{item:ChapterItem}>()
</script>
<template><Card class="p-7"><p class="eyebrow">{{item.type}}</p><h3 class="mt-3 text-3xl">{{item.name}}</h3><p class="mt-4 leading-7 text-[#102231]/65">{{item.description}}</p></Card></template>
