<script setup lang="ts">
import type{EventItem}from'~/types/content';defineProps<{items:EventItem[]}>()
</script>
<template><div class="grid gap-6 lg:grid-cols-2"><EventCard v-for="item in items" :key="item.slug" :item="item"/></div></template>
