<script setup lang="ts">
import type{NewsItem}from'~/types/content';defineProps<{items:NewsItem[]}>()
</script>
<template><div class="grid gap-6 md:grid-cols-3"><NewsCard v-for="item in items" :key="item.slug" :item="item"/></div></template>
