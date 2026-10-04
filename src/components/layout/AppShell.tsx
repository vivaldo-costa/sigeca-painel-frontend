import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { NotificationBell } from '@/components/notificacoes/NotificationBell'
import { useUiStore } from '@/store/ui'
import { useAparenciaGlobal } from '@/hooks/useAparenciaGlobal'
import { uploadUrl } from '@/lib/uploads'
import logo from '@/assets/sigeca-logo.svg'

export function AppShell() {
  const abrirSidebar = useUiStore((s) => s.abrirSidebar)
  const location = useLocation()
  const aparencia = useAparenciaGlobal()
  const [logoFalhou, setLogoFalhou] = useState(false)
  const logoCabecalho = !logoFalhou ? (uploadUrl('aparencia', aparencia?.logo_cabecalho_path) ?? logo) : logo

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />

      {/* Barra superior só em ecrãs pequenos — o sidebar já é sempre visível em lg+ */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <button onClick={abrirSidebar} className="text-text transition hover:text-muted">
            <Menu className="size-5" />
          </button>
          <img src={logoCabecalho} alt="SIGECA" className="h-6" onError={() => setLogoFalhou(true)} />
          <span className="text-[13px] font-semibold text-muted">Painel</span>
        </div>
        <NotificationBell />
      </header>

      <main className="min-h-screen lg:ml-[var(--width-sidebar)]">
        {/* Barra fina só em desktop, com o sino — o sidebar já cobre a navegação. */}
        <div className="hidden items-center justify-end border-b border-border bg-surface px-6 py-2 lg:flex">
          <NotificationBell />
        </div>
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
