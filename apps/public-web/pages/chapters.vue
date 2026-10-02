<script setup lang="ts">
import{chapters}from'~/data/content';const { t } = useLocale();useSeoMeta({title:t('chapters')})
</script>
<template><ContentPageLayout :eyebrow="t('chaptersEyebrow')" :title="t('chaptersTitle')" :intro="t('chaptersIntro')"><div class="grid gap-5 md:grid-cols-3"><ChapterCard v-for="c in chapters" :key="c.name" :item="c"/></div></ContentPageLayout></template>
