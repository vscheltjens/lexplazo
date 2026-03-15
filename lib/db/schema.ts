import {
  pgTable,
  text,
  integer,
  boolean,
  date,
  timestamp,
  uuid,
  pgEnum,
  unique,
} from 'drizzle-orm/pg-core'

export const tipoComputeEnum = pgEnum('tipo_compute', ['habiles', 'mes', 'naturales'])

export const tramites = pgTable('tramites', {
  id:           uuid('id').primaryKey().defaultRandom(),
  slug:         text('slug').notNull().unique(),
  name:         text('name').notNull(),
  plazoLabel:   text('plazo_label').notNull(),
  diasCount:    integer('dias_count'),
  tipoCompute:  tipoComputeEnum('tipo_compute').notNull(),
  articuloLey:  text('articulo_ley'),
  descripcion:  text('descripcion'),
  ordenDisplay: integer('orden_display').notNull().default(0),
  activo:       boolean('activo').notNull().default(true),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
})

export const festivos = pgTable('festivos', {
  id:        uuid('id').primaryKey().defaultRandom(),
  fecha:     date('fecha').notNull(),
  nombre:    text('nombre').notNull(),
  ccaa:      text('ccaa').notNull(),
  anio:      integer('anio').notNull(),
  fuente:    text('fuente').notNull().default('manual'),
  boeRef:    text('boe_ref'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  uniqFechaCcaa: unique().on(t.fecha, t.ccaa),
}))

export const comunidades = pgTable('comunidades', {
  id:   text('id').primaryKey(),
  name: text('name').notNull(),
})

export const boeSyncLogs = pgTable('boe_sync_logs', {
  id:             uuid('id').primaryKey().defaultRandom(),
  boeRef:         text('boe_ref').notNull(),
  anio:           integer('anio').notNull(),
  status:         text('status').notNull(),
  festivosCount:  integer('festivos_count'),
  errorMessage:   text('error_message'),
  triggeredAt:    timestamp('triggered_at').notNull().defaultNow(),
})

export const recordatorios = pgTable('recordatorios', {
  id:                uuid('id').primaryKey().defaultRandom(),
  email:             text('email').notNull(),
  tramiteNombre:     text('tramite_nombre').notNull(),
  fechaVencimiento:  date('fecha_vencimiento').notNull(),
  fechaRecordatorio: date('fecha_recordatorio').notNull(),
  ccaa:              text('ccaa').notNull(),
  plazoLabel:        text('plazo_label').notNull(),
  status:            text('status').notNull().default('pending'), // 'pending' | 'sent' | 'cancelled'
  createdAt:         timestamp('created_at').notNull().defaultNow(),
})

export type Tramite       = typeof tramites.$inferSelect
export type NewTramite = typeof tramites.$inferInsert
export type Festivo    = typeof festivos.$inferSelect
export type Comunidad  = typeof comunidades.$inferSelect
export type BoeSyncLog = typeof boeSyncLogs.$inferSelect
