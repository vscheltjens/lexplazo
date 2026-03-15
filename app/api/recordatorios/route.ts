import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { recordatorios, festivos } from '@/lib/db/schema'
import { or, eq, and } from 'drizzle-orm'
import { isHabil, toISO } from '@/lib/calculator'

// Calculate the date that is N working days before a given date
function subtractDiasHabiles(from: Date, dias: number, festivosSet: Set<string>): Date {
  let d = new Date(from)
  let count = 0
  while (count < dias) {
    d.setDate(d.getDate() - 1)
    if (isHabil(d, festivosSet)) count++
  }
  return d
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, tramiteNombre, fechaVencimiento, ccaa, plazoLabel } = body

    if (!email || !tramiteNombre || !fechaVencimiento || !ccaa || !plazoLabel) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email no válido.' }, { status: 400 })
    }

    // Fetch festivos for CCAA to compute reminder date server-side
    const vencimientoDate = new Date(fechaVencimiento + 'T12:00:00')
    const anio = vencimientoDate.getFullYear()

    const festivosRows = await db
      .select()
      .from(festivos)
      .where(and(eq(festivos.anio, anio), or(eq(festivos.ccaa, 'NAC'), eq(festivos.ccaa, ccaa))))

    const festivosSet = new Set(festivosRows.map((f) => f.fecha))

    const recordatorioDate = subtractDiasHabiles(vencimientoDate, 2, festivosSet)
    const fechaRecordatorio = toISO(recordatorioDate)

    await db.insert(recordatorios).values({
      email,
      tramiteNombre,
      fechaVencimiento,
      fechaRecordatorio,
      ccaa,
      plazoLabel,
      status: 'pending',
    })

    return NextResponse.json({ fechaRecordatorio }, { status: 201 })
  } catch (err) {
    console.error('POST /api/recordatorios error:', err)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
