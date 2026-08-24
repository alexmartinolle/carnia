'use client'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useState } from 'react'
import { z } from 'zod'
import Image from 'next/image'

const LoginSchema = z.object({
  email: z.string().email('Email no válido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router   = useRouter()
  const locale   = useLocale()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const result = LoginSchema.safeParse({ email, password })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setLoading(true)
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    const role = data.user?.app_metadata?.role as string | undefined
    router.push(role === 'STAFF' ? `/${locale}/panel` : `/${locale}`)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/logo/logo_black.png"
            alt="El Uru"
            width={120}
            height={120}
            className="object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold text-center mb-6" style={{ color: '#1a1a1a' }}>
          Panel de Administración
        </h1>
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: '#e5e7eb', color: '#1a1a1a' }}
              placeholder="admin@eluru.es"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: '#e5e7eb', color: '#1a1a1a' }}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
            style={{ background: '#1a1a1a' }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
