<script setup lang="ts">
import{events}from'~/data/content';const { t } = useLocale();useSeoMeta({title:t('events')})
</script>
<template><ContentPageLayout :eyebrow="t('calendar')" :title="t('gather')" :intro="t('upcomingEvents')"><EventList :items="events"/></ContentPageLayout></template>
