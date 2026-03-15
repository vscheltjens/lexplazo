import Link from 'next/link'

// AUTH TEMPORARILY DISABLED FOR TESTING
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = { user: { name: 'Admin (dev)' } } // mock session

  return (
    <div className="min-h-screen flex bg-lx-offwhite">
      <aside className="w-56 flex-shrink-0 bg-lx-navy text-white flex flex-col min-h-screen sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/" className="font-serif text-lg font-semibold tracking-wide text-white">
            LexPlazo
          </Link>
          <p className="text-[10px] text-white/40 mt-0.5 tracking-widest uppercase">Admin</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link href="/admin/tramites" className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <span>📋</span> Trámites
          </Link>
          <Link href="/admin/festivos" className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <span>📅</span> Festivos
          </Link>
          <div className="pt-3 mt-3 border-t border-white/10">
            <Link href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm text-white/50 hover:text-white hover:bg-white/10 transition-colors">
              <span>←</span> Volver a la app
            </Link>
          </div>
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 py-2">
            <p className="text-[11px] text-white/40 uppercase tracking-wider">Usuario</p>
            <p className="text-sm text-white/80 font-medium">{session.user?.name ?? 'Admin'}</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
