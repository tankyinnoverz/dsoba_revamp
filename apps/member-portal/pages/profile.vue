<script setup lang="ts">
const { request } = useMemberAuth()
const { data, status, error } = await useAsyncData('own-profile', () => request<{ name: string; email: string; mobile: string; industry: string; profession: string; directoryVisible: boolean; phoneVisible: boolean }>('/auth/profile'))
const form = reactive({ mobile: '', industry: '', profession: '', directoryVisible: false, phoneVisible: false })
watch(data, (value: typeof form | null | undefined) => { if (value) for (const key of Object.keys(form) as (keyof typeof form)[]) Object.assign(form, { [key]: value[key] }) }, { immediate: true })
const saving = ref(false), message = ref('')
const save = async () => {
  saving.value = true; message.value = ''
  try { await request('/auth/profile', { method: 'POST', body: { ...form } }); message.value = 'Your profile and privacy settings have been saved.' }
  catch { message.value = 'Unable to save. Please try again.' }
  finally { saving.value = false }
}
</script>
<template>
  <section class="max-w-2xl"><h1 class="text-5xl">Your profile</h1>
    <p v-if="status === 'pending'" class="mt-8" role="status">Loading your profile…</p>
    <p v-else-if="error" class="mt-8" role="alert">Your profile is unavailable. Active membership is required.</p>
    <PortalCard v-else-if="data" class="mt-8">
      <h2 class="text-2xl">{{ data.name }}</h2><p class="mt-2">{{ data.email }}</p>
      <form class="mt-8 space-y-5" @submit.prevent="save">
        <label class="block font-bold">Mobile<input v-model="form.mobile" autocomplete="tel" maxlength="160" class="mt-2 w-full border p-3"></label>
        <label class="block font-bold">Industry<input v-model="form.industry" maxlength="160" class="mt-2 w-full border p-3"></label>
        <label class="block font-bold">Profession<input v-model="form.profession" maxlength="160" class="mt-2 w-full border p-3"></label>
        <fieldset class="space-y-4 border-t pt-5"><legend class="font-bold">Directory privacy</legend>
          <label class="flex items-start gap-3"><input v-model="form.directoryVisible" type="checkbox" class="mt-1">Show my name, industry and profession to active members in the directory</label>
          <label class="flex items-start gap-3"><input v-model="form.phoneVisible" type="checkbox" class="mt-1">Also show my mobile number when my directory profile is visible</label>
        </fieldset>
        <p v-if="message" role="status">{{ message }}</p>
        <button :disabled="saving" class="bg-[#d6ad55] px-6 py-3 font-bold disabled:opacity-50">{{ saving ? 'Saving…' : 'Save changes' }}</button>
      </form>
    </PortalCard>
  </section>
</template>
