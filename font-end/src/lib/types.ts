export type EmotionValue =
  | 'Tích cực 😊'
  | 'Tiêu cực 😢'
  | 'Bình thường 😐'
  | 'Lo lắng 😟'
  | 'Tức giận 😡'

export interface UserResponse {
  fullName: string
  email: string
  avatarUrl: string | null
  createdAt: string | null
}

export interface AuthenticationResponse {
  token: string
  authenticated: boolean
  user: UserResponse
}

export interface DiaryMedia {
  id: number
  imageUrl: string
}

export interface Diary {
  id: number
  title: string
  content: string
  emotion: EmotionValue | string | null
  advice: string | null
  listMedia: DiaryMedia[] | null
  createAt: string | null
}

export interface ChatMessageResponse {
  userMessage: string | null
  chatMessage: string | null
}

export interface ChatSessionResponse {
  title: string
  messageResponses: ChatMessageResponse[]
}

export interface ChatSessionSummary {
  id: number
  title: string
  lastMessage: string
  lastMessageAt: string | null
  createdAt: string | null
}

/** Standard error body from GlobalExceptionHandler. */
export interface ApiErrorBody {
  code?: number
  message?: string | string[]
  status?: number
}


export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullname: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmNewPassword: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
  confirmPassword: string
}
