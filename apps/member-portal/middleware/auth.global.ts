export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login' || to.path.startsWith('/verify') || to.path.startsWith('/reset-password')) return

  const { token, refresh } = useMemberAuth()
  if (!token.value) return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  const member = await refresh()
  if (!member) return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  if (member.membershipStatus === 'Suspended' && to.path !== '/membership') return navigateTo('/membership')
})
