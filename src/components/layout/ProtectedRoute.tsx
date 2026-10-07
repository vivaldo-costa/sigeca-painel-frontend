import { Navigate, useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { podeVerModulo, primeiraRotaPermitida, temAcessoPainel } from '@/lib/nav'

function SemAcesso() {
  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4 text-center">
      <div>
        <ShieldAlert className="mx-auto mb-3 size-10 text-badge-red-text" />
        <h1 className="text-lg font-bold text-text">Acesso não autorizado</h1>
        <p className="mt-1 text-sm text-muted">O teu perfil não tem permissão para aceder ao Painel de Gestão.</p>
      </div>
    </div>
  )
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, permissoes, status } = useAuthStore()
  const location = useLocation()

  if (status === 'loading' || status === 'idle') {
    return <div className="grid min-h-screen place-items-center bg-bg text-muted">A verificar sessão…</div>
  }

  if (status === 'guest' || status === 'aguarda2fa') {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (user) {
    // O acesso vem das permissões configuradas em Perfis, não de uma lista fixa de perfis.
    if (!temAcessoPainel(user.perfil_nome, permissoes)) return <SemAcesso />

    // Perfis sem o módulo Dashboard (ex.: Consultor, Tesoureiro) entram na primeira página que podem ver.
    if (location.pathname === '/dashboard' && !podeVerModulo('Dashboard', user.perfil_nome, permissoes)) {
      const destino = primeiraRotaPermitida(user.perfil_nome, permissoes)
      return destino && destino !== '/dashboard' ? <Navigate to={destino} replace /> : <SemAcesso />
    }
  }

  return <>{children}</>
}
