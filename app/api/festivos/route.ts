import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { festivos } from '@/lib/db/schema'
import { eq, and, or } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const ccaa = searchParams.get('ccaa') ?? 'MAD'
  const anioParam = searchParams.get('anio')
  const anio = anioParam ? parseInt(anioParam, 10) : new Date().getFullYear()

  try {
    // Return nacional + the requested CCAA for the given year
    const data = await db
      .select()
      .from(festivos)
      .where(
        and(
          eq(festivos.anio, anio),
          or(eq(festivos.ccaa, 'NAC'), eq(festivos.ccaa, ccaa)),
        ),
      )
      .orderBy(festivos.fecha)

    return NextResponse.json({ festivos: data, ccaa, anio })
  } catch (error) {
    console.error('GET /api/festivos error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
