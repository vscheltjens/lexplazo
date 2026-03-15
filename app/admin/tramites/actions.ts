'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tramites } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function requireAuth() {
  const session = await auth()
  if (!session) {
    redirect('/admin/login')
  }
  return session
}

export async function createTramite(formData: FormData) {
  await requireAuth()

  const slug         = (formData.get('slug') as string).trim()
  const name         = (formData.get('name') as string).trim()
  const plazoLabel   = (formData.get('plazoLabel') as string).trim()
  const tipoCompute  = formData.get('tipoCompute') as 'habiles' | 'mes' | 'naturales'
  const diasCountRaw = formData.get('diasCount') as string
  const articuloLey  = (formData.get('articuloLey') as string | null)?.trim() ?? null
  const descripcion  = (formData.get('descripcion') as string | null)?.trim() ?? null
  const ordenDisplay = parseInt((formData.get('ordenDisplay') as string) || '0', 10)
  const activo       = formData.get('activo') === 'on'

  const diasCount = diasCountRaw ? parseInt(diasCountRaw, 10) : null

  await db.insert(tramites).values({
    slug,
    name,
    plazoLabel,
    tipoCompute,
    diasCount,
    articuloLey,
    descripcion,
    ordenDisplay,
    activo,
  })

  revalidatePath('/admin/tramites')
  revalidatePath('/')
  redirect('/admin/tramites')
}

export async function updateTramite(id: string, formData: FormData) {
  await requireAuth()

  const slug         = (formData.get('slug') as string).trim()
  const name         = (formData.get('name') as string).trim()
  const plazoLabel   = (formData.get('plazoLabel') as string).trim()
  const tipoCompute  = formData.get('tipoCompute') as 'habiles' | 'mes' | 'naturales'
  const diasCountRaw = formData.get('diasCount') as string
  const articuloLey  = (formData.get('articuloLey') as string | null)?.trim() ?? null
  const descripcion  = (formData.get('descripcion') as string | null)?.trim() ?? null
  const ordenDisplay = parseInt((formData.get('ordenDisplay') as string) || '0', 10)
  const activo       = formData.get('activo') === 'on'

  const diasCount = diasCountRaw ? parseInt(diasCountRaw, 10) : null

  await db
    .update(tramites)
    .set({
      slug,
      name,
      plazoLabel,
      tipoCompute,
      diasCount,
      articuloLey,
      descripcion,
      ordenDisplay,
      activo,
      updatedAt: new Date(),
    })
    .where(eq(tramites.id, id))

  revalidatePath('/admin/tramites')
  revalidatePath('/')
}

export async function deleteTramite(id: string) {
  await requireAuth()

  // Soft delete — just mark as inactive
  await db
    .update(tramites)
    .set({ activo: false, updatedAt: new Date() })
    .where(eq(tramites.id, id))

  revalidatePath('/admin/tramites')
  revalidatePath('/')
}
