
<script setup lang="ts">
import { events } from '~/data/content'
const route = useRoute()
const item = events.find((entry) => entry.slug === route.params.slug)
if (!item) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
useSeoMeta({ title: item.title })
</script>
<template><ContentPageLayout :eyebrow="item!.category" :title="item!.title" :intro="item!.excerpt"><div class="grid gap-8 md:grid-cols-[1.4fr_.6fr]"><ResponsiveImage :src="item!.image" :alt="item!.title"/><Card class="p-7"><Badge>{{item!.status}}</Badge><p class="mt-6 font-bold text-[#7a2737]">{{item!.date}}</p><p class="mt-2">{{item!.venue}}</p><p class="mt-8 text-sm leading-6 text-[#102231]/60">Registration is not live. This is a Sprint 0 demonstration.</p></Card></div></ContentPageLayout></template>
