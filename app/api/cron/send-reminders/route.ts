import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { db } from '@/lib/db'
import { recordatorios } from '@/lib/db/schema'
import { eq, and, lte } from 'drizzle-orm'

const resend = new Resend(process.env.RESEND_API_KEY)

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function buildEmailHtml(tramiteNombre: string, fechaVencimiento: string, plazoLabel: string): string {
  const vencimiento = formatDate(fechaVencimiento)
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6fa;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#0f2a4a;padding:32px 40px;">
            <p style="margin:0;color:#c9a84c;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">LexPlazo</p>
            <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700;">Recordatorio de plazo</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6;">
              Te recordamos que el siguiente plazo vence en <strong>2 días hábiles</strong>:
            </p>
            <!-- Deadline card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;border-left:4px solid #c9a84c;border-radius:4px;margin-bottom:32px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 6px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Trámite</p>
                  <p style="margin:0 0 16px;font-size:17px;color:#0f2a4a;font-weight:700;">${tramiteNombre}</p>
                  <p style="margin:0 0 6px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Plazo</p>
                  <p style="margin:0 0 16px;font-size:15px;color:#374151;">${plazoLabel}</p>
                  <p style="margin:0 0 6px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Fecha de vencimiento</p>
                  <p style="margin:0;font-size:20px;color:#0f2a4a;font-weight:700;">${vencimiento}</p>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 24px;color:#374151;font-size:14px;line-height:1.6;">
              Asegúrate de completar los trámites necesarios antes de la fecha indicada.
            </p>
            <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.5;">
              Has recibido este correo porque solicitaste un recordatorio en LexPlazo.<br>
              Si no lo solicitaste, puedes ignorar este mensaje.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
              LexPlazo &mdash; Calculadora de plazos administrativos
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function GET(req: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  try {
    // Fetch all pending reminders due today or earlier (catch up if cron missed a day)
    const due = await db
      .select()
      .from(recordatorios)
      .where(and(eq(recordatorios.status, 'pending'), lte(recordatorios.fechaRecordatorio, today)))

    if (due.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No pending reminders today.' })
    }

    const results = await Promise.allSettled(
      due.map(async (r) => {
        await resend.emails.send({
          from: 'LexPlazo <recordatorios@lexplazo.app>',
          to: r.email,
          subject: `Recordatorio: "${r.tramiteNombre}" vence el ${formatDate(r.fechaVencimiento)}`,
          html: buildEmailHtml(r.tramiteNombre, r.fechaVencimiento, r.plazoLabel),
        })

        await db
          .update(recordatorios)
          .set({ status: 'sent' })
          .where(eq(recordatorios.id, r.id))
      })
    )

    const sent = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    console.log(`[cron/send-reminders] sent=${sent} failed=${failed} total=${due.length}`)

    return NextResponse.json({ sent, failed, total: due.length })
  } catch (err) {
    console.error('[cron/send-reminders] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
