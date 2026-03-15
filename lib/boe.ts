import { DOMParser } from '@xmldom/xmldom'

export interface ParsedFestivo {
  fecha:  string
  nombre: string
  ccaa:   string
  anio:   number
  boeRef: string
}

export interface BoeDocumentCandidate {
  id:     string
  titulo: string
  fecha:  string
  url:    string
}

/**
 * Search the BOE open-data API for Real Decreto de calendario laboral for a given year.
 * Searches in the Sept–Dec window when the decree is typically published.
 */
export async function searchBoeCalendario(year: number): Promise<BoeDocumentCandidate[]> {
  const prevYear = year - 1
  const url = `https://boe.es/datosabiertos/api/legislacion?palabras=calendario+laboral&deptno=&fechaDesde=${prevYear}-0901&fechaHasta=${prevYear}-1231&orden=&page=1`

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    throw new Error(`BOE API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json() as {
    data?: {
      results?: Array<{
        identificador?: string
        titulo?: string
        fecha_publicacion?: string
        url_pdf?: string
      }>
    }
  }

  const results = data?.data?.results ?? []

  return results.map((r) => ({
    id:     r.identificador ?? '',
    titulo: r.titulo ?? '',
    fecha:  r.fecha_publicacion ?? '',
    url:    r.url_pdf ?? `https://www.boe.es/diario_boe/xml.php?id=${r.identificador}`,
  }))
}

/**
 * Fetch the XML content of a BOE document by its reference ID.
 * Example boeRef: 'BOE-A-2024-22354'
 */
export async function fetchBoeDocument(boeRef: string): Promise<string> {
  const url = `https://www.boe.es/diario_boe/xml.php?id=${boeRef}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch BOE document ${boeRef}: ${res.status} ${res.statusText}`)
  }
  return res.text()
}

/**
 * Parse a BOE "Real Decreto de calendario laboral" XML document.
 *
 * The typical structure is a table where:
 * - <thead> rows contain CCAA codes in <abbr> elements
 * - <tbody> rows contain dates (first cell) and a name (second cell),
 *   with subsequent cells using <abbr> to indicate observance by a CCAA.
 *
 * Returns an array of ParsedFestivo objects.
 */
export function parseBoeXml(xmlContent: string, boeRef: string, anio: number): ParsedFestivo[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlContent, 'application/xml')

  const result: ParsedFestivo[] = []

  // Find all tables in the document
  const tables = doc.getElementsByTagName('tabla')
  if (tables.length === 0) {
    // Try generic HTML-style table tags
    return parseBoeXmlFallback(xmlContent, boeRef, anio)
  }

  for (let t = 0; t < tables.length; t++) {
    const table = tables[t]

    // Collect CCAA column headers from thead
    const theadRows = table.getElementsByTagName('fila')
    const ccaaCols: string[] = []

    // First row is typically the header
    const firstRow = theadRows[0]
    if (!firstRow) continue

    const headerCells = firstRow.getElementsByTagName('celda')
    for (let i = 0; i < headerCells.length; i++) {
      const cell = headerCells[i]
      const textContent = cell.textContent?.trim() ?? ''
      // CCAA codes are typically 2-3 uppercase letters
      if (/^[A-Z]{2,3}$/.test(textContent)) {
        ccaaCols.push(textContent)
      } else {
        ccaaCols.push('')
      }
    }

    // Parse body rows
    for (let r = 1; r < theadRows.length; r++) {
      const row = theadRows[r]
      const cells = row.getElementsByTagName('celda')
      if (cells.length < 2) continue

      const fechaText = cells[0].textContent?.trim() ?? ''
      const nombre    = cells[1].textContent?.trim() ?? ''

      // Parse date — may be in format "1 enero" or "01/01"
      const fecha = parseBoeDate(fechaText, anio)
      if (!fecha) continue

      // Check which CCAs observe this holiday
      let hasNac = false
      for (let c = 2; c < cells.length; c++) {
        const cellText = cells[c].textContent?.trim() ?? ''
        if (cellText && cellText !== '-') {
          const colCcaa = ccaaCols[c] ?? ''
          if (colCcaa) {
            result.push({ fecha, nombre, ccaa: colCcaa, anio, boeRef })
          } else if (!hasNac) {
            hasNac = true
            result.push({ fecha, nombre, ccaa: 'NAC', anio, boeRef })
          }
        }
      }

      // If no CCAA column mapped but there is a mark, treat as national
      if (!hasNac && cells.length === 2) {
        result.push({ fecha, nombre, ccaa: 'NAC', anio, boeRef })
      }
    }
  }

  return result
}

/**
 * Fallback parser for BOE XML that uses a simpler text extraction approach.
 * Extracts festivos nacionales from the document text.
 */
function parseBoeXmlFallback(xmlContent: string, boeRef: string, anio: number): ParsedFestivo[] {
  const result: ParsedFestivo[] = []
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlContent, 'text/xml')

  // Look for any date-like patterns in the document text
  const allText = doc.documentElement?.textContent ?? ''
  const lines = allText.split('\n').map((l) => l.trim()).filter(Boolean)

  const datePattern = /(\d{1,2})\s+de\s+(\w+)/i
  const months: Record<string, number> = {
    enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
    julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
  }

  for (const line of lines) {
    const m = datePattern.exec(line)
    if (m) {
      const day   = parseInt(m[1], 10)
      const month = months[m[2].toLowerCase()]
      if (month) {
        const fecha = `${anio}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const nombre = line.replace(m[0], '').trim().replace(/^[-–,.\s]+/, '').trim()
        if (nombre.length > 2 && nombre.length < 100) {
          result.push({ fecha, nombre, ccaa: 'NAC', anio, boeRef })
        }
      }
    }
  }

  return result
}

function parseBoeDate(text: string, anio: number): string | null {
  const months: Record<string, number> = {
    enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
    julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
  }

  // Try "1 enero" or "1 de enero" format
  const m1 = /^(\d{1,2})\s+(?:de\s+)?(\w+)$/i.exec(text.trim())
  if (m1) {
    const day   = parseInt(m1[1], 10)
    const month = months[m1[2].toLowerCase()]
    if (month) {
      return `${anio}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }

  // Try "01/01" or "01-01" format
  const m2 = /^(\d{1,2})[/\-](\d{1,2})$/.exec(text.trim())
  if (m2) {
    const day   = parseInt(m2[1], 10)
    const month = parseInt(m2[2], 10)
    return `${anio}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  // Try ISO format
  const m3 = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim())
  if (m3) return text.trim()

  return null
}
