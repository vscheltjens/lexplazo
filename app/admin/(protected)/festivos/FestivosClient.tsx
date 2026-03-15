'use client'

import { useState, useTransition, FormEvent } from 'react'
import type { Festivo, BoeSyncLog } from '@/lib/db/schema'
import type { BoeDocumentCandidate } from '@/lib/boe'
import { searchBoe, syncFromBoe, deleteFestivo, createFestivo } from './actions'

interface Props {
  festivosData: Festivo[]
  syncLogs:     BoeSyncLog[]
  currentYear:  number
  nextYear:     number
  ccaaList:     { id: string; name: string }[]
}

export function FestivosClient({ festivosData, syncLogs, currentYear, nextYear, ccaaList }: Props) {
  // BOE sync state
  const [boeYear, setBoeYear]           = useState(nextYear)
  const [boeResults, setBoeResults]     = useState<BoeDocumentCandidate[]>([])
  const [selectedBoe, setSelectedBoe]   = useState<string>('')
  const [syncResult, setSyncResult]     = useState<{ status: string; festivosCount: number | null; errorMessage: string | null } | null>(null)
  const [isPending, startTransition]    = useTransition()

  // Festivos filter state
  const [filterYear, setFilterYear]   = useState<number | 'all'>('all')
  const [filterCcaa, setFilterCcaa]   = useState<string>('all')

  // Manual add state
  const [showAddForm, setShowAddForm] = useState(false)
  const [addLoading, setAddLoading]   = useState(false)

  function handleSearch() {
    startTransition(async () => {
      setBoeResults([])
      setSyncResult(null)
      const results = await searchBoe(boeYear)
      setBoeResults(results)
      if (results.length > 0) setSelectedBoe(results[0].id)
    })
  }

  function handleSync() {
    if (!selectedBoe) return
    startTransition(async () => {
      setSyncResult(null)
      const result = await syncFromBoe(selectedBoe, boeYear)
      setSyncResult(result)
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este festivo?')) return
    await deleteFestivo(id)
  }

  async function handleAddFestivo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAddLoading(true)
    const fd = new FormData(e.currentTarget)
    try {
      await createFestivo(fd)
      setShowAddForm(false)
      ;(e.target as HTMLFormElement).reset()
    } finally {
      setAddLoading(false)
    }
  }

  const filteredFestivos = festivosData.filter((f) => {
    if (filterYear !== 'all' && f.anio !== filterYear) return false
    if (filterCcaa !== 'all' && f.ccaa !== filterCcaa) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* BOE Sync section */}
      <div className="bg-white border border-lx-border rounded-sm">
        <div className="px-6 py-4 border-b border-lx-border">
          <h2 className="font-serif text-lg font-medium text-lx-navy">Sincronización BOE</h2>
          <p className="text-xs text-lx-muted mt-1">Busca y sincroniza el Real Decreto de calendario laboral publicado en el BOE.</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-end gap-3">
            <div>
              <label className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1.5">Año</label>
              <select
                value={boeYear}
                onChange={(e) => setBoeYear(parseInt(e.target.value, 10))}
                className="px-3 py-2 text-sm border border-lx-border rounded-sm bg-white focus:outline-none focus:border-lx-blue"
              >
                <option value={currentYear}>{currentYear}</option>
                <option value={nextYear}>{nextYear}</option>
              </select>
            </div>
            <button
              onClick={handleSearch}
              disabled={isPending}
              className="px-4 py-2 bg-lx-navy text-white text-sm rounded-sm hover:bg-lx-blue transition-colors disabled:opacity-60"
            >
              {isPending ? 'Buscando…' : 'Buscar en BOE'}
            </button>
          </div>

          {boeResults.length > 0 && (
            <div className="space-y-3">
              <label className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em]">
                Documentos encontrados ({boeResults.length})
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {boeResults.map((r) => (
                  <label key={r.id} className="flex items-start gap-3 p-3 border border-lx-border rounded-sm cursor-pointer hover:bg-lx-offwhite">
                    <input
                      type="radio"
                      name="boeDoc"
                      value={r.id}
                      checked={selectedBoe === r.id}
                      onChange={() => setSelectedBoe(r.id)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-sm font-medium text-lx-navy">{r.id}</div>
                      <div className="text-xs text-lx-muted">{r.titulo}</div>
                      <div className="text-xs text-lx-muted">{r.fecha}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={selectedBoe}
                  onChange={(e) => setSelectedBoe(e.target.value)}
                  placeholder="O introduce el ID manualmente, p. ej. BOE-A-2024-22354"
                  className="flex-1 px-3 py-2 text-sm border border-lx-border rounded-sm focus:outline-none focus:border-lx-blue"
                />
                <button
                  onClick={handleSync}
                  disabled={isPending || !selectedBoe}
                  className="px-4 py-2 bg-lx-ochre text-white text-sm rounded-sm hover:bg-lx-ochre-lt transition-colors disabled:opacity-60 whitespace-nowrap"
                >
                  {isPending ? 'Sincronizando…' : 'Sincronizar festivos'}
                </button>
              </div>
            </div>
          )}

          {boeResults.length === 0 && !isPending && (
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={selectedBoe}
                onChange={(e) => setSelectedBoe(e.target.value)}
                placeholder="O introduce el ID del BOE directamente, p. ej. BOE-A-2024-22354"
                className="flex-1 px-3 py-2 text-sm border border-lx-border rounded-sm focus:outline-none focus:border-lx-blue"
              />
              <button
                onClick={handleSync}
                disabled={isPending || !selectedBoe}
                className="px-4 py-2 bg-lx-ochre text-white text-sm rounded-sm hover:bg-lx-ochre-lt transition-colors disabled:opacity-60 whitespace-nowrap"
              >
                Sincronizar
              </button>
            </div>
          )}

          {syncResult && (
            <div className={`px-4 py-3 rounded-sm text-sm ${syncResult.status === 'ok' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              {syncResult.status === 'ok'
                ? `Sincronización completada. ${syncResult.festivosCount} festivos importados.`
                : `Error: ${syncResult.errorMessage}`}
            </div>
          )}
        </div>
      </div>

      {/* Sync logs */}
      {syncLogs.length > 0 && (
        <div className="bg-white border border-lx-border rounded-sm">
          <div className="px-6 py-4 border-b border-lx-border">
            <h2 className="font-serif text-base font-medium text-lx-navy">Últimas sincronizaciones</h2>
          </div>
          <div className="divide-y divide-lx-border">
            {syncLogs.map((log) => (
              <div key={log.id} className="px-6 py-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-lx-navy">{log.boeRef}</span>
                  <span className="text-lx-muted ml-2 text-xs">{log.anio}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-lx-muted">
                  {log.festivosCount !== null && <span>{log.festivosCount} festivos</span>}
                  <span className={log.status === 'ok' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {log.status}
                  </span>
                  <span>{new Date(log.triggeredAt).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Festivos table */}
      <div className="bg-white border border-lx-border rounded-sm">
        <div className="px-6 py-4 border-b border-lx-border flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-serif text-lg font-medium text-lx-navy">
            Festivos ({filteredFestivos.length})
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterYear === 'all' ? 'all' : String(filterYear)}
              onChange={(e) => setFilterYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
              className="px-3 py-1.5 text-xs border border-lx-border rounded-sm bg-white focus:outline-none"
            >
              <option value="all">Todos los años</option>
              <option value={currentYear}>{currentYear}</option>
              <option value={nextYear}>{nextYear}</option>
            </select>
            <select
              value={filterCcaa}
              onChange={(e) => setFilterCcaa(e.target.value)}
              className="px-3 py-1.5 text-xs border border-lx-border rounded-sm bg-white focus:outline-none"
            >
              <option value="all">Todas las CCAA</option>
              {ccaaList.map((c) => (
                <option key={c.id} value={c.id}>{c.id} — {c.name}</option>
              ))}
            </select>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 bg-lx-navy text-white text-xs rounded-sm hover:bg-lx-blue transition-colors"
            >
              + Añadir manual
            </button>
          </div>
        </div>

        {/* Manual add form */}
        {showAddForm && (
          <div className="px-6 py-4 bg-lx-offwhite border-b border-lx-border">
            <form onSubmit={handleAddFestivo} className="flex items-end gap-3 flex-wrap">
              <div>
                <label className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1">Fecha</label>
                <input name="fecha" type="date" required className="px-3 py-2 text-sm border border-lx-border rounded-sm bg-white focus:outline-none focus:border-lx-blue" />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1">Nombre</label>
                <input name="nombre" required placeholder="Nombre del festivo" className="w-full px-3 py-2 text-sm border border-lx-border rounded-sm bg-white focus:outline-none focus:border-lx-blue" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1">CCAA</label>
                <select name="ccaa" className="px-3 py-2 text-sm border border-lx-border rounded-sm bg-white focus:outline-none">
                  {ccaaList.map((c) => (
                    <option key={c.id} value={c.id}>{c.id} — {c.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={addLoading} className="px-4 py-2 bg-lx-ochre text-white text-sm rounded-sm hover:bg-lx-ochre-lt transition-colors disabled:opacity-60">
                {addLoading ? 'Guardando…' : 'Guardar'}
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-lx-border text-sm rounded-sm hover:bg-white transition-colors">
                Cancelar
              </button>
            </form>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-lx-border bg-lx-offwhite">
                <th className="px-4 py-3 text-left text-[11px] font-medium text-lx-muted uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-lx-muted uppercase tracking-wider">Nombre</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-lx-muted uppercase tracking-wider">CCAA</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-lx-muted uppercase tracking-wider">Fuente</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-lx-muted uppercase tracking-wider">BOE Ref</th>
                <th className="px-4 py-3 text-right text-[11px] font-medium text-lx-muted uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lx-border">
              {filteredFestivos.map((f) => (
                <tr key={f.id} className="hover:bg-lx-offwhite/50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-lx-navy text-xs">
                    {new Date(f.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-2.5 text-lx-text">{f.nombre}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs bg-lx-warm px-2 py-0.5 rounded-sm text-lx-navy font-medium">{f.ccaa}</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-lx-muted">{f.fuente}</td>
                  <td className="px-4 py-2.5 text-xs text-lx-muted">{f.boeRef ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {filteredFestivos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-lx-muted">
                    No hay festivos para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
