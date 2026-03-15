'use client'

import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Credenciales incorrectas. Verifica el usuario y la contraseña.')
      } else {
        router.push('/admin/tramites')
        router.refresh()
      }
    } catch {
      setError('Error inesperado. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-lx-offwhite flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="font-serif text-2xl font-semibold text-lx-navy tracking-wide">
            LexPlazo
          </a>
          <p className="text-xs text-lx-muted mt-1 tracking-widest uppercase">Panel de administración</p>
        </div>

        <div className="bg-white border border-lx-border rounded-sm shadow-sm">
          <div className="px-6 py-5 border-b border-lx-border">
            <h1 className="font-serif text-lg font-medium text-lx-navy">Acceso restringido</h1>
            <p className="text-[12px] text-lx-muted mt-1">Introduce tus credenciales de administrador.</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
            <div>
              <label htmlFor="username" className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1.5">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-lx-border rounded-sm bg-white text-lx-text focus:outline-none focus:border-lx-blue transition-colors"
                placeholder="admin"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1.5">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-lx-border rounded-sm bg-white text-lx-text focus:outline-none focus:border-lx-blue transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div role="alert" className="text-[12px] text-red-600 bg-red-50 border border-red-200 px-3 py-2.5 rounded-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-3 bg-lx-navy text-white text-sm font-medium tracking-[0.04em] rounded-sm overflow-hidden transition-colors hover:bg-lx-blue disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-lx-ochre focus:ring-offset-2"
            >
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-lx-ochre" />
              {loading ? 'Verificando…' : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-lx-muted">
          <a href="/" className="hover:text-lx-navy transition-colors">← Volver a la calculadora</a>
        </p>
      </div>
    </div>
  )
}
