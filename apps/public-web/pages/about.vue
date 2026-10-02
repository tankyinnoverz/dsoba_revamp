<script setup lang="ts">
const { t } = useLocale();useSeoMeta({title:t('about')})
</script>
<template><ContentPageLayout :eyebrow="t('aboutEyebrow')" :title="t('aboutTitle')" :intro="t('aboutIntro')"><div class="grid gap-10 md:grid-cols-2"><div><h2 class="text-4xl">{{t('ourStory')}}</h2><p class="mt-5 leading-8 text-[#102231]/70">{{t('heritageBody')}}</p></div><ResponsiveImage src="/assets/grand-steps.jpg" alt="Historic school steps"/></div></ContentPageLayout></template>
