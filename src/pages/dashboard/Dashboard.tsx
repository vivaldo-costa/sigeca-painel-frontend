import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useDashboardPainel } from '@/hooks/useDashboardPainel'
import { useAuthStore } from '@/store/auth'
import { Alert } from '@/components/ui/Alert'
import { NotificacoesLocais } from '@/components/notificacoes/NotificacoesLocais'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { FiltrosBar } from '@/components/dashboard/FiltrosBar'
import { KpiRow } from '@/components/dashboard/KpiRow'
import { EvolucaoEscuteirosCard } from '@/components/dashboard/EvolucaoEscuteirosCard'
import { SeccoesGeneroCard } from '@/components/dashboard/SeccoesGeneroCard'
import { TopDiocesesCard } from '@/components/dashboard/TopDiocesesCard'
import { UltimasAtividadesCard } from '@/components/dashboard/UltimasAtividadesCard'
import { UltimosRegistosCard } from '@/components/dashboard/UltimosRegistosCard'
import { AcoesRapidasCard } from '@/components/dashboard/AcoesRapidasCard'
import { MiniCalendarioCard } from '@/components/dashboard/MiniCalendarioCard'
import { UltimasDeclaracoesCard } from '@/components/dashboard/UltimasDeclaracoesCard'
import { DashboardFooterBanner } from '@/components/dashboard/DashboardFooterBanner'
import { VigarariasAgrupamentosCard, ParoquiasCard } from '@/components/dashboard/ListasEstrutura'
import { AtividadesFormacoesVotacoesCard } from '@/components/dashboard/AtividadesFormacoesVotacoesCard'
import { MudancaSeccaoTable } from '@/components/dashboard/MudancaSeccaoTable'
import type { FiltrosDashboard } from '@/types/dashboard'

/**
 * Dashboard do Painel — equivalente a painel/index.php + api/dashboard.php.
 * A barra de filtros só é mostrada para ADMIN/TECNICO (sem âmbito restrito no
 * original; os restantes perfis (GESTOR/CONSULTOR) veem os dados já
 * pré-filtrados pelo backend consoante a diocese/âmbito do utilizador.
 */
export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const podeFiltrar = user?.perfil_nome === 'ADMIN' || user?.perfil_nome === 'TECNICO'

  const [rascunho, setRascunho] = useState<FiltrosDashboard>({})
  const [aplicados, setAplicados] = useState<FiltrosDashboard>({})

  const { data, isLoading, isError, error } = useDashboardPainel(aplicados)

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 px-6 py-7">
      <NotificacoesLocais local="dashboard" />
      <DashboardHeader nome={user?.nome ?? 'Administrador'} />

      {podeFiltrar && (
        <FiltrosBar
          rascunho={rascunho}
          setRascunho={setRascunho}
          aplicados={aplicados}
          onAplicar={() => setAplicados(rascunho)}
          onLimpar={() => {
            setRascunho({})
            setAplicados({})
          }}
        />
      )}

      {isError && (
        <Alert variant="error">{(error as Error)?.message ?? 'Não foi possível carregar o dashboard.'}</Alert>
      )}

      {isLoading && (
        <div className="flex justify-center py-10 text-subtle">
          <Loader2 className="size-5 animate-spin" />
        </div>
      )}

      {data && (
        <>
          <KpiRow contadores={data.contadores} crescimento={data.crescimento} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <EvolucaoEscuteirosCard pontos={data.evolucao_escuteiros} />
            </div>
            <TopDiocesesCard dioceses={data.dioceses} />
          </div>

          <SeccoesGeneroCard
            seccoes={data.seccoes}
            seccoesPar={data.seccoes_par}
            paresSeccao={data.pares_seccao}
            genero={data.genero}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <UltimasAtividadesCard atividades={data.ultimas_atividades} />
              <UltimasDeclaracoesCard />
            </div>
            <div className="space-y-4">
              <AcoesRapidasCard />
              <MiniCalendarioCard />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <UltimosRegistosCard utilizadores={data.ultimos_utilizadores} />
            </div>
            <VigarariasAgrupamentosCard vigararias={data.vigararias} agrupamentos={data.agrupamentos} />
          </div>

          <ParoquiasCard paroquias={data.paroquias} />

          <AtividadesFormacoesVotacoesCard
            actividades={data.actividades}
            formacoes={data.formacoes}
            votacoes={data.votacoes}
          />

          <MudancaSeccaoTable dados={data.mudanca_seccao} />

          <DashboardFooterBanner />
        </>
      )}
    </div>
  )
}
