'use client'

import { useState, ChangeEvent } from 'react'
import Link from 'next/link'
import { createTramite } from '../actions'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function NewTramitePage() {
  const [tipoCompute, setTipoCompute] = useState<'habiles' | 'mes' | 'naturales'>('habiles')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
    if (!slugEdited) {
      setSlug(slugify(e.target.value))
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const fd = new FormData(e.currentTarget)
      await createTramite(fd)
    } catch (err) {
      setError('Error al crear el trámite. Verifica que el slug no esté duplicado.')
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/tramites" className="text-lx-muted hover:text-lx-navy text-sm transition-colors">
          ← Trámites
        </Link>
        <span className="text-lx-border">/</span>
        <h1 className="font-serif text-2xl font-medium text-lx-navy">Nuevo trámite</h1>
      </div>

      <div className="bg-white border border-lx-border rounded-sm">
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1.5">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                required
                onChange={handleNameChange}
                className="w-full px-3 py-2.5 text-sm border border-lx-border rounded-sm focus:outline-none focus:border-lx-blue transition-colors"
                placeholder="Recurso de alzada"
              />
            </div>
            <div>
              <label htmlFor="slug" className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1.5">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                id="slug"
                name="slug"
                required
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugEdited(true) }}
                className="w-full px-3 py-2.5 text-sm border border-lx-border rounded-sm focus:outline-none focus:border-lx-blue transition-colors font-mono"
                placeholder="recurso-alzada"
              />
            </div>
          </div>

          <div>
            <label htmlFor="plazoLabel" className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1.5">
              Etiqueta del plazo <span className="text-red-500">*</span>
            </label>
            <input
              id="plazoLabel"
              name="plazoLabel"
              required
              className="w-full px-3 py-2.5 text-sm border border-lx-border rounded-sm focus:outline-none focus:border-lx-blue transition-colors"
              placeholder="20 días hábiles"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="tipoCompute" className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1.5">
                Tipo de cómputo <span className="text-red-500">*</span>
              </label>
              <select
                id="tipoCompute"
                name="tipoCompute"
                value={tipoCompute}
                onChange={(e) => setTipoCompute(e.target.value as typeof tipoCompute)}
                className="w-full px-3 py-2.5 text-sm border border-lx-border rounded-sm focus:outline-none focus:border-lx-blue bg-white"
              >
                <option value="habiles">Días hábiles</option>
                <option value="mes">Mes natural</option>
                <option value="naturales">Días naturales</option>
              </select>
            </div>
            {tipoCompute !== 'mes' && (
              <div>
                <label htmlFor="diasCount" className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1.5">
                  Número de días
                </label>
                <input
                  id="diasCount"
                  name="diasCount"
                  type="number"
                  min="1"
                  className="w-full px-3 py-2.5 text-sm border border-lx-border rounded-sm focus:outline-none focus:border-lx-blue transition-colors"
                  placeholder="20"
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="articuloLey" className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1.5">
              Artículo de ley
            </label>
            <input
              id="articuloLey"
              name="articuloLey"
              className="w-full px-3 py-2.5 text-sm border border-lx-border rounded-sm focus:outline-none focus:border-lx-blue transition-colors"
              placeholder="Art. 122 LPACAP"
            />
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1.5">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={4}
              className="w-full px-3 py-2.5 text-sm border border-lx-border rounded-sm focus:outline-none focus:border-lx-blue transition-colors resize-none"
              placeholder="Descripción detallada del trámite y su fundamento legal..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ordenDisplay" className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1.5">
                Orden de visualización
              </label>
              <input
                id="ordenDisplay"
                name="ordenDisplay"
                type="number"
                min="0"
                defaultValue="0"
                className="w-full px-3 py-2.5 text-sm border border-lx-border rounded-sm focus:outline-none focus:border-lx-blue transition-colors"
              />
            </div>
            <div className="flex items-end pb-2.5">
              <label className="flex items-center gap-2.5 text-sm text-lx-text cursor-pointer">
                <input name="activo" type="checkbox" defaultChecked className="w-4 h-4 accent-lx-navy" />
                Activo (visible en calculadora)
              </label>
            </div>
          </div>

          {error && (
            <div role="alert" className="text-[12px] text-red-600 bg-red-50 border border-red-200 px-3 py-2.5 rounded-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t border-lx-border">
            <Link
              href="/admin/tramites"
              className="flex-1 py-2.5 border border-lx-border text-sm text-lx-muted rounded-sm hover:bg-lx-offwhite transition-colors text-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-lx-navy text-white text-sm rounded-sm hover:bg-lx-blue transition-colors disabled:opacity-60"
            >
              {loading ? 'Creando…' : 'Crear trámite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
