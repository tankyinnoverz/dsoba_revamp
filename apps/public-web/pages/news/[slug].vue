
<script setup lang="ts">
import { news } from '~/data/content'
const route = useRoute()
const item = news.find((entry) => entry.slug === route.params.slug)
if (!item) throw createError({ statusCode: 404, statusMessage: 'News item not found' })
useSeoMeta({ title: item.title })
</script>
<template><ContentPageLayout :eyebrow="`${item!.category} · ${item!.date}`" :title="item!.title" :intro="item!.excerpt"><ResponsiveImage v-if="item!.image" :src="item!.image" :alt="item!.title" ratio="aspect-[16/7]"/><div class="mx-auto mt-10 max-w-2xl"><p v-for="paragraph in item!.body" :key="paragraph" class="mb-5 text-lg leading-8 text-[#102231]/75">{{paragraph}}</p><Badge>Demonstration content</Badge></div></ContentPageLayout></template>
