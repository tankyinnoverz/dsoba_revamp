<script setup lang="ts">
const { request } = useMemberAuth()
const search = ref(''), industry = ref(''), profession = ref('')
const { data, status, error, refresh } = await useAsyncData('directory', () => request<Array<{ id: string; name: string; industry: string; profession: string; mobile?: string }>>('/auth/directory', { query: { search: search.value, industry: industry.value, profession: profession.value } }))
</script>
<template>
  <section><h1 class="text-5xl">Alumni directory</h1><p class="mt-4">Connect with members who have chosen to share their profile.</p>
    <form class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" @submit.prevent="refresh()">
      <label>Name<input v-model="search" maxlength="160" class="mt-2 w-full border p-3"></label>
      <label>Industry<input v-model="industry" maxlength="160" class="mt-2 w-full border p-3"></label>
      <label>Profession<input v-model="profession" maxlength="160" class="mt-2 w-full border p-3"></label>
      <button :disabled="status === 'pending'" class="self-end bg-[#d6ad55] p-3 font-bold">Search</button>
    </form>
    <p v-if="status === 'pending'" class="mt-8" role="status">Searching…</p>
    <p v-else-if="error" class="mt-8" role="alert">Unable to load the directory. Active membership is required.</p>
    <p v-else-if="!data?.length" class="mt-8">No matching profiles are available.</p>
    <div v-else class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><PortalCard v-for="member in data" :key="member.id"><h2 class="text-2xl">{{ member.name }}</h2><p class="mt-2">{{ member.industry }}</p><p>{{ member.profession }}</p><p v-if="member.mobile" class="mt-4">{{ member.mobile }}</p></PortalCard></div>
  </section>
</template>
