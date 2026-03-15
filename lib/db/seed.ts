import { db } from './index'
import { tramites, festivos, comunidades } from './schema'

const TRAMITES_DATA = [
  {
    slug:         'alzada',
    name:         'Recurso de alzada',
    plazoLabel:   '1 mes natural',
    diasCount:    null,
    tipoCompute:  'mes' as const,
    articuloLey:  'Art. 122 LPACAP',
    descripcion:  'Art. 122 LPACAP — 1 mes natural desde la notificación del acto impugnado. El cómputo se realiza de fecha a fecha. Si el vencimiento recae en festivo o fin de semana, se traslada al siguiente día hábil.',
    ordenDisplay: 0,
    activo:       true,
  },
  {
    slug:         'recl',
    name:         'Reclamación previa',
    plazoLabel:   '20 días hábiles',
    diasCount:    20,
    tipoCompute:  'habiles' as const,
    articuloLey:  'Art. 70 LRJS',
    descripcion:  'Art. 70 LRJS — 20 días hábiles desde la fecha del hecho causante o desde la notificación de la resolución empresarial. Requisito previo obligatorio en determinados supuestos frente a Administraciones Públicas.',
    ordenDisplay: 1,
    activo:       true,
  },
  {
    slug:         'smac',
    name:         'Papeleta de conciliación',
    plazoLabel:   '20 días hábiles',
    diasCount:    20,
    tipoCompute:  'habiles' as const,
    articuloLey:  'Art. 65 LRJS',
    descripcion:  'Art. 65 LRJS — La presentación de la papeleta ante el SMAC interrumpe los plazos de caducidad y prescripción. Tramitar antes de la demanda en la mayoría de reclamaciones.',
    ordenDisplay: 2,
    activo:       true,
  },
  {
    slug:         'demanda',
    name:         'Demanda Juzgado Social',
    plazoLabel:   '20 días hábiles',
    diasCount:    20,
    tipoCompute:  'habiles' as const,
    articuloLey:  'Art. 59 ET / Art. 69 LRJS',
    descripcion:  'Art. 59 ET / Art. 69 LRJS — Plazo de caducidad de 20 días hábiles desde la fecha del despido o del acto objeto de impugnación. Es improrrogable y su incumplimiento determina la firmeza del acto.',
    ordenDisplay: 3,
    activo:       true,
  },
]

const COMUNIDADES_DATA = [
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

const NACIONALES_DATA = [
  { d: '2025-01-01', n: 'Año Nuevo' },
  { d: '2025-01-06', n: 'Epifanía del Señor' },
  { d: '2025-04-17', n: 'Jueves Santo' },
  { d: '2025-04-18', n: 'Viernes Santo' },
  { d: '2025-05-01', n: 'Día del Trabajo' },
  { d: '2025-08-15', n: 'Asunción de la Virgen' },
  { d: '2025-10-12', n: 'Fiesta Nacional de España' },
  { d: '2025-11-01', n: 'Todos los Santos' },
  { d: '2025-12-06', n: 'Día de la Constitución' },
  { d: '2025-12-08', n: 'Inmaculada Concepción' },
  { d: '2025-12-25', n: 'Natividad del Señor' },
  { d: '2026-01-01', n: 'Año Nuevo' },
  { d: '2026-01-06', n: 'Epifanía del Señor' },
  { d: '2026-04-02', n: 'Jueves Santo' },
  { d: '2026-04-03', n: 'Viernes Santo' },
  { d: '2026-05-01', n: 'Día del Trabajo' },
  { d: '2026-08-15', n: 'Asunción de la Virgen' },
  { d: '2026-10-12', n: 'Fiesta Nacional de España' },
  { d: '2026-11-01', n: 'Todos los Santos' },
  { d: '2026-12-06', n: 'Día de la Constitución' },
  { d: '2026-12-08', n: 'Inmaculada Concepción' },
  { d: '2026-12-25', n: 'Natividad del Señor' },
]

const FEST_CCAA_DATA: Array<{ d: string; n: string; ccaa: string }> = [
  // AND
  { d: '2025-02-28', n: 'Día de Andalucía',    ccaa: 'AND' },
  { d: '2025-04-18', n: 'Viernes Santo (local)',ccaa: 'AND' },
  { d: '2026-02-28', n: 'Día de Andalucía',    ccaa: 'AND' },
  { d: '2026-04-02', n: 'Jueves Santo (local)', ccaa: 'AND' },
  // ARA
  { d: '2025-04-23', n: 'San Jorge',            ccaa: 'ARA' },
  { d: '2026-04-23', n: 'San Jorge',            ccaa: 'ARA' },
  // AST
  { d: '2025-09-08', n: 'Día de Asturias',      ccaa: 'AST' },
  { d: '2026-09-08', n: 'Día de Asturias',      ccaa: 'AST' },
  // BAL
  { d: '2025-03-01', n: 'Día de las Illes Balears', ccaa: 'BAL' },
  { d: '2026-03-01', n: 'Día de las Illes Balears', ccaa: 'BAL' },
  // CAN
  { d: '2025-05-30', n: 'Día de Canarias',      ccaa: 'CAN' },
  { d: '2026-05-30', n: 'Día de Canarias',      ccaa: 'CAN' },
  // CTB
  { d: '2025-07-28', n: 'Día de Cantabria',     ccaa: 'CTB' },
  { d: '2026-07-28', n: 'Día de Cantabria',     ccaa: 'CTB' },
  // CLM
  { d: '2025-05-31', n: 'Corpus Christi',       ccaa: 'CLM' },
  { d: '2026-05-31', n: 'Corpus Christi',       ccaa: 'CLM' },
  // CYL
  { d: '2025-04-23', n: 'Día de Castilla y León', ccaa: 'CYL' },
  { d: '2026-04-23', n: 'Día de Castilla y León', ccaa: 'CYL' },
  // CAT
  { d: '2025-04-23', n: 'Sant Jordi',           ccaa: 'CAT' },
  { d: '2025-06-24', n: 'Sant Joan',            ccaa: 'CAT' },
  { d: '2026-04-23', n: 'Sant Jordi',           ccaa: 'CAT' },
  { d: '2026-06-24', n: 'Sant Joan',            ccaa: 'CAT' },
  // CEU
  { d: '2025-03-05', n: 'Carnaval',             ccaa: 'CEU' },
  { d: '2026-03-05', n: 'Carnaval',             ccaa: 'CEU' },
  // EXT
  { d: '2025-09-08', n: 'Día de Extremadura',   ccaa: 'EXT' },
  { d: '2026-09-08', n: 'Día de Extremadura',   ccaa: 'EXT' },
  // GAL
  { d: '2025-07-25', n: 'Día de Galicia',       ccaa: 'GAL' },
  { d: '2026-07-25', n: 'Día de Galicia',       ccaa: 'GAL' },
  // MAD
  { d: '2025-05-02', n: 'Comunidad de Madrid',  ccaa: 'MAD' },
  { d: '2025-05-15', n: 'San Isidro',           ccaa: 'MAD' },
  { d: '2026-05-02', n: 'Comunidad de Madrid',  ccaa: 'MAD' },
  { d: '2026-05-15', n: 'San Isidro',           ccaa: 'MAD' },
  // MEL
  { d: '2025-09-02', n: 'Día de Melilla',       ccaa: 'MEL' },
  { d: '2026-09-02', n: 'Día de Melilla',       ccaa: 'MEL' },
  // MUR
  { d: '2025-06-09', n: 'Día de la Región de Murcia', ccaa: 'MUR' },
  { d: '2026-06-09', n: 'Día de la Región de Murcia', ccaa: 'MUR' },
  // NAV
  { d: '2025-09-27', n: 'Día de Navarra',       ccaa: 'NAV' },
  { d: '2026-09-27', n: 'Día de Navarra',       ccaa: 'NAV' },
  // PVA
  { d: '2025-10-25', n: 'Día del País Vasco',   ccaa: 'PVA' },
  { d: '2026-10-25', n: 'Día del País Vasco',   ccaa: 'PVA' },
  // RIO
  { d: '2025-06-11', n: 'Día de La Rioja',      ccaa: 'RIO' },
  { d: '2026-06-11', n: 'Día de La Rioja',      ccaa: 'RIO' },
  // VAL
  { d: '2025-04-22', n: 'Lunes de Pascua',      ccaa: 'VAL' },
  { d: '2025-10-09', n: 'Día de la CV',         ccaa: 'VAL' },
  { d: '2026-04-22', n: 'Lunes de Pascua',      ccaa: 'VAL' },
  { d: '2026-10-09', n: 'Día de la CV',         ccaa: 'VAL' },
]

async function seed() {
  console.log('Seeding tramites...')
  await db.insert(tramites).values(TRAMITES_DATA).onConflictDoNothing()

  console.log('Seeding comunidades...')
  await db.insert(comunidades).values(COMUNIDADES_DATA).onConflictDoNothing()

  console.log('Seeding festivos nacionales...')
  const nacionalesRows = NACIONALES_DATA.map((f) => ({
    fecha:  f.d,
    nombre: f.n,
    ccaa:   'NAC',
    anio:   parseInt(f.d.slice(0, 4), 10),
    fuente: 'seed',
  }))
  await db.insert(festivos).values(nacionalesRows).onConflictDoNothing()

  console.log('Seeding festivos autonómicos...')
  const autonomicosRows = FEST_CCAA_DATA.map((f) => ({
    fecha:  f.d,
    nombre: f.n,
    ccaa:   f.ccaa,
    anio:   parseInt(f.d.slice(0, 4), 10),
    fuente: 'seed',
  }))
  await db.insert(festivos).values(autonomicosRows).onConflictDoNothing()

  console.log('Seed complete.')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
