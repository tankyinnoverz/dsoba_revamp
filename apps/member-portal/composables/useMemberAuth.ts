export interface MemberSession {
  memberId: string
  email: string
  name: string
  membershipStatus: 'Active' | 'Suspended'
  membershipType: 'Youth' | 'Trial' | 'Life'
  expiresAt?: string
  membershipLabel?: string
  votingEligible?: boolean
  history?: Array<{ action: string; effectiveOn: string; nextType: string; nextStatus: string }>
  upgradeRequired?: boolean
  graceEndsOn?: string
  mustChangePassword?: boolean
}

interface AuthResponse {
  accessToken: string
  refreshToken?: string
  member: MemberSession
}

export const useMemberAuth = () => {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('dsoba-member-session', {
    default: () => null,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  })
  const session = useState<MemberSession | null>('member-session', () => null)
  const busy = useState<boolean>('member-auth-busy', () => false)
  const error = useState<string | null>('member-auth-error', () => null)

  const request = <T>(path: string, options: Parameters<typeof $fetch<T>>[1] = {}) =>
    $fetch<T>(`${config.public.apiBase}${path}`, {
      ...options,
      headers: {
        ...(options.headers ?? {}),
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {})
      }
    })

  const login = async (email: string, password: string) => {
    busy.value = true
    error.value = null
    try {
      const result = await request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } })
      token.value = result.accessToken
      session.value = result.member
      return result.member
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Unable to sign in'
      throw cause
    } finally {
      busy.value = false
    }
  }

  const refresh = async () => {
    if (!token.value) return null
    try {
      const result = await request<{ member: MemberSession }>('/auth/session')
      session.value = result.member
      return result.member
    } catch {
      token.value = null
      session.value = null
      clearNuxtData(['own-profile', 'directory'])
      return null
    }
  }

  const logout = async () => {
    try {
      if (token.value) await request('/auth/logout', { method: 'POST' })
    } finally {
      token.value = null
      session.value = null
      clearNuxtData(['own-profile', 'directory'])
    }
  }

  const isAuthenticated = computed(() => Boolean(token.value && session.value))
  const isSuspended = computed(() => session.value?.membershipStatus === 'Suspended')

  return { token, session, busy, error, request, login, refresh, logout, isAuthenticated, isSuspended }
}
