import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { setToken, setUnauthorizedHandler, USER_KEY, getToken } from '../lib/api'
import { authService, userService } from '../lib/services'
import type { LoginRequest, UserResponse } from '../lib/types'

interface AuthContextValue {
  user: UserResponse | null
  isAuthenticated: boolean
  loading: boolean
  login: (body: LoginRequest) => Promise<void>
  loginWithToken: (token: string, user?: UserResponse) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  setUser: (user: UserResponse) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readStoredUser(): UserResponse | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as UserResponse) : null
  } catch {
    return null
  }
}

function writeStoredUser(user: UserResponse | null) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserResponse | null>(readStoredUser)
  const [loading, setLoading] = useState<boolean>(() => !!getToken())

  const setUser = useCallback((u: UserResponse) => {
    setUserState(u)
    writeStoredUser(u)
  }, [])

  const clearSession = useCallback(() => {
    setToken(null)
    writeStoredUser(null)
    setUserState(null)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // ignore network/logout failures — we clear locally regardless
    } finally {
      clearSession()
    }
  }, [clearSession])

  const refreshUser = useCallback(async () => {
    if (!getToken()) return
    const info = await userService.myInfo()
    setUser(info)
  }, [setUser])

  const login = useCallback(
    async (body: LoginRequest) => {
      const res = await authService.login(body)
      setToken(res.token)
      if (res.user) setUser(res.user)
      else await refreshUser()
    },
    [refreshUser, setUser],
  )

  const loginWithToken = useCallback(
    async (token: string, u?: UserResponse) => {
      setToken(token)
      if (u) setUser(u)
      else await refreshUser()
    },
    [refreshUser, setUser],
  )

  // Wire global 401 handler so any expired session bounces to login.
  useEffect(() => {
    setUnauthorizedHandler(() => clearSession())
  }, [clearSession])

  // On boot, if we have a token, validate it by fetching the profile.
  useEffect(() => {
    let cancelled = false
    if (!getToken()) {
      setLoading(false)
      return
    }
    userService
      .myInfo()
      .then((info) => {
        if (!cancelled) setUser(info)
      })
      .catch(() => {
        if (!cancelled) clearSession()
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [clearSession, setUser])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user || !!getToken(),
      loading,
      login,
      loginWithToken,
      logout,
      refreshUser,
      setUser,
    }),
    [user, loading, login, loginWithToken, logout, refreshUser, setUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
