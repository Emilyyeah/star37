/* 登录页 — 用户名 + 密码表单 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/lib/authStore'
import { Lock, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const navigate = useNavigate()
  const loginByCredentials = useAuthStore((s) => s.loginByCredentials)
  const users = useAuthStore((s) => s.users)
  const getRoleName = useAuthStore((s) => s.getRoleName)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码')
      return
    }

    setLoading(true)
    setError('')

    // Mock 延迟模拟网络请求
    setTimeout(() => {
      const ok = loginByCredentials(username.trim(), password.trim())
      if (ok) {
        navigate('/')
      } else {
        setError('用户名或密码错误')
      }
      setLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo + 标题 */}
        <div className="text-center mb-8">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="37手游"
            className="h-8 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-900">魔方活动系统</h1>
          <p className="text-sm text-gray-400 mt-1">登录你的账号</p>
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          {/* 用户名 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">用户名</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError('') }}
                placeholder="请输入用户名"
                autoFocus
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all"
              />
            </div>
          </div>

          {/* 密码 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="请输入密码"
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all"
              />
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* 登录按钮 */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              'w-full py-2.5 rounded-xl text-sm font-semibold transition-colors',
              loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            )}
          >
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>

        {/* Demo 提示 */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-2">Demo 账号（密码统一 123456）</p>
          <div className="space-y-1">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => { setUsername(u.username); setPassword('123456'); setError('') }}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors text-left"
              >
                <span>{u.name}（{u.username}）</span>
                <span className="text-gray-400">{getRoleName(u.roleId)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
