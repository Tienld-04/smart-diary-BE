import { api, isEmptyResultError } from './api'
import { BACKEND_ORIGIN } from './config'
import type {
  AuthenticationResponse,
  ChangePasswordRequest,
  ChatSessionResponse,
  ChatSessionSummary,
  Diary,
  EmotionValue,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UserResponse,
} from './types'

async function listOrEmpty(call: Promise<{ data: Diary[] }>): Promise<Diary[]> {
  try {
    const res = await call
    return res.data ?? []
  } catch (err) {
    if (isEmptyResultError(err)) return []
    throw err
  }
}

// ── Auth ──────────────────────────────────────────────────────────
export const authService = {
  login: (body: LoginRequest) =>
    api.post<AuthenticationResponse>('/auth/login', body).then((r) => r.data),

  register: (body: RegisterRequest) =>
    api.post<UserResponse>('/auth/register', body).then((r) => r.data),

  logout: () => api.post<string>('/auth/logout').then((r) => r.data),

  changePassword: (body: ChangePasswordRequest) =>
    api.post<string>('/auth/change-password', body).then((r) => r.data),

  requestReset: (email: string) =>
    api.post<string>('/auth/request-reset', { email }).then((r) => r.data),

  resetPassword: (body: ResetPasswordRequest) =>
    api.post<string>('/auth/reset-password', body).then((r) => r.data),

  /** POST /auth/refresh — exchange a (still-valid) token for a fresh one. */
  refresh: (token: string) =>
    api.post<AuthenticationResponse>('/auth/refresh', { token }).then((r) => r.data),

  googleLoginUrl: () => `${BACKEND_ORIGIN}/oauth2/authorization/google`,
}

// ── User ──────────────────────────────────────────────────────────
export const userService = {
  myInfo: () => api.get<UserResponse>('/users/my-info').then((r) => r.data),
}

// ── Diaries ───────────────────────────────────────────────────────
export const diaryService = {
  all: () => listOrEmpty(api.get<Diary[]>('/diaries')),

  recent: () => listOrEmpty(api.get<Diary[]>('/diaries/recent')),

  create: (data: { title: string; content: string; images: File[] }) => {
    const fd = new FormData()
    fd.append('title', data.title)
    fd.append('content', data.content)
    data.images.forEach((file) => fd.append('images', file))
    return api
      .post<Diary>('/diaries', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data)
  },

  update: (
    id: number,
    data: { title: string; content: string; imageIdsToDelete: number[]; newImages: File[] },
  ) => {
    const fd = new FormData()
    fd.append('title', data.title)
    fd.append('content', data.content)
    // Wire name is "imageIds" — these are the media IDs to delete.
    data.imageIdsToDelete.forEach((mediaId) => fd.append('imageIds', String(mediaId)))
    data.newImages.forEach((file) => fd.append('newImages', file))
    return api
      .put<Diary>(`/diaries/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data)
  },

  remove: (ids: number[]) =>
    api.delete<{ status: string }>(`/diaries/${ids.join(',')}`).then((r) => r.data),

  searchByKeyword: (keyword: string) =>
    listOrEmpty(api.get<Diary[]>('/diaries/search/keyword', { params: { keyword } })),

  searchByEmotion: (emotion: EmotionValue | string) =>
    listOrEmpty(api.get<Diary[]>('/diaries/search/emotion', { params: { emotion } })),

  searchByDate: (fromDate?: string, toDate?: string) =>
    listOrEmpty(api.get<Diary[]>('/diaries/search/date', { params: { fromDate, toDate } })),

  search: (params: { fromDate?: string; toDate?: string; emotion?: string; keyword?: string }) =>
    listOrEmpty(api.get<Diary[]>('/diaries/search', { params })),

  emotionsByMonth: (year: number, month: number) =>
    api
      .get<Record<string, string>>('/diaries/emotions', { params: { year, month } })
      .then((r) => r.data ?? {}),

  getByDate: (year: number, month: number, day: number) =>
    listOrEmpty(api.get<Diary[]>('/diaries/date', { data: { year, month, day } })),
}

// ── Chat ──────────────────────────────────────────────────────────
export const chatService = {
  send: (message: string, title?: string) =>
    api
      .post<ChatSessionResponse>('/chat', { message, title: title ?? '' })
      .then((r) => r.data),
  history: (title: string) =>
    api.get<ChatSessionResponse>('/chat', { params: { title } }).then((r) => r.data),
  sessions: () =>
    api.get<ChatSessionSummary[]>('/chat/sessions').then((r) => r.data ?? []),
}
