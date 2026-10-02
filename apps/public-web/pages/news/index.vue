<script setup lang="ts">
import{news}from'~/data/content';const { t } = useLocale();useSeoMeta({title:t('news')})
</script>
<template><ContentPageLayout :eyebrow="t('journal')" :title="t('latestNews')" :intro="t('heritageBody')"><NewsList :items="news"/></ContentPageLayout></template>
