import { db } from '@/lib/db'
import { festivos, boeSyncLogs } from '@/lib/db/schema'
import { desc, eq, or } from 'drizzle-orm'
import type { Festivo, BoeSyncLog } from '@/lib/db/schema'
import { FestivosClient } from './FestivosClient'

const CCAA_LIST = [
  { id: 'NAC', name: 'Nacional' },
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

async function getData() {
  const currentYear = new Date().getFullYear()
  const nextYear = currentYear + 1

  const [festivosData, syncLogs] = await Promise.all([
    db
      .select()
      .from(festivos)
      .where(or(eq(festivos.anio, currentYear), eq(festivos.anio, nextYear)))
      .orderBy(festivos.fecha),
    db
      .select()
      .from(boeSyncLogs)
      .orderBy(desc(boeSyncLogs.triggeredAt))
      .limit(5),
  ])

  return { festivosData, syncLogs, currentYear, nextYear }
}

export default async function FestivosPage() {
  const { festivosData, syncLogs, currentYear, nextYear } = await getData()

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-medium text-lx-navy">Festivos</h1>
        <p className="text-sm text-lx-muted mt-1">Gestiona el calendario de festivos. Sincroniza desde el BOE o añade manualmente.</p>
      </div>

      <FestivosClient
        festivosData={festivosData}
        syncLogs={syncLogs}
        currentYear={currentYear}
        nextYear={nextYear}
        ccaaList={CCAA_LIST}
      />
    </div>
  )
}
