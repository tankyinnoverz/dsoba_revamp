<script setup lang="ts">
const { session } = useMemberAuth()
const historyLabel: Record<string, string> = { youth_to_trial: 'Youth membership changed to Trial', life_upgrade_due: 'Life upgrade due', grace_expired: 'Upgrade grace period ended' }
</script>
<template>
  <section><h1 class="text-5xl">Membership</h1>
    <PortalCard v-if="session" class="mt-8">
      <p class="text-xs font-bold uppercase tracking-widest text-[#7a2737]">{{ session.membershipStatus }}</p>
      <h2 class="mt-3 text-3xl">{{ session.membershipLabel ?? session.membershipType }} Member</h2>
      <dl class="mt-6 grid gap-5 sm:grid-cols-2">
        <div><dt class="text-sm text-gray-600">Voting eligibility record</dt><dd>{{ session.votingEligible ? 'Eligible' : 'Not eligible' }}</dd></div>
        <div v-if="session.expiresAt"><dt class="text-sm text-gray-600">Trial expiry date</dt><dd>{{ session.expiresAt }}</dd></div>
        <div v-if="session.graceEndsOn"><dt class="text-sm text-gray-600">Upgrade deadline</dt><dd>{{ session.graceEndsOn }}</dd></div>
      </dl>
      <div v-if="session.upgradeRequired || session.membershipStatus === 'Suspended'" class="mt-6 border-t pt-5">
        <p>Life Membership costs HKD 2,000. Verified payment is required to activate the upgrade.</p>
        <p v-if="session.membershipStatus === 'Suspended'" class="mt-3 text-[#7a2737]">Your access is restricted until the upgrade is completed.</p>
        <p class="mt-3 text-sm">Online payment is not available in this build.</p>
      </div>
    </PortalCard>
    <PortalCard v-if="session?.history?.length" class="mt-6"><h2 class="text-2xl">Membership history</h2><ol class="mt-4 space-y-4"><li v-for="(entry, index) in session.history" :key="index"><time>{{ entry.effectiveOn }}</time><p>{{ historyLabel[entry.action] ?? entry.action }} · {{ entry.nextType }} · {{ entry.nextStatus }}</p></li></ol></PortalCard>
  </section>
</template>
