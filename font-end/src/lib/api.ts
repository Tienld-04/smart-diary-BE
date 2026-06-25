import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from './config'
import type { ApiErrorBody } from './types'

export const TOKEN_KEY = 'smartdiary_token'
export const USER_KEY = 'smartdiary_user'

export const DIARY_NOT_FOUND_CODE = 3003

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

// Attach bearer token to every request.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn
}

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

let refreshing: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const current = getToken()
  if (!current) return null
  try {
    const res = await refreshClient.post<{ token?: string }>('/auth/refresh', { token: current })
    const next = res.data?.token ?? null
    if (next) setToken(next)
    return next
  } catch {
    return null
  }
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status
    const original = error.config as RetriableConfig | undefined
    const url = original?.url ?? ''
    const isAuthCall =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh')

    if (status === 401 && original && !original._retry && !isAuthCall && getToken()) {
      original._retry = true
      refreshing =
        refreshing ??
        refreshAccessToken().finally(() => {
          refreshing = null
        })
      const newToken = await refreshing
      if (newToken) {
        return api(original)
      }
      setToken(null)
      onUnauthorized?.()
    }
    return Promise.reject(error)
  },
)

export function isEmptyResultError(error: unknown): boolean {
  const err = error as AxiosError<ApiErrorBody>
  return (
    err?.response?.status === 404 &&
    err.response?.data?.code === DIARY_NOT_FOUND_CODE
  )
}

export function errorMessage(error: unknown, fallback = 'Đã có lỗi xảy ra, vui lòng thử lại.'): string {
  const err = error as AxiosError<ApiErrorBody | string>
  const data = err?.response?.data
  if (typeof data === 'string' && data.trim()) return data
  if (data && typeof data === 'object') {
    const msg = (data as ApiErrorBody).message
    if (Array.isArray(msg)) return msg.join(' · ')
    if (typeof msg === 'string' && msg.trim()) return msg
  }
  if (err?.code === 'ERR_NETWORK') {
    return 'Không kết nối được tới máy chủ. Hãy chắc chắn backend đang chạy ở cổng 8080.'
  }
  if (err?.message) return err.message
  return fallback
}
