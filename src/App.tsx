import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { ConfirmProvider } from '@/components/ui/ConfirmProvider'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/auth/Login'
import { RecuperarPage } from '@/pages/auth/RecuperarPage'
import { RedefinirPasswordPage } from '@/pages/auth/RedefinirPasswordPage'
import { DashboardPage } from '@/pages/dashboard/Dashboard'
import { EmConstrucaoPage } from '@/pages/EmConstrucao'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { useAuthStore } from '@/store/auth'
import { useAparenciaGlobal } from '@/hooks/useAparenciaGlobal'
import { DiocesesLista } from '@/pages/dioceses/DiocesesLista'
import { DiocesesForm } from '@/pages/dioceses/DiocesesForm'
import { VigarariasLista } from '@/pages/vigararias/VigarariasLista'
import { VigarariasForm } from '@/pages/vigararias/VigarariasForm'
import { ParoquiasLista } from '@/pages/paroquias/ParoquiasLista'
import { ParoquiasForm } from '@/pages/paroquias/ParoquiasForm'
import { AgrupamentosLista } from '@/pages/agrupamentos/AgrupamentosLista'
import { AgrupamentosForm } from '@/pages/agrupamentos/AgrupamentosForm'
import { SeccoesLista } from '@/pages/seccoes/SeccoesLista'
import { SeccoesForm } from '@/pages/seccoes/SeccoesForm'
import { UtilizadoresLista } from '@/pages/utilizadores/UtilizadoresLista'
import { UtilizadorNovoForm } from '@/pages/utilizadores/UtilizadorNovoForm'
import { UtilizadorFicha } from '@/pages/utilizadores/UtilizadorFicha'
import { TransferenciasLista } from '@/pages/transferencias/TransferenciasLista'
import { CartaoModeloPage } from '@/pages/utilizadores/CartaoModeloPage'
import { PerfisLista } from '@/pages/perfis/PerfisLista'
import { UnidadesSeccaoLista } from '@/pages/unidadesSeccao/UnidadesSeccaoLista'
import { AuditoriaLista } from '@/pages/auditoria/AuditoriaLista'
import { ConfiguracoesShell } from '@/pages/configuracoes/ConfiguracoesShell'
import { ConfiguracoesGeraisPage } from '@/pages/configuracoes/ConfiguracoesGeraisPage'
import { ConfiguracoesAparenciaPage } from '@/pages/configuracoes/ConfiguracoesAparenciaPage'
import { ConfiguracaoEmailShell } from '@/pages/configuracoes/ConfiguracaoEmailShell'
import { ConfiguracaoSmsPage } from '@/pages/configuracoes/ConfiguracaoSmsPage'
import { BackupsPage } from '@/pages/backups/BackupsPage'
import { SegurancaPage } from '@/pages/perfil/SegurancaPage'
import { SistemaShell } from '@/pages/sistema/SistemaShell'
import { MonitorizacaoPage } from '@/pages/sistema/MonitorizacaoPage'
import { LogsPage } from '@/pages/sistema/LogsPage'
import { ConfiguracaoEmailPage } from '@/pages/configuracoes/ConfiguracaoEmailPage'
import { HistoricoEmailsPage } from '@/pages/configuracoes/HistoricoEmailsPage'
import { EmailTemplatesLista } from '@/pages/configuracoes/EmailTemplatesLista'
import { EmailTemplateEditor } from '@/pages/configuracoes/EmailTemplateEditor'
import { DocumentosLista } from '@/pages/documentos/DocumentosLista'
import { ProdutosLista } from '@/pages/produtos/ProdutosLista'
import { EncomendasLista } from '@/pages/produtos/EncomendasLista'
import { AtividadesLista } from '@/pages/atividades/AtividadesLista'
import { FormacoesLista } from '@/pages/formacoes/FormacoesLista'
import { VotacoesLista } from '@/pages/votacoes/VotacoesLista'
import { FaqLista } from '@/pages/faq/FaqLista'
import { NotificacoesLista } from '@/pages/notificacoes/NotificacoesLista'
import { DenunciasLista } from '@/pages/denuncias/DenunciasLista'
import { CensoPeriodos } from '@/pages/censo/CensoPeriodos'
import { CensoRespostasPage } from '@/pages/censo/CensoRespostasPage'
import { FinancasLista } from '@/pages/financas/FinancasLista'
import { TesourariaPage } from '@/pages/tesouraria/TesourariaPage'
import { InventarioPage } from '@/pages/inventario/InventarioPage'
import { RegularizacaoCensoLista } from '@/pages/pagamentoCenso/RegularizacaoCensoLista'
import { CertificadosLista } from '@/pages/certificados/CertificadosLista'
import { CertificadoModelosPage } from '@/pages/certificados/CertificadoModelosPage'
import { AcampamentosLista } from '@/pages/acampamentos/AcampamentosLista'
import { EventoDetalhePage } from '@/pages/acampamentos/EventoDetalhePage'
import { CatalogoFormacoesLista } from '@/pages/catalogoFormacoes/CatalogoFormacoesLista'
import { FormadoresLista } from '@/pages/formadores/FormadoresLista'
import { CursosLista } from '@/pages/cursos/CursosLista'
import { CursoDetalhePage } from '@/pages/cursos/CursoDetalhePage'
import { CandidatosDirigenteLista } from '@/pages/candidatosDirigente/CandidatosDirigenteLista'
import { CandidatoDetalhePage } from '@/pages/candidatosDirigente/CandidatoDetalhePage'
import { TurmasFormacaoLista } from '@/pages/turmasFormacao/TurmasFormacaoLista'
import { TurmaDetalhePage } from '@/pages/turmasFormacao/TurmaDetalhePage'
import { TutoriasLista } from '@/pages/tutorias/TutoriasLista'
import { TutoriaDetalhePage } from '@/pages/tutorias/TutoriaDetalhePage'
import { DashboardFormacaoDirigentePage } from '@/pages/dashboardFormacaoDirigente/DashboardFormacaoDirigentePage'
import { VendaPosPage } from '@/pages/vendas/VendaPosPage'
import { VendasLista } from '@/pages/vendas/VendasLista'

// Rotas ainda nao migradas do painel PHP -> placeholder "em construcao".
// Path : titulo mostrado na pagina placeholder.
const ROTAS_PENDENTES: [string, string][] = []

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate)
  useAparenciaGlobal()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <ConfirmProvider>
      <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recuperar" element={<RecuperarPage />} />
      <Route path="/redefinir-password" element={<RedefinirPasswordPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/dioceses" element={<DiocesesLista />} />
        <Route path="/dioceses/novo" element={<DiocesesForm />} />
        <Route path="/dioceses/:id/editar" element={<DiocesesForm />} />

        <Route path="/vigararias" element={<VigarariasLista />} />
        <Route path="/vigararias/novo" element={<VigarariasForm />} />
        <Route path="/vigararias/:id/editar" element={<VigarariasForm />} />

        <Route path="/paroquias" element={<ParoquiasLista />} />
        <Route path="/paroquias/novo" element={<ParoquiasForm />} />
        <Route path="/paroquias/:id/editar" element={<ParoquiasForm />} />

        <Route path="/agrupamentos" element={<AgrupamentosLista />} />
        <Route path="/agrupamentos/novo" element={<AgrupamentosForm />} />
        <Route path="/agrupamentos/:id/editar" element={<AgrupamentosForm />} />

        <Route path="/seccoes" element={<SeccoesLista />} />
        <Route path="/seccoes/novo" element={<SeccoesForm />} />
        <Route path="/seccoes/:id/editar" element={<SeccoesForm />} />

        <Route path="/utilizadores" element={<UtilizadoresLista />} />
        <Route path="/utilizadores/novo" element={<UtilizadorNovoForm />} />
        <Route path="/utilizadores/transferencias" element={<TransferenciasLista />} />
        <Route path="/utilizadores/modelo-cartao" element={<CartaoModeloPage />} />
        <Route path="/utilizadores/:id" element={<UtilizadorFicha />} />

        <Route path="/perfis" element={<PerfisLista />} />
        <Route path="/unidades-seccao" element={<UnidadesSeccaoLista />} />
        <Route path="/auditoria" element={<AuditoriaLista />} />
        <Route path="/configuracoes" element={<ConfiguracoesShell />}>
          <Route index element={<ConfiguracoesGeraisPage />} />
          <Route path="aparencia" element={<ConfiguracoesAparenciaPage />} />
        </Route>
        <Route path="/configuracoes/email" element={<ConfiguracaoEmailShell />}>
          <Route index element={<ConfiguracaoEmailPage />} />
          <Route path="historico" element={<HistoricoEmailsPage />} />
          <Route path="templates" element={<EmailTemplatesLista />} />
          <Route path="templates/:id" element={<EmailTemplateEditor />} />
        </Route>
        <Route path="/configuracoes/sms" element={<ConfiguracaoSmsPage />} />
        <Route path="/backups" element={<BackupsPage />} />
        <Route path="/perfil/seguranca" element={<SegurancaPage />} />
        <Route path="/sistema" element={<SistemaShell />}>
          <Route index element={<MonitorizacaoPage />} />
          <Route path="logs" element={<LogsPage />} />
        </Route>
        <Route path="/documentos" element={<DocumentosLista />} />
        <Route path="/produtos" element={<ProdutosLista />} />
        <Route path="/produtos/encomendas" element={<EncomendasLista />} />
        <Route path="/eventos" element={<AtividadesLista />} />
        <Route path="/formacoes" element={<FormacoesLista />} />
        <Route path="/votacoes" element={<VotacoesLista />} />
        <Route path="/faq" element={<FaqLista />} />
        <Route path="/notificacoes" element={<NotificacoesLista />} />
        <Route path="/denuncias" element={<DenunciasLista />} />
        <Route path="/censo" element={<CensoPeriodos />} />
        <Route path="/censo/:periodoId" element={<CensoRespostasPage />} />
        <Route path="/financas" element={<FinancasLista />} />
        <Route path="/financas/regularizacao" element={<RegularizacaoCensoLista />} />
        <Route path="/tesouraria" element={<TesourariaPage />} />
        <Route path="/inventario" element={<InventarioPage />} />
        <Route path="/certificados" element={<CertificadosLista />} />
        <Route path="/certificados/modelos" element={<CertificadoModelosPage />} />
        <Route path="/acampamentos" element={<AcampamentosLista />} />
        <Route path="/acampamentos/:id" element={<EventoDetalhePage />} />
        <Route path="/catalogo-formacoes" element={<CatalogoFormacoesLista />} />
        <Route path="/formadores" element={<FormadoresLista />} />
        <Route path="/cursos" element={<CursosLista />} />
        <Route path="/cursos/:id" element={<CursoDetalhePage />} />
        <Route path="/candidatos-dirigente" element={<CandidatosDirigenteLista />} />
        <Route path="/candidatos-dirigente/:id" element={<CandidatoDetalhePage />} />
        <Route path="/turmas-formacao" element={<TurmasFormacaoLista />} />
        <Route path="/turmas-formacao/:id" element={<TurmaDetalhePage />} />
        <Route path="/tutorias" element={<TutoriasLista />} />
        <Route path="/tutorias/:id" element={<TutoriaDetalhePage />} />
        <Route path="/dashboard-formacao-dirigentes" element={<DashboardFormacaoDirigentePage />} />
        <Route path="/vendas" element={<VendasLista />} />
        <Route path="/vendas/pos" element={<VendaPosPage />} />

        {ROTAS_PENDENTES.map(([path, titulo]) => (
          <Route key={path} path={path} element={<EmConstrucaoPage titulo={titulo} />} />
        ))}
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </ConfirmProvider>
    </>
  )
}
