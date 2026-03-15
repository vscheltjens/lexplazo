'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { festivos, boeSyncLogs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { searchBoeCalendario, fetchBoeDocument, parseBoeXml } from '@/lib/boe'
import type { BoeDocumentCandidate } from '@/lib/boe'

async function requireAuth() {
  const session = await auth()
  if (!session) redirect('/admin/login')
  return session
}

export async function searchBoe(anio: number): Promise<BoeDocumentCandidate[]> {
  await requireAuth()
  try {
    return await searchBoeCalendario(anio)
  } catch (e) {
    console.error('BOE search error:', e)
    return []
  }
}

export async function syncFromBoe(boeRef: string, anio: number) {
  await requireAuth()

  let status = 'error'
  let festivosCount: number | null = null
  let errorMessage: string | null = null

  try {
    const xmlContent = await fetchBoeDocument(boeRef)
    const parsed = parseBoeXml(xmlContent, boeRef, anio)

    if (parsed.length === 0) {
      throw new Error('No se encontraron festivos en el documento BOE. El formato XML puede haber cambiado.')
    }

    const rows = parsed.map((f) => ({
      fecha:  f.fecha,
      nombre: f.nombre,
      ccaa:   f.ccaa,
      anio:   f.anio,
      fuente: 'boe',
      boeRef: f.boeRef,
    }))

    await db.insert(festivos).values(rows).onConflictDoNothing()

    festivosCount = parsed.length
    status = 'ok'
  } catch (e) {
    errorMessage = e instanceof Error ? e.message : String(e)
    status = 'error'
  }

  await db.insert(boeSyncLogs).values({
    boeRef,
    anio,
    status,
    festivosCount,
    errorMessage,
  })

  revalidatePath('/admin/festivos')

  return { status, festivosCount, errorMessage }
}

export async function deleteFestivo(id: string) {
  await requireAuth()
  await db.delete(festivos).where(eq(festivos.id, id))
  revalidatePath('/admin/festivos')
}

export async function createFestivo(formData: FormData) {
  await requireAuth()

  const fecha  = formData.get('fecha') as string
  const nombre = (formData.get('nombre') as string).trim()
  const ccaa   = formData.get('ccaa') as string
  const anio   = parseInt(fecha.slice(0, 4), 10)

  await db.insert(festivos).values({
    fecha,
    nombre,
    ccaa,
    anio,
    fuente: 'manual',
  }).onConflictDoNothing()

  revalidatePath('/admin/festivos')
}
