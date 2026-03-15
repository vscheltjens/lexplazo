export function toISO(d: Date): string {
  return d.toISOString().split('T')[0]
}

export function isHabil(d: Date, festivos: Set<string>): boolean {
  const dow = d.getDay()
  if (dow === 0 || dow === 6) return false
  return !festivos.has(toISO(d))
}

export function addDiasHabiles(start: Date, dias: number, festivos: Set<string>): Date {
  const d = new Date(start)
  d.setDate(d.getDate() + 1)
  let count = 0
  while (count < dias) {
    if (isHabil(d, festivos)) count++
    if (count < dias) d.setDate(d.getDate() + 1)
  }
  while (!isHabil(d, festivos)) d.setDate(d.getDate() + 1)
  return d
}

export function addMes(start: Date, festivos: Set<string>): Date {
  const d = new Date(start)
  d.setMonth(d.getMonth() + 1)
  while (!isHabil(d, festivos)) d.setDate(d.getDate() + 1)
  return d
}

export function daysUntil(d: Date): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function fmtShort(d: Date): string {
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function fmtWeekday(d: Date): string {
  return d.toLocaleDateString('es-ES', { weekday: 'long' }).replace(/^\w/, (c) => c.toUpperCase())
}
