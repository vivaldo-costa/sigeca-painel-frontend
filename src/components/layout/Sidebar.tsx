import { useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { ChevronDown, LogOut, X, ShieldCheck } from 'lucide-react'
import { NAV_DASHBOARD, NAV_SECTIONS, type NavGroup } from '@/lib/nav'
import { useAuthStore } from '@/store/auth'
import { useUiStore } from '@/store/ui'
import { cn } from '@/lib/cn'
import { useAparenciaGlobal } from '@/hooks/useAparenciaGlobal'
import { uploadUrl } from '@/lib/uploads'
import { useConfirmar } from '@/components/ui/ConfirmProvider'
import logo from '@/assets/sigeca-logo.svg'

const TODOS_OS_GRUPOS = NAV_SECTIONS.flatMap((s) => s.groups)

export function Sidebar() {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const confirmar = useConfirmar()
  const aparencia = useAparenciaGlobal()
  const [logoFalhou, setLogoFalhou] = useState(false)
  const logoPrincipal = !logoFalhou ? (uploadUrl('aparencia', aparencia?.logo_principal_path) ?? logo) : logo
  const sidebarAberta = useUiStore((s) => s.sidebarAberta)
  const fecharSidebar = useUiStore((s) => s.fecharSidebar)
  const [aberto, setAberto] = useState<string | null>(
    TODOS_OS_GRUPOS.find((g) => g.items?.some((i) => location.pathname.startsWith(i.to)))?.label ?? null
  )

  function renderGrupo(grupo: NavGroup) {
    const Icon = grupo.icon

    if (grupo.to) {
      return (
        <NavLink
          key={grupo.label}
          to={grupo.to}
          end={grupo.end}
          onClick={fecharSidebar}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors',
              isActive ? 'bg-[#111827] text-white' : 'text-text hover:bg-bg'
            )
          }
        >
          <Icon className="size-[17px] shrink-0" />
          <span className="flex-1">{grupo.label}</span>
          {grupo.novo && (
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">Novo</span>
          )}
        </NavLink>
      )
    }

    const estaAberto = aberto === grupo.label
    const grupoActivo = grupo.items?.some((i) => location.pathname.startsWith(i.to))

    return (
      <div key={grupo.label}>
        <button
          onClick={() => setAberto(estaAberto ? null : grupo.label)}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors',
            grupoActivo ? 'bg-bg text-text' : 'text-text hover:bg-bg'
          )}
        >
          <Icon className="size-[17px] shrink-0 text-muted" />
          <span className="flex-1 text-left">{grupo.label}</span>
          <ChevronDown className={cn('size-3.5 text-subtle transition-transform', estaAberto && 'rotate-180')} />
        </button>
        {estaAberto && grupo.items && (
          <div className="ml-[27px] mt-0.5 space-y-0.5 border-l border-border pl-3">
            {grupo.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={fecharSidebar}
                className={({ isActive }) =>
                  cn(
                    'block rounded-lg px-2.5 py-1.5 text-[13px] transition-colors',
                    isActive ? 'font-semibold text-[#111827]' : 'text-muted hover:bg-bg hover:text-text'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Fundo escuro atrás do menu em ecrãs pequenos — clicar fecha o menu */}
      {sidebarAberta && (
        <div
          className="fixed inset-0 z-30 bg-black/40 animate-fade-in lg:hidden"
          onClick={fecharSidebar}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-border bg-surface transition-transform duration-300 ease-out lg:translate-x-0',
          sidebarAberta ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ width: 'var(--width-sidebar)' }}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-2.5 border-b border-border px-5">
          <div className="flex items-center gap-2.5">
            <img src={logoPrincipal} alt="SIGECA" className="h-7" onError={() => setLogoFalhou(true)} />
            <span className="text-[13px] font-semibold text-muted">Painel</span>
          </div>
          <button onClick={fecharSidebar} className="text-subtle transition hover:text-text lg:hidden">
            <X className="size-5" />
          </button>
        </div>

        <nav className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-3 py-3">
          <div className="space-y-0.5">{renderGrupo(NAV_DASHBOARD)}</div>

          {NAV_SECTIONS.map((seccao) => (
            <div key={seccao.label}>
              <p className="mb-1 px-3 text-[10.5px] font-bold uppercase tracking-wider text-subtle">{seccao.label}</p>
              <div className="space-y-0.5">{seccao.groups.map(renderGrupo)}</div>
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#111827] text-[12px] font-semibold text-white">
              {(user?.nome?.[0] ?? 'A').toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-medium text-text">{user?.nome ?? '—'}</p>
              <p className="truncate text-[11px] text-subtle">{user?.perfil_nome}</p>
            </div>
          </div>
          <Link
            to="/perfil/seguranca"
            onClick={fecharSidebar}
            className="mb-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-muted transition-colors hover:bg-bg hover:text-text"
          >
            <ShieldCheck className="size-4" /> Segurança (2FA)
          </Link>
          <button
            onClick={async () => {
              const ok = await confirmar({ titulo: 'Terminar sessão', mensagem: 'Tens a certeza que queres sair do SIGECA?', textoConfirmar: 'Terminar sessão' })
              if (ok) logout()
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-muted transition-colors hover:bg-red-50 hover:text-badge-red-text"
          >
            <LogOut className="size-4" /> Terminar sessão
          </button>
        </div>
      </aside>
    </>
  )
}
