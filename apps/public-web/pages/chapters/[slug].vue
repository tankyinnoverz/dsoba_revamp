<script setup lang="ts">
const route = useRoute()
const chapter = computed(() => ({
  professional: { title: 'Professional Chapters', type: 'Expertise', intro: 'Find your people through shared professional experience.', body: 'Professional chapters create a practical, generous network across industries including Legal, Medical, Finance, ICT & Media, Design & Built and more.' },
  overseas: { title: 'Overseas Chapters', type: 'Around the world', intro: 'Keep close to DSOBA wherever life takes you.', body: 'Overseas chapters help Old Boys stay connected through local gatherings, school links and a shared calendar of association moments.' },
  'music-sports': { title: 'Music & Sports', type: 'Shared interests', intro: 'Meet through the activities that bring us together.', body: 'Rehearsals, teams, competitions and family-friendly activities offer relaxed ways to build friendships across school years.' }
}[String(route.params.slug)] ?? { title: 'Chapter', type: 'DSOBA community', intro: 'A place to belong.', body: 'Chapter information will be published after the convenor confirms the details.' }))
useSeoMeta({ title: () => chapter.value.title })
</script>
<template><ContentPageLayout :eyebrow="chapter.type" :title="chapter.title" :intro="chapter.intro"><div class="grid gap-8 lg:grid-cols-[1.2fr_.8fr]"><article class="rounded-2xl bg-white p-8 shadow-sm"><p class="text-lg leading-8 text-[#102231]/75">{{ chapter.body }}</p></article><Card class="p-8"><p class="eyebrow">Get involved</p><h2 class="mt-4 text-3xl">Contact the chapter</h2><p class="mt-4 leading-7 text-[#102231]/70">Convenor contact details and upcoming activities will be added to this page.</p><NuxtLink to="/contact" class="mt-6 inline-flex rounded-full bg-[#d6ad55] px-5 py-3 font-bold">Contact DSOBA</NuxtLink></Card></div></ContentPageLayout></template>
