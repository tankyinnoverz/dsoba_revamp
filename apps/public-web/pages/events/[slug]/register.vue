<script setup lang="ts">
const route = useRoute()
const submitted = ref(false)
useSeoMeta({ title: 'Event registration' })
</script>
<template><ContentPageLayout eyebrow="EVENTS" title="Register your interest." intro="Event registration is being prepared for the integrated events release."><div v-if="submitted" class="rounded-2xl bg-white p-8 shadow-sm"><p class="eyebrow">Registration received</p><h2 class="mt-3 text-4xl">Thank you.</h2><p class="mt-4 leading-7 text-[#102231]/70">Your local staging registration reference is {{ route.params.slug }}-demo.</p></div><form v-else class="grid max-w-2xl gap-4 rounded-2xl bg-white p-8 shadow-sm" @submit.prevent="submitted = true"><label>Full name *<input required autocomplete="name"></label><label>Email *<input required type="email" autocomplete="email"></label><label>Message<textarea rows="4"></textarea></label><label class="inline-flex items-start gap-3"><input required type="checkbox" class="mt-1"> I consent to event registration processing.</label><button class="w-fit rounded-full bg-[#d6ad55] px-6 py-3 font-bold">Submit registration</button></form></ContentPageLayout></template>
