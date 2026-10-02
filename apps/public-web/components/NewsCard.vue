<script setup lang="ts">
import type{NewsItem}from'~/types/content';defineProps<{item:NewsItem}>()
</script>
<template><Card><ResponsiveImage v-if="item.image" :src="item.image" :alt="item.title"/><div class="p-6"><Badge>{{item.category}}</Badge><h3 class="mt-4 text-2xl"><NuxtLink :to="`/news/${item.slug}`">{{item.title}}</NuxtLink></h3><p class="mt-3 text-sm leading-6 text-[#102231]/65">{{item.excerpt}}</p><p class="mt-5 text-xs font-bold text-[#7a2737]">{{item.date}}</p></div></Card></template>
