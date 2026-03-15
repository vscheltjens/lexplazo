'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { loginAction } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="relative w-full py-3 bg-lx-navy text-white text-sm font-medium tracking-[0.04em] rounded-sm overflow-hidden transition-colors hover:bg-lx-blue disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-lx-ochre focus:ring-offset-2"
    >
      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-lx-ochre" />
      {pending ? 'Verificando…' : 'Iniciar sesión'}
    </button>
  )
}

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, {})

  return (
    <div className="min-h-screen bg-lx-offwhite flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
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

          <form action={formAction} className="px-6 py-6 space-y-5">
            <div>
              <label htmlFor="username" className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1.5">
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                defaultValue="admin"
                className="w-full px-3 py-2.5 text-sm border border-lx-border rounded-sm bg-white text-lx-text focus:outline-none focus:border-lx-blue transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1.5">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-3 py-2.5 text-sm border border-lx-border rounded-sm bg-white text-lx-text focus:outline-none focus:border-lx-blue transition-colors"
                placeholder="••••••••"
              />
            </div>

            {state?.error && (
              <div role="alert" className="text-[12px] text-red-600 bg-red-50 border border-red-200 px-3 py-2.5 rounded-sm">
                {state.error}
              </div>
            )}

            <SubmitButton />
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-lx-muted">
          <a href="/" className="hover:text-lx-navy transition-colors">← Volver a la calculadora</a>
        </p>
      </div>
    </div>
  )
}
