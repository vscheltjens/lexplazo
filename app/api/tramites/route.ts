import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tramites } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

export async function GET() {
  try {
    const data = await db
      .select()
      .from(tramites)
      .where(eq(tramites.activo, true))
      .orderBy(asc(tramites.ordenDisplay))

    return NextResponse.json({ tramites: data })
  } catch (error) {
    console.error('GET /api/tramites error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
