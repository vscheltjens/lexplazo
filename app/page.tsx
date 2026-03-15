import { CalculatorClient } from '@/components/CalculatorClient'
import type { Tramite, Festivo } from '@/lib/db/schema'

// Hardcoded fallback data in case DB is not configured
const FALLBACK_TRAMITES: Tramite[] = [
  {
    id:           'alzada-fallback',
    slug:         'alzada',
    name:         'Recurso de alzada',
    plazoLabel:   '1 mes natural',
    diasCount:    null,
    tipoCompute:  'mes',
    articuloLey:  'Art. 122 LPACAP',
    descripcion:  'Art. 122 LPACAP — 1 mes natural desde la notificación del acto impugnado. El cómputo se realiza de fecha a fecha. Si el vencimiento recae en festivo o fin de semana, se traslada al siguiente día hábil.',
    ordenDisplay: 0,
    activo:       true,
    createdAt:    new Date(),
    updatedAt:    new Date(),
  },
  {
    id:           'recl-fallback',
    slug:         'recl',
    name:         'Reclamación previa',
    plazoLabel:   '20 días hábiles',
    diasCount:    20,
    tipoCompute:  'habiles',
    articuloLey:  'Art. 70 LRJS',
    descripcion:  'Art. 70 LRJS — 20 días hábiles desde la fecha del hecho causante o desde la notificación de la resolución empresarial. Requisito previo obligatorio en determinados supuestos frente a Administraciones Públicas.',
    ordenDisplay: 1,
    activo:       true,
    createdAt:    new Date(),
    updatedAt:    new Date(),
  },
  {
    id:           'smac-fallback',
    slug:         'smac',
    name:         'Papeleta de conciliación',
    plazoLabel:   '20 días hábiles',
    diasCount:    20,
    tipoCompute:  'habiles',
    articuloLey:  'Art. 65 LRJS',
    descripcion:  'Art. 65 LRJS — La presentación de la papeleta ante el SMAC interrumpe los plazos de caducidad y prescripción. Tramitar antes de la demanda en la mayoría de reclamaciones.',
    ordenDisplay: 2,
    activo:       true,
    createdAt:    new Date(),
    updatedAt:    new Date(),
  },
  {
    id:           'demanda-fallback',
    slug:         'demanda',
    name:         'Demanda Juzgado Social',
    plazoLabel:   '20 días hábiles',
    diasCount:    20,
    tipoCompute:  'habiles',
    articuloLey:  'Art. 59 ET / Art. 69 LRJS',
    descripcion:  'Art. 59 ET / Art. 69 LRJS — Plazo de caducidad de 20 días hábiles desde la fecha del despido o del acto objeto de impugnación. Es improrrogable y su incumplimiento determina la firmeza del acto.',
    ordenDisplay: 3,
    activo:       true,
    createdAt:    new Date(),
    updatedAt:    new Date(),
  },
]

const FALLBACK_FESTIVOS_RAW: Array<{ d: string; n: string; ccaa: string }> = [
  { d: '2025-01-01', n: 'Año Nuevo',                   ccaa: 'NAC' },
  { d: '2025-01-06', n: 'Epifanía del Señor',           ccaa: 'NAC' },
  { d: '2025-04-17', n: 'Jueves Santo',                 ccaa: 'NAC' },
  { d: '2025-04-18', n: 'Viernes Santo',                ccaa: 'NAC' },
  { d: '2025-05-01', n: 'Día del Trabajo',              ccaa: 'NAC' },
  { d: '2025-08-15', n: 'Asunción de la Virgen',        ccaa: 'NAC' },
  { d: '2025-10-12', n: 'Fiesta Nacional de España',    ccaa: 'NAC' },
  { d: '2025-11-01', n: 'Todos los Santos',             ccaa: 'NAC' },
  { d: '2025-12-06', n: 'Día de la Constitución',       ccaa: 'NAC' },
  { d: '2025-12-08', n: 'Inmaculada Concepción',        ccaa: 'NAC' },
  { d: '2025-12-25', n: 'Natividad del Señor',          ccaa: 'NAC' },
  { d: '2026-01-01', n: 'Año Nuevo',                    ccaa: 'NAC' },
  { d: '2026-01-06', n: 'Epifanía del Señor',           ccaa: 'NAC' },
  { d: '2026-04-02', n: 'Jueves Santo',                 ccaa: 'NAC' },
  { d: '2026-04-03', n: 'Viernes Santo',                ccaa: 'NAC' },
  { d: '2026-05-01', n: 'Día del Trabajo',              ccaa: 'NAC' },
  { d: '2026-08-15', n: 'Asunción de la Virgen',        ccaa: 'NAC' },
  { d: '2026-10-12', n: 'Fiesta Nacional de España',    ccaa: 'NAC' },
  { d: '2026-11-01', n: 'Todos los Santos',             ccaa: 'NAC' },
  { d: '2026-12-06', n: 'Día de la Constitución',       ccaa: 'NAC' },
  { d: '2026-12-08', n: 'Inmaculada Concepción',        ccaa: 'NAC' },
  { d: '2026-12-25', n: 'Natividad del Señor',          ccaa: 'NAC' },
  { d: '2025-02-28', n: 'Día de Andalucía',             ccaa: 'AND' },
  { d: '2025-04-18', n: 'Viernes Santo (local)',        ccaa: 'AND' },
  { d: '2026-02-28', n: 'Día de Andalucía',             ccaa: 'AND' },
  { d: '2026-04-02', n: 'Jueves Santo (local)',         ccaa: 'AND' },
  { d: '2025-04-23', n: 'San Jorge',                    ccaa: 'ARA' },
  { d: '2026-04-23', n: 'San Jorge',                    ccaa: 'ARA' },
  { d: '2025-09-08', n: 'Día de Asturias',              ccaa: 'AST' },
  { d: '2026-09-08', n: 'Día de Asturias',              ccaa: 'AST' },
  { d: '2025-03-01', n: 'Día de las Illes Balears',     ccaa: 'BAL' },
  { d: '2026-03-01', n: 'Día de las Illes Balears',     ccaa: 'BAL' },
  { d: '2025-05-30', n: 'Día de Canarias',              ccaa: 'CAN' },
  { d: '2026-05-30', n: 'Día de Canarias',              ccaa: 'CAN' },
  { d: '2025-07-28', n: 'Día de Cantabria',             ccaa: 'CTB' },
  { d: '2026-07-28', n: 'Día de Cantabria',             ccaa: 'CTB' },
  { d: '2025-05-31', n: 'Corpus Christi',               ccaa: 'CLM' },
  { d: '2026-05-31', n: 'Corpus Christi',               ccaa: 'CLM' },
  { d: '2025-04-23', n: 'Día de Castilla y León',       ccaa: 'CYL' },
  { d: '2026-04-23', n: 'Día de Castilla y León',       ccaa: 'CYL' },
  { d: '2025-04-23', n: 'Sant Jordi',                   ccaa: 'CAT' },
  { d: '2025-06-24', n: 'Sant Joan',                    ccaa: 'CAT' },
  { d: '2026-04-23', n: 'Sant Jordi',                   ccaa: 'CAT' },
  { d: '2026-06-24', n: 'Sant Joan',                    ccaa: 'CAT' },
  { d: '2025-03-05', n: 'Carnaval',                     ccaa: 'CEU' },
  { d: '2026-03-05', n: 'Carnaval',                     ccaa: 'CEU' },
  { d: '2025-09-08', n: 'Día de Extremadura',           ccaa: 'EXT' },
  { d: '2026-09-08', n: 'Día de Extremadura',           ccaa: 'EXT' },
  { d: '2025-07-25', n: 'Día de Galicia',               ccaa: 'GAL' },
  { d: '2026-07-25', n: 'Día de Galicia',               ccaa: 'GAL' },
  { d: '2025-05-02', n: 'Comunidad de Madrid',          ccaa: 'MAD' },
  { d: '2025-05-15', n: 'San Isidro',                   ccaa: 'MAD' },
  { d: '2026-05-02', n: 'Comunidad de Madrid',          ccaa: 'MAD' },
  { d: '2026-05-15', n: 'San Isidro',                   ccaa: 'MAD' },
  { d: '2025-09-02', n: 'Día de Melilla',               ccaa: 'MEL' },
  { d: '2026-09-02', n: 'Día de Melilla',               ccaa: 'MEL' },
  { d: '2025-06-09', n: 'Día de la Región de Murcia',   ccaa: 'MUR' },
  { d: '2026-06-09', n: 'Día de la Región de Murcia',   ccaa: 'MUR' },
  { d: '2025-09-27', n: 'Día de Navarra',               ccaa: 'NAV' },
  { d: '2026-09-27', n: 'Día de Navarra',               ccaa: 'NAV' },
  { d: '2025-10-25', n: 'Día del País Vasco',           ccaa: 'PVA' },
  { d: '2026-10-25', n: 'Día del País Vasco',           ccaa: 'PVA' },
  { d: '2025-06-11', n: 'Día de La Rioja',              ccaa: 'RIO' },
  { d: '2026-06-11', n: 'Día de La Rioja',              ccaa: 'RIO' },
  { d: '2025-04-22', n: 'Lunes de Pascua',              ccaa: 'VAL' },
  { d: '2025-10-09', n: 'Día de la CV',                 ccaa: 'VAL' },
  { d: '2026-04-22', n: 'Lunes de Pascua',              ccaa: 'VAL' },
  { d: '2026-10-09', n: 'Día de la CV',                 ccaa: 'VAL' },
]

function buildFallbackFestivos(): Festivo[] {
  return FALLBACK_FESTIVOS_RAW.map((f, i) => ({
    id:        `fallback-${i}`,
    fecha:     f.d,
    nombre:    f.n,
    ccaa:      f.ccaa,
    anio:      parseInt(f.d.slice(0, 4), 10),
    fuente:    'static',
    boeRef:    null,
    createdAt: new Date(),
  }))
}

async function getTramites(): Promise<Tramite[]> {
  if (!process.env.DATABASE_URL) return FALLBACK_TRAMITES
  try {
    const { db } = await import('@/lib/db')
    const { tramites } = await import('@/lib/db/schema')
    const { eq, asc } = await import('drizzle-orm')
    return db
      .select()
      .from(tramites)
      .where(eq(tramites.activo, true))
      .orderBy(asc(tramites.ordenDisplay))
  } catch {
    return FALLBACK_TRAMITES
  }
}

async function getFestivos(): Promise<Festivo[]> {
  if (!process.env.DATABASE_URL) return buildFallbackFestivos()
  try {
    const { db } = await import('@/lib/db')
    const { festivos } = await import('@/lib/db/schema')
    const { or, eq } = await import('drizzle-orm')
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1
    return db
      .select()
      .from(festivos)
      .where(
        or(eq(festivos.anio, currentYear), eq(festivos.anio, nextYear)),
      )
  } catch {
    return buildFallbackFestivos()
  }
}

export default async function HomePage() {
  const [tramitesData, festivosData] = await Promise.all([getTramites(), getFestivos()])

  return <CalculatorClient tramites={tramitesData} festivos={festivosData} />
}
