'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Tramite } from '@/lib/db/schema'
import { updateTramite, deleteTramite } from './actions'

interface Props {
  tramites: Tramite[]
}

function EditModal({
  tramite,
  onClose,
}: {
  tramite: Tramite
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [tipoCompute, setTipoCompute] = useState(tramite.tipoCompute)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    try {
      await updateTramite(tramite.id, fd)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true" aria-label="Editar trámite">
      <div className="bg-white rounded-sm border border-lx-border w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-lx-border flex items-center justify-between">
          <h2 className="font-serif text-lg font-medium text-lx-navy">Editar trámite</h2>
          <button onClick={onClose} className="text-lx-muted hover:text-lx-text text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1">Slug</label>
            <input name="slug" defaultValue={tramite.slug} required className="w-full px-3 py-2 text-sm border border-lx-border rounded-sm focus:outline-none focus:border-lx-blue" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1">Nombre</label>
            <input name="name" defaultValue={tramite.name} required className="w-full px-3 py-2 text-sm border border-lx-border rounded-sm focus:outline-none focus:border-lx-blue" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1">Etiqueta del plazo</label>
            <input name="plazoLabel" defaultValue={tramite.plazoLabel} required className="w-full px-3 py-2 text-sm border border-lx-border rounded-sm focus:outline-none focus:border-lx-blue" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1">Tipo de cómputo</label>
            <select
              name="tipoCompute"
              value={tipoCompute}
              onChange={(e) => setTipoCompute(e.target.value as Tramite['tipoCompute'])}
              className="w-full px-3 py-2 text-sm border border-lx-border rounded-sm focus:outline-none focus:border-lx-blue bg-white"
            >
              <option value="habiles">Días hábiles</option>
              <option value="mes">Mes natural</option>
              <option value="naturales">Días naturales</option>
            </select>
          </div>
          {tipoCompute !== 'mes' && (
            <div>
              <label className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1">Número de días</label>
              <input name="diasCount" type="number" min="1" defaultValue={tramite.diasCount ?? ''} className="w-full px-3 py-2 text-sm border border-lx-border rounded-sm focus:outline-none focus:border-lx-blue" />
            </div>
          )}
          <div>
            <label className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1">Artículo de ley</label>
            <input name="articuloLey" defaultValue={tramite.articuloLey ?? ''} className="w-full px-3 py-2 text-sm border border-lx-border rounded-sm focus:outline-none focus:border-lx-blue" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1">Descripción</label>
            <textarea name="descripcion" rows={3} defaultValue={tramite.descripcion ?? ''} className="w-full px-3 py-2 text-sm border border-lx-border rounded-sm focus:outline-none focus:border-lx-blue resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1">Orden</label>
              <input name="ordenDisplay" type="number" min="0" defaultValue={tramite.ordenDisplay} className="w-full px-3 py-2 text-sm border border-lx-border rounded-sm focus:outline-none focus:border-lx-blue" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm text-lx-text cursor-pointer">
                <input name="activo" type="checkbox" defaultChecked={tramite.activo} className="w-4 h-4 accent-lx-navy" />
                Activo
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-lx-border text-sm text-lx-muted rounded-sm hover:bg-lx-offwhite transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-lx-navy text-white text-sm rounded-sm hover:bg-lx-blue transition-colors disabled:opacity-60">
              {loading ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function TramitesTable({ tramites }: Props) {
  const [editingTramite, setEditingTramite] = useState<Tramite | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('¿Desactivar este trámite?')) return
    setDeletingId(id)
    try {
      await deleteTramite(id)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      {editingTramite && (
        <EditModal tramite={editingTramite} onClose={() => setEditingTramite(null)} />
      )}

      <div className="bg-white border border-lx-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-lx-border bg-lx-offwhite">
              <th className="px-4 py-3 text-left text-[11px] font-medium text-lx-muted uppercase tracking-wider">Nombre</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-lx-muted uppercase tracking-wider">Plazo</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-lx-muted uppercase tracking-wider">Artículo</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-lx-muted uppercase tracking-wider">Tipo</th>
              <th className="px-4 py-3 text-center text-[11px] font-medium text-lx-muted uppercase tracking-wider">Activo</th>
              <th className="px-4 py-3 text-right text-[11px] font-medium text-lx-muted uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lx-border">
            {tramites.map((t) => (
              <tr key={t.id} className="hover:bg-lx-offwhite/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-lx-navy">{t.name}</div>
                  <div className="text-[11px] text-lx-muted">{t.slug}</div>
                </td>
                <td className="px-4 py-3 text-lx-text">{t.plazoLabel}</td>
                <td className="px-4 py-3 text-lx-muted text-xs">{t.articuloLey ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-lx-warm px-2 py-0.5 rounded-sm text-lx-navy">
                    {t.tipoCompute}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block w-2 h-2 rounded-full ${t.activo ? 'bg-green-500' : 'bg-lx-border'}`} />
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => setEditingTramite(t)}
                    className="text-xs text-lx-blue hover:text-lx-navy font-medium transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={deletingId === t.id}
                    className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
                  >
                    {deletingId === t.id ? '…' : 'Desactivar'}
                  </button>
                </td>
              </tr>
            ))}
            {tramites.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-lx-muted">
                  No hay trámites. <Link href="/admin/tramites/new" className="text-lx-blue hover:underline">Crear el primero.</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
