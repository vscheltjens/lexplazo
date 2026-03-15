'use client'

import { useState, useMemo } from 'react'
import type { Tramite, Festivo } from '@/lib/db/schema'
import {
  addDiasHabiles,
  addMes,
  daysUntil,
  fmtShort,
  fmtWeekday,
  toISO,
} from '@/lib/calculator'

interface DeadlineResult {
  vencimiento: Date
  tramiteName: string
  plazoLabel:  string
  ccaaNombre:  string
  ccaaId:      string
  fechaNotif:  Date
  diasRestantes: number
}

const CCAA_LIST = [
  { id: 'AND', name: 'Andalucía' },
  { id: 'ARA', name: 'Aragón' },
  { id: 'AST', name: 'Asturias' },
  { id: 'BAL', name: 'Illes Balears' },
  { id: 'CAN', name: 'Canarias' },
  { id: 'CTB', name: 'Cantabria' },
  { id: 'CLM', name: 'Castilla-La Mancha' },
  { id: 'CYL', name: 'Castilla y León' },
  { id: 'CAT', name: 'Catalunya' },
  { id: 'CEU', name: 'Ceuta' },
  { id: 'EXT', name: 'Extremadura' },
  { id: 'GAL', name: 'Galicia' },
  { id: 'MAD', name: 'Madrid' },
  { id: 'MEL', name: 'Melilla' },
  { id: 'MUR', name: 'Murcia' },
  { id: 'NAV', name: 'Navarra' },
  { id: 'PVA', name: 'País Vasco' },
  { id: 'RIO', name: 'La Rioja' },
  { id: 'VAL', name: 'Comunitat Valenciana' },
]

function getTodayISO(): string {
  return toISO(new Date())
}

interface Props {
  tramites: Tramite[]
  festivos: Festivo[]
}

export function CalculatorClient({ tramites, festivos }: Props) {
  const [selectedTramite, setSelectedTramite] = useState<Tramite | null>(null)
  const [fechaNotif, setFechaNotif] = useState<string>(getTodayISO())
  const [comunidadId, setComunidadId] = useState<string>('MAD')
  const [result, setResult] = useState<DeadlineResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'nac' | 'ccaa'>('nac')
  const [reminderEmail, setReminderEmail] = useState('')
  const [reminderStatus, setReminderStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [reminderDate, setReminderDate] = useState<string | null>(null)
  const [reminderError, setReminderError] = useState<string | null>(null)

  // Build festivos sets
  const festivosNac = useMemo(
    () => festivos.filter((f) => f.ccaa === 'NAC'),
    [festivos],
  )

  const festivosCcaa = useMemo(
    () => festivos.filter((f) => f.ccaa === comunidadId),
    [festivos, comunidadId],
  )

  const festivosSet = useMemo(() => {
    const set = new Set<string>()
    festivosNac.forEach((f) => set.add(f.fecha))
    festivosCcaa.forEach((f) => set.add(f.fecha))
    return set
  }, [festivosNac, festivosCcaa])

  const ccaaNombre = CCAA_LIST.find((c) => c.id === comunidadId)?.name ?? comunidadId

  function handleCalcular() {
    setError(null)
    if (!selectedTramite) {
      setError('Selecciona un tipo de trámite.')
      return
    }
    if (!fechaNotif) {
      setError('Introduce la fecha de notificación.')
      return
    }

    const fechaDate = new Date(fechaNotif + 'T12:00:00')
    let vencimiento: Date

    if (selectedTramite.tipoCompute === 'mes') {
      vencimiento = addMes(fechaDate, festivosSet)
    } else {
      const dias = selectedTramite.diasCount ?? 20
      vencimiento = addDiasHabiles(fechaDate, dias, festivosSet)
    }

    const diasRestantes = daysUntil(vencimiento)

    setResult({
      vencimiento,
      tramiteName:   selectedTramite.name,
      plazoLabel:    selectedTramite.plazoLabel,
      ccaaNombre,
      ccaaId:        comunidadId,
      fechaNotif:    fechaDate,
      diasRestantes,
    })
  }

  async function handleReminder(e: React.FormEvent) {
    e.preventDefault()
    if (!result) return
    setReminderStatus('loading')
    setReminderError(null)
    try {
      const res = await fetch('/api/recordatorios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: reminderEmail,
          tramiteNombre: result.tramiteName,
          fechaVencimiento: toISO(result.vencimiento),
          ccaa: result.ccaaId,
          plazoLabel: result.plazoLabel,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setReminderError(data.error ?? 'Error al registrar el recordatorio.')
        setReminderStatus('error')
      } else {
        setReminderDate(data.fechaRecordatorio)
        setReminderStatus('success')
      }
    } catch {
      setReminderError('Error de conexión. Inténtalo de nuevo.')
      setReminderStatus('error')
    }
  }

  const isWarn    = result !== null && result.diasRestantes >= 0 && result.diasRestantes <= 5
  const isExpired = result !== null && result.diasRestantes < 0

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--lx-offwhite)' }}>
      {/* HEADER */}
      <header className="bg-white border-b border-lx-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 md:px-10 flex items-center justify-between h-16">
          <a href="/" className="font-serif text-xl font-semibold tracking-wide text-lx-navy leading-none">
            LexPlazo
          </a>
          <nav className="hidden md:flex gap-8">
            <a href="#tramites" className="text-xs tracking-wider text-lx-muted hover:text-lx-navy transition-colors uppercase">
              Trámites
            </a>
            <a href="#festivos" className="text-xs tracking-wider text-lx-muted hover:text-lx-navy transition-colors uppercase">
              Festivos
            </a>
            <a href="/admin/tramites" className="text-xs tracking-wider text-lx-muted hover:text-lx-navy transition-colors uppercase">
              Admin
            </a>
          </nav>
          <span className="text-[11px] font-medium text-lx-ochre bg-lx-ochre/10 px-3 py-1 rounded-full tracking-wider border border-lx-ochre/20">
            Plazos Procesales
          </span>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-lx-navy relative overflow-hidden py-12 md:py-16 px-6 md:px-10">
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px]"
          style={{ background: 'linear-gradient(90deg, #c8922a, #e8b84b, transparent)' }}
        />
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] font-medium text-lx-ochre tracking-[0.12em] uppercase mb-3">
            Área Laboral
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-white leading-tight max-w-xl mb-3">
            Calculadora de Plazos Procesales
          </h1>
          <p className="text-white/50 text-sm max-w-lg">
            Cómputo automático de plazos laborales conforme a la LRJS, ET y LPACAP, con festivos por comunidad autónoma según el BOE.
          </p>
        </div>
      </section>

      {/* MAIN */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 md:px-10 py-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">

        {/* LEFT COLUMN */}
        <div className="space-y-5">

          {/* Step 1 — Tramite */}
          <div id="tramites" className="bg-white border border-lx-border rounded-sm">
            <div className="px-6 py-4 border-b border-lx-border flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-lx-navy text-white text-[11px] font-medium flex items-center justify-center flex-shrink-0">1</span>
              <h2 className="font-serif text-base font-medium text-lx-navy tracking-wide">Tipo de trámite</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {tramites.map((t) => {
                  const isSelected = selectedTramite?.id === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => { setSelectedTramite(t); setResult(null) }}
                      className={[
                        'relative text-left px-4 py-3.5 rounded-sm border transition-all duration-200',
                        isSelected
                          ? 'bg-lx-navy border-lx-navy'
                          : 'bg-lx-offwhite border-lx-border hover:border-lx-blue hover:bg-white',
                      ].join(' ')}
                      aria-pressed={isSelected}
                    >
                      {isSelected && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-lx-ochre rounded-b-sm" />
                      )}
                      <div className={`text-[13px] font-medium leading-snug mb-1 ${isSelected ? 'text-white' : 'text-lx-navy'}`}>
                        {t.name}
                      </div>
                      <div className={`text-[11px] ${isSelected ? 'text-lx-ochre-lt' : 'text-lx-muted'}`}>
                        {t.plazoLabel}
                      </div>
                    </button>
                  )
                })}
              </div>

              {selectedTramite?.descripcion && (
                <div className="mt-4 text-[12.5px] text-lx-muted bg-lx-offwhite border-l-2 border-lx-ochre px-4 py-2.5 leading-relaxed">
                  {selectedTramite.descripcion}
                </div>
              )}
            </div>
          </div>

          {/* Step 2 — Notification data */}
          <div className="bg-white border border-lx-border rounded-sm">
            <div className="px-6 py-4 border-b border-lx-border flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-lx-navy text-white text-[11px] font-medium flex items-center justify-center flex-shrink-0">2</span>
              <h2 className="font-serif text-base font-medium text-lx-navy tracking-wide">Datos de la notificación</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label htmlFor="fecha-notif" className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1.5">
                  Fecha de notificación / recepción
                </label>
                <input
                  id="fecha-notif"
                  type="date"
                  value={fechaNotif}
                  onChange={(e) => { setFechaNotif(e.target.value); setResult(null) }}
                  className="w-full px-3 py-2.5 text-sm border border-lx-border rounded-sm bg-white text-lx-text focus:outline-none focus:border-lx-blue transition-colors"
                />
              </div>

              <div>
                <label htmlFor="comunidad" className="block text-[11px] font-medium text-lx-muted uppercase tracking-[0.04em] mb-1.5">
                  Comunidad Autónoma
                </label>
                <div className="relative">
                  <select
                    id="comunidad"
                    value={comunidadId}
                    onChange={(e) => { setComunidadId(e.target.value); setResult(null) }}
                    className="w-full px-3 py-2.5 text-sm border border-lx-border rounded-sm bg-white text-lx-text appearance-none focus:outline-none focus:border-lx-blue transition-colors pr-8"
                  >
                    {CCAA_LIST.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lx-muted text-xs">▾</span>
                </div>
                <p className="mt-1.5 text-[11px] text-lx-muted">
                  {festivosNac.length} festivos nacionales + {festivosCcaa.length} festivos de {ccaaNombre}
                </p>
              </div>

              {error && (
                <div role="alert" className="text-[13px] text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleCalcular}
                className="relative w-full py-3.5 bg-lx-navy text-white text-sm font-medium tracking-[0.04em] rounded-sm overflow-hidden transition-colors hover:bg-lx-blue focus:outline-none focus:ring-2 focus:ring-lx-ochre focus:ring-offset-2"
              >
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-lx-ochre" />
                Calcular fecha de vencimiento
              </button>
            </div>
          </div>

          {/* Step 3 — Festivos panel */}
          <div id="festivos" className="bg-white border border-lx-border rounded-sm">
            <div className="px-6 py-4 border-b border-lx-border flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-lx-navy text-white text-[11px] font-medium flex items-center justify-center flex-shrink-0">3</span>
              <h2 className="font-serif text-base font-medium text-lx-navy tracking-wide">Festivos aplicables</h2>
            </div>
            <div className="px-6 pt-4 pb-0">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-lx-ochre bg-lx-ochre/10 border border-lx-ochre/25 px-3 py-1 rounded-full mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-lx-ochre inline-block" />
                BOE 2025–2026 · Datos oficiales
              </span>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-lx-border px-6">
              <button
                onClick={() => setActiveTab('nac')}
                className={`py-2.5 px-4 text-xs font-medium tracking-wide border-b-2 -mb-px transition-all ${
                  activeTab === 'nac'
                    ? 'text-lx-navy border-lx-ochre'
                    : 'text-lx-muted border-transparent hover:text-lx-navy'
                }`}
              >
                Nacionales
              </button>
              <button
                onClick={() => setActiveTab('ccaa')}
                className={`py-2.5 px-4 text-xs font-medium tracking-wide border-b-2 -mb-px transition-all ${
                  activeTab === 'ccaa'
                    ? 'text-lx-navy border-lx-ochre'
                    : 'text-lx-muted border-transparent hover:text-lx-navy'
                }`}
              >
                Autonómicos
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto px-6 py-3">
              {activeTab === 'nac' ? (
                festivosNac.length > 0 ? (
                  <ul className="divide-y divide-lx-warm">
                    {festivosNac.map((f) => (
                      <li key={f.id} className="flex justify-between items-center py-1.5 text-[12.5px]">
                        <span className="font-medium text-lx-navy min-w-[110px]">
                          {new Date(f.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-lx-muted text-right">{f.nombre}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-lx-muted py-3">No hay festivos nacionales en el período.</p>
                )
              ) : (
                festivosCcaa.length > 0 ? (
                  <ul className="divide-y divide-lx-warm">
                    {festivosCcaa.map((f) => (
                      <li key={f.id} className="flex justify-between items-center py-1.5 text-[12.5px]">
                        <span className="font-medium text-lx-navy min-w-[110px]">
                          {new Date(f.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-lx-muted text-right">{f.nombre}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-lx-muted py-3">
                    No hay festivos autonómicos registrados para el período seleccionado.
                  </p>
                )
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Result */}
        <div className="lg:sticky lg:top-24 space-y-4">
          {!result ? (
            <div className="bg-white border border-lx-border rounded-sm p-10 text-center text-lx-muted">
              <div className="w-12 h-12 rounded-full border border-lx-border flex items-center justify-center mx-auto mb-4 text-xl">
                ⊙
              </div>
              <p className="text-[13px] leading-relaxed">
                Selecciona el tipo de trámite, introduce la fecha de notificación y pulsa calcular.
              </p>
            </div>
          ) : (
            <>
            <div
              className={`rounded-sm overflow-hidden animate-[fadeUp_0.3s_ease] ${
                isWarn || isExpired ? 'bg-[#3d2008]' : 'bg-lx-navy'
              }`}
              role="region"
              aria-label="Resultado del cálculo"
            >
              {/* Top: date */}
              <div className="px-6 pt-7 pb-6 relative border-b border-white/10">
                <div
                  className="absolute bottom-0 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg, #c8922a, transparent)' }}
                />
                <p className="text-[10px] font-medium text-lx-ochre-lt tracking-[0.12em] uppercase mb-2">
                  Fecha de vencimiento
                </p>
                <p className={`font-serif text-3xl font-medium leading-snug mb-1.5 ${isExpired ? 'text-[#f4a05a]' : 'text-white'}`}>
                  {fmtShort(result.vencimiento)}
                </p>
                <p className="text-[13px] text-white/50">
                  {fmtWeekday(result.vencimiento)}
                </p>
              </div>

              {/* Body rows */}
              <div className="px-6 py-5 space-y-0 divide-y divide-white/[0.07]">
                {[
                  { label: 'Trámite',      value: result.tramiteName },
                  { label: 'Comunidad',    value: result.ccaaNombre },
                  { label: 'Notificación', value: fmtShort(result.fechaNotif) },
                  { label: 'Plazo',        value: result.plazoLabel },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 text-[13px]">
                    <span className="text-white/45">{label}</span>
                    <span className="text-white font-medium text-right max-w-[200px]">{value}</span>
                  </div>
                ))}
              </div>

              {/* Countdown */}
              <div className="mx-6 mb-5 bg-white/[0.06] rounded-sm px-4 py-3 flex items-center gap-3">
                <span className={`font-serif text-4xl font-medium leading-none ${isExpired || isWarn ? 'text-[#f4a05a]' : 'text-lx-ochre-lt'}`}>
                  {Math.abs(result.diasRestantes)}
                </span>
                <span className="text-[12px] text-white/50 leading-snug">
                  {isExpired
                    ? <>días de retraso<br />plazo vencido</>
                    : result.diasRestantes === 0
                      ? <>vence hoy<br />actuar de inmediato</>
                      : <>días naturales<br />hasta el vencimiento</>
                  }
                </span>
              </div>

              {/* Warning alert */}
              {(isWarn || isExpired) && (
                <div className="mx-6 mb-6 bg-[rgba(244,160,90,0.1)] border border-[rgba(244,160,90,0.3)] rounded-sm px-3.5 py-2.5 flex items-start gap-2 text-[12px] text-[#f4a05a] leading-snug">
                  <span className="w-4 h-4 rounded-full border border-[#f4a05a] flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">!</span>
                  {isExpired
                    ? 'Plazo vencido — verificar posibilidad de subsanación.'
                    : 'Plazo inminente — revisar y actuar con urgencia.'}
                </div>
              )}
            </div>

            {/* ── Reminder card ── */}
            {!isExpired && (
              <div className="bg-lx-navy/95 border border-white/10 rounded-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10">
                  <p className="text-[11px] font-medium text-lx-ochre tracking-[0.1em] uppercase mb-0.5">
                    Recordatorio de vencimiento
                  </p>
                  <p className="text-[12px] text-white/50 leading-snug">
                    Recibe un aviso por email 2 días hábiles antes de que venza el plazo.
                  </p>
                </div>
                <div className="px-5 py-4">
                  {reminderStatus === 'success' && reminderDate ? (
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-lx-ochre/20 border border-lx-ochre flex items-center justify-center text-lx-ochre text-[11px] font-bold flex-shrink-0 mt-0.5">✓</span>
                      <div>
                        <p className="text-[13px] text-white font-medium">Recordatorio registrado</p>
                        <p className="text-[12px] text-white/50 mt-0.5">
                          Te avisaremos el{' '}
                          <span className="text-lx-ochre-lt font-medium">
                            {new Date(reminderDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleReminder} className="space-y-3">
                      <div>
                        <label htmlFor="reminder-email" className="block text-[11px] font-medium text-white/40 uppercase tracking-[0.04em] mb-1.5">
                          Tu email
                        </label>
                        <input
                          id="reminder-email"
                          type="email"
                          required
                          value={reminderEmail}
                          onChange={(e) => setReminderEmail(e.target.value)}
                          placeholder="nombre@despacho.com"
                          className="w-full px-3 py-2.5 text-sm bg-white/[0.07] border border-white/15 rounded-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lx-ochre/50 transition-colors"
                        />
                      </div>
                      {reminderError && (
                        <p className="text-[12px] text-[#f4a05a]">{reminderError}</p>
                      )}
                      <button
                        type="submit"
                        disabled={reminderStatus === 'loading'}
                        className="relative w-full py-2.5 bg-white/[0.08] hover:bg-white/[0.13] border border-white/15 hover:border-lx-ochre/40 text-white text-[13px] font-medium tracking-wide rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                      >
                        <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-lx-ochre/60" />
                        {reminderStatus === 'loading' ? 'Registrando…' : 'Avísame antes del vencimiento'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-lx-navy border-t border-white/[0.07] py-5 px-6 text-center text-[12px] text-white/30">
        © 2026 LexPlazo &nbsp;·&nbsp;{' '}
        <span className="text-lx-ochre">Herramienta de uso profesional</span>
        {' '}&nbsp;·&nbsp; Los cálculos son orientativos y no sustituyen el criterio del abogado responsable.
      </footer>

    </div>
  )
}
