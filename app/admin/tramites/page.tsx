import Link from 'next/link'
import { db } from '@/lib/db'
import { tramites } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'
import type { Tramite } from '@/lib/db/schema'
import { TramitesTable } from './TramitesTable'

async function getAllTramites(): Promise<Tramite[]> {
  return db.select().from(tramites).orderBy(asc(tramites.ordenDisplay))
}

export default async function TramitesPage() {
  const data = await getAllTramites()

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-medium text-lx-navy">Trámites</h1>
          <p className="text-sm text-lx-muted mt-1">Gestiona los tipos de trámite disponibles en la calculadora.</p>
        </div>
        <Link
          href="/admin/tramites/new"
          className="px-4 py-2 bg-lx-navy text-white text-sm font-medium rounded-sm hover:bg-lx-blue transition-colors"
        >
          + Nuevo trámite
        </Link>
      </div>

      <TramitesTable tramites={data} />
    </div>
  )
}
