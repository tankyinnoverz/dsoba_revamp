<script setup lang="ts">
import type{EventItem}from'~/types/content';defineProps<{item:EventItem}>()
</script>
<template><Card class="grid sm:grid-cols-[.9fr_1.1fr]"><ResponsiveImage :src="item.image" :alt="item.title" ratio="aspect-square sm:aspect-auto"/><div class="p-6"><Badge>{{item.category}}</Badge><h3 class="mt-4 text-2xl"><NuxtLink :to="`/events/${item.slug}`">{{item.title}}</NuxtLink></h3><p class="mt-3 text-sm font-bold text-[#7a2737]">{{item.date}}</p><p class="mt-2 text-sm text-[#102231]/60">{{item.venue}}</p></div></Card></template>
