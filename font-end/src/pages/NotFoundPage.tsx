import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Home } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Logo } from '../components/Logo'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo className="mb-10" />
      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="gradient-text text-8xl font-extrabold tracking-tight"
      >
        404
      </motion.h1>
      <h2 className="mt-4 text-2xl font-bold text-slate-800">Trang không tồn tại</h2>
      <p className="mt-2 max-w-sm text-slate-500">
        Có vẻ như trang nhật ký bạn tìm đã lạc mất. Hãy quay về trang chủ nhé.
      </p>
      <Link to="/" className="mt-7">
        <Button size="lg" leftIcon={<Home className="h-5 w-5" />}>
          Về trang chủ
        </Button>
      </Link>
    </div>
  )
}
