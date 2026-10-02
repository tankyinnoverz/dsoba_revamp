<script setup lang="ts">
import { events, transactions } from '~/data/member'

const { t } = useLocale()
const { session } = useMemberAuth()
const memberName = computed(() => session.value?.name?.split(' ')[0] ?? 'Member')
const membershipStatusClass = computed(() => session.value?.membershipStatus === 'Suspended' ? 'text-[#7a2737]' : 'text-green-700')
</script>
<template>
  <div>
    <p class="text-xs font-bold uppercase tracking-widest text-[#7a2737]">{{ t('memberHome') }}</p>
    <h1 class="mt-3 text-5xl">{{ t('goodAfternoon') }}, {{ memberName }}.</h1>
    <div class="mt-8 grid gap-5 md:grid-cols-3">
      <PortalCard>
        <small>{{ t('membership') }}</small>
        <h2 class="mt-2 text-2xl">{{ session?.membershipType ?? '—' }}</h2>
        <p class="mt-2 text-sm" :class="membershipStatusClass">{{ session?.membershipStatus ?? '—' }}</p>
      </PortalCard>
      <PortalCard><small>{{ t('events') }}</small><h2 class="mt-2 text-4xl">{{ events.length }}</h2></PortalCard>
      <PortalCard><small>{{ t('transactions') }}</small><h2 class="mt-2 text-4xl">{{ transactions.length }}</h2></PortalCard>
    </div>
  </div>
</template>
