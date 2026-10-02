<script setup lang="ts">
const { t } = useLocale();useSeoMeta({title:t('membership')})
</script>
<template>
  <ContentPageLayout :eyebrow="t('membershipEyebrow')" :title="t('membershipTitle')" :intro="t('membershipIntro')">
    <div class="grid gap-5 md:grid-cols-3">
      <Card v-for="m in [{name:'Youth',note:'Unpaid · Under 18',detail:'No voting rights. Membership changes to Trial at 18.'},{name:'Trial',note:'Unpaid · Adult',detail:'Expires on December 31 of the year of your 28th birthday. No voting rights.'},{name:'Life',note:'HKD 2,000 · Any age',detail:'Requires verified payment and approval. Under-18 members are Life (Youth), without voting rights until 18.'}]" :key="m.name" class="p-7">
        <Badge>{{m.note}}</Badge><h2 class="mt-5 text-4xl">{{m.name}}</h2><p class="mt-4 leading-7 text-[#102231]/65">{{m.detail}}</p>
      </Card>
    </div>
    <p class="mt-8">School attendance and eligibility are reviewed by the General Committee. A 60-day grace period follows Trial expiry.</p>
    <NuxtLink to="/membership/apply" class="mt-6 inline-flex rounded-full bg-[#d6ad55] px-6 py-3 font-bold">Apply for membership</NuxtLink>
  </ContentPageLayout>
</template>
