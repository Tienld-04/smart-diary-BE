import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { History, MessageSquarePlus, Send, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'
import { chatService } from '../lib/services'
import { errorMessage } from '../lib/api'
import { cn, formatTime, relativeDate } from '../lib/utils'
import type { ChatSessionResponse, ChatSessionSummary } from '../lib/types'

interface ChatMsg {
  id: string
  role: 'user' | 'ai'
  text: string
  at: string
}

const SUGGESTIONS = [
  'Hôm nay mình thấy hơi mệt mỏi 😔',
  'Gợi ý cho mình cách thư giãn nhé',
  'Dựa vào nhật ký, mình nên cải thiện điều gì?',
  'Kể cho mình một câu chuyện truyền cảm hứng',
]

export default function ChatPage() {
  const { user } = useAuth()
  const storageKey = `smartdiary_chat_${user?.email ?? 'guest'}`

  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [title, setTitle] = useState<string | undefined>(undefined)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const [sessions, setSessions] = useState<ChatSessionSummary[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const counter = useRef(0)
  const nextId = () => `m${Date.now()}_${counter.current++}`

  // Restore the active conversation for this user from localStorage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as { title?: string; messages: ChatMsg[] }
        setMessages(parsed.messages ?? [])
        setTitle(parsed.title)
      } else {
        setMessages([])
        setTitle(undefined)
      }
    } catch {
      setMessages([])
    }
  }, [storageKey])

  // Persist + autoscroll on change.
  useEffect(() => {
    if (messages.length) {
      localStorage.setItem(storageKey, JSON.stringify({ title, messages }))
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, title, storageKey])

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true)
    try {
      setSessions(await chatService.sessions())
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setLoadingSessions(false)
    }
  }, [])

  // Fetch session list once on mount.
  useEffect(() => {
    void loadSessions()
  }, [loadSessions])

  const flatten = useCallback((res: ChatSessionResponse): ChatMsg[] => {
    const out: ChatMsg[] = []
    for (const m of res.messageResponses ?? []) {
      if (m.userMessage) out.push({ id: nextId(), role: 'user', text: m.userMessage, at: '' })
      if (m.chatMessage) out.push({ id: nextId(), role: 'ai', text: m.chatMessage, at: '' })
    }
    return out
  }, [])

  const openSession = async (sessionTitle: string) => {
    setShowHistory(false)
    setLoadingHistory(true)
    try {
      const res = await chatService.history(sessionTitle)
      setMessages(flatten(res))
      setTitle(res.title || sessionTitle)
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setLoadingHistory(false)
    }
  }

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setInput('')
    const isNewSession = !title
    const userMsg: ChatMsg = { id: nextId(), role: 'user', text: trimmed, at: new Date().toISOString() }
    setMessages((m) => [...m, userMsg])
    setSending(true)
    try {
      const res = await chatService.send(trimmed, title)
      if (res.title && !title) setTitle(res.title)
      const last = res.messageResponses?.[res.messageResponses.length - 1]
      const reply = last?.chatMessage ?? 'Mình ở đây lắng nghe bạn. 💜'
      setMessages((m) => [...m, { id: nextId(), role: 'ai', text: reply, at: new Date().toISOString() }])
      // Refresh the saved-session list (a new one may have just been created).
      if (isNewSession) void loadSessions()
    } catch (err) {
      toast.error(errorMessage(err))
      setMessages((m) => [
        ...m,
        {
          id: nextId(),
          role: 'ai',
          text: '⚠️ Xin lỗi, mình chưa kết nối được lúc này. Bạn thử lại sau nhé.',
          at: new Date().toISOString(),
        },
      ])
    } finally {
      setSending(false)
    }
  }

  const newChat = () => {
    localStorage.removeItem(storageKey)
    setMessages([])
    setTitle(undefined)
    setInput('')
    toast.success('Đã bắt đầu cuộc trò chuyện mới')
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-3xl flex-col">
      {/* Header */}
      <div className="card mb-4 flex items-center justify-between gap-2 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative shrink-0">
            <span className="btn-brand flex h-11 w-11 items-center justify-center rounded-2xl text-white">
              <Sparkles className="h-5.5 w-5.5" />
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-slate-800">{title ?? 'Trợ lý AI'}</p>
            <p className="text-xs text-emerald-500">● Đang hoạt động</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void loadSessions()
              setShowHistory(true)
            }}
            leftIcon={<History className="h-4 w-4" />}
          >
            <span className="hidden sm:inline">Lịch sử</span>
          </Button>
          <Button variant="soft" size="sm" onClick={newChat} leftIcon={<MessageSquarePlus className="h-4 w-4" />}>
            <span className="hidden sm:inline">Trò chuyện mới</span>
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="scrollbar-slim card relative flex-1 space-y-4 overflow-y-auto p-5">
        {loadingHistory && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[var(--radius-2xl)] bg-white/60 backdrop-blur-sm">
            <Spinner />
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="btn-brand flex h-20 w-20 items-center justify-center rounded-[1.6rem] text-white shadow-lg"
            >
              <Sparkles className="h-9 w-9" />
            </motion.div>
            <h2 className="mt-5 text-xl font-bold text-slate-800">Xin chào, mình là trợ lý của bạn 💜</h2>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Mình có thể lắng nghe, động viên và đưa lời khuyên dựa trên những trang nhật ký gần đây của bạn.
            </p>
            <div className="mt-6 grid w-full max-w-md gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex items-end gap-2.5', m.role === 'user' ? 'flex-row-reverse' : '')}
              >
                {m.role === 'ai' ? (
                  <span className="btn-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white">
                    <Sparkles className="h-4.5 w-4.5" />
                  </span>
                ) : (
                  <Avatar name={user?.fullName} src={user?.avatarUrl} size={36} />
                )}
                <div
                  className={cn(
                    'max-w-[78%] rounded-3xl px-4 py-3 text-[0.95rem] leading-relaxed shadow-sm',
                    m.role === 'user'
                      ? 'btn-brand rounded-br-lg text-white'
                      : 'rounded-bl-lg border border-slate-100 bg-white text-slate-700',
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.at && (
                    <p className={cn('mt-1 text-right text-[0.65rem]', m.role === 'user' ? 'text-white/70' : 'text-slate-300')}>
                      {formatTime(m.at)}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {sending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2.5">
            <span className="btn-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white">
              <Sparkles className="h-4.5 w-4.5" />
            </span>
            <div className="flex gap-1.5 rounded-3xl rounded-bl-lg border border-slate-100 bg-white px-4 py-4">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-brand-400"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="card mt-4 flex items-center gap-2 p-2.5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhắn gì đó cho trợ lý của bạn…"
          className="ring-focus h-12 flex-1 rounded-2xl bg-transparent px-4 text-[0.95rem] text-slate-800 placeholder:text-slate-400 focus:bg-slate-50"
        />
        <Button type="submit" size="icon" className="h-12 w-12 shrink-0" loading={sending} aria-label="Gửi">
          {!sending && <Send className="h-5 w-5" />}
        </Button>
      </form>

      {/* History modal */}
      <Modal
        open={showHistory}
        onClose={() => setShowHistory(false)}
        title="Lịch sử trò chuyện"
        description="Chọn một cuộc trò chuyện để mở lại."
      >
        {loadingSessions ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : sessions.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 py-10 text-center text-sm text-slate-400">
            Chưa có cuộc trò chuyện nào được lưu.
          </p>
        ) : (
          <div className="scrollbar-slim max-h-[60vh] space-y-2 overflow-y-auto pr-1">
            {sessions.map((s) => {
              const active = s.title === title
              return (
                <button
                  key={s.id}
                  onClick={() => openSession(s.title)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition',
                    active
                      ? 'border-brand-300 bg-brand-50'
                      : 'border-slate-100 bg-white/70 hover:border-brand-200 hover:bg-brand-50/50',
                  )}
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-accent-100 text-brand-600">
                    <Sparkles className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold text-slate-800">{s.title}</p>
                      <span className="shrink-0 text-xs text-slate-400">{relativeDate(s.lastMessageAt)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-slate-500">{s.lastMessage || 'Cuộc trò chuyện trống'}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
        <div className="mt-4 border-t border-slate-100 pt-4">
          <Button
            variant="soft"
            className="w-full"
            leftIcon={<MessageSquarePlus className="h-4.5 w-4.5" />}
            onClick={() => {
              setShowHistory(false)
              newChat()
            }}
          >
            Bắt đầu trò chuyện mới
          </Button>
        </div>
      </Modal>
    </div>
  )
}
