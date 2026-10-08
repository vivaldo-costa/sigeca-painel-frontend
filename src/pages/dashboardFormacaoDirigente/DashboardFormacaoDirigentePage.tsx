import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard, Loader2, Users, ClipboardCheck, GraduationCap, UserCheck, Award,
  Route, School, HeartHandshake, BadgeCheck, TriangleAlert, ChevronRight,
} from 'lucide-react'
import { useDashboardFormacaoDirigente } from '@/hooks/useDashboardFormacaoDirigente'
import { useCatalogoFormacoes } from '@/hooks/useCatalogoFormacoes'
import { useOpcoesFiltro } from '@/hooks/useDashboardPainel'
import { useCountUp } from '@/hooks/useCountUp'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { getApiErrorMessage } from '@/lib/api'
import { cn } from '@/lib/cn'
import type { EstadoCandidato } from '@/types/candidatoDirigente'

// ── KPI (mesmo estilo do Dashboard principal — components/dashboard/KpiRow.tsx) ──
function KpiCard({ label, valor, detalhe, Icon, gradiente, atraso }: {
  label: string; valor: number; detalhe?: string; Icon: LucideIcon; gradiente: string; atraso: number
}) {
  const { valor: contado, ref } = useCountUp(valor)
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`animate-slide-up relative overflow-hidden rounded-2xl bg-gradient-to-br p-4 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-lg ${gradiente}`}
      style={{ animationDelay: `${atraso}ms` }}
    >
      <div className="pointer-events-none absolute -right-4 -top-4 size-20 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-6 -right-8 size-24 rounded-full bg-white/5" />
      <div className="relative grid size-10 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
        <Icon className="size-[18px] text-white" />
      </div>
      <p className="relative mt-3 truncate text-[12px] font-medium text-white/80">{label}</p>
      <p className="relative font-mono text-xl font-bold text-white">{contado.toLocaleString('pt-PT')}</p>
      {detalhe && <p className="relative mt-1 truncate text-[11px] text-white/75">{detalhe}</p>}
    </div>
  )
}

function TituloCard({ icon: Icon, titulo, to }: { icon: LucideIcon; titulo: string; to?: string }) {
  return (
    <CardHeader className="flex items-center justify-between gap-2">
      <h3 className="flex items-center gap-2 text-[15px] font-semibold text-text">
        <Icon className="size-4 text-muted" /> {titulo}
      </h3>
      {to && (
        <Link to={to} className="flex items-center gap-0.5 text-[12px] font-medium text-muted transition hover:text-text">
          Ver <ChevronRight className="size-3.5" />
        </Link>
      )}
    </CardHeader>
  )
}

/** Pequeno indicador com ponto colorido — usado nos cartões de Turmas, Tutoria, Certificação. */
function Metrica({ label, valor, cor, alerta }: { label: string; valor: number; cor: string; alerta?: boolean }) {
  return (
    <div className={cn('rounded-lg border border-border p-3', alerta && 'border-badge-red-text/30 bg-badge-red-bg')}>
      <p className="flex items-center gap-1.5 text-[11px] font-medium leading-tight text-subtle">
        <span className={cn('size-2 shrink-0 rounded-full', cor)} /> {label}
      </p>
      <p className={cn('mt-1 font-mono text-lg font-bold text-text', alerta && 'text-badge-red-text')}>{valor.toLocaleString('pt-PT')}</p>
    </div>
  )
}

// ── Funil: candidatos por etapa do percurso ─────────────────────────────
const ETAPAS_FUNIL: { label: string; estados: EstadoCandidato[]; cor: string }[] = [
  { label: 'Validação — Chefe de Agrupamento', estados: ['registo_iniciado', 'em_validacao_chefe_agrupamento'], cor: 'bg-[#3b6fd4]' },
  { label: 'Validação — Assistente', estados: ['em_validacao_paroco'], cor: 'bg-[#3b6fd4]' },
  { label: 'Aprovação — Coordenação Vicarial', estados: ['em_aprovacao_vicarial'], cor: 'bg-[#3b6fd4]' },
  { label: 'Validação — Equipa Diocesana', estados: ['em_validacao_diocesana', 'validado'], cor: 'bg-[#3b6fd4]' },
  { label: 'Lista de Candidatos', estados: ['na_lista_candidatos'], cor: 'bg-emerald-500' },
  { label: 'Seleccionados para Turma', estados: ['selecionado_turma'], cor: 'bg-emerald-500' },
  { label: 'Em Formação', estados: ['em_formacao'], cor: 'bg-[#7655c8]' },
  { label: 'A Aguardar Tutoria', estados: ['formacao_concluida_aguardar_tutoria'], cor: 'bg-[#7655c8]' },
  { label: 'Em Tutoria', estados: ['em_tutoria', 'tutoria_concluida_relatorio_pendente', 'relatorio_em_validacao'], cor: 'bg-orange-500' },
  { label: 'Tutoria Validada', estados: ['tutoria_validada'], cor: 'bg-orange-500' },
  { label: 'Certificado — a Aguardar Promessa', estados: ['certificado_emitido_aguardar_promessa', 'promessa_realizada'], cor: 'bg-pink-500' },
  { label: 'Processo Concluído', estados: ['processo_formativo_concluido'], cor: 'bg-pink-500' },
]

function FunilCandidatos({ porEstado }: { porEstado: Partial<Record<EstadoCandidato, number>> }) {
  const contar = (estados: EstadoCandidato[]) => estados.reduce((soma, e) => soma + (porEstado[e] ?? 0), 0)
  const linhas = ETAPAS_FUNIL.map((etapa) => ({ ...etapa, total: contar(etapa.estados) }))
  const maximo = Math.max(1, ...linhas.map((l) => l.total))
  const devolvidos = porEstado.devolvido_correcao ?? 0
  const rejeitados = porEstado.rejeitado ?? 0

  return (
    <Card>
      <TituloCard icon={Route} titulo="Percurso dos Candidatos — por Etapa" to="/candidatos-dirigente" />
      <CardBody className="space-y-2">
        {linhas.map((l) => (
          <div key={l.label} className="grid grid-cols-[minmax(0,190px)_1fr_40px] items-center gap-3 text-[12px] sm:grid-cols-[230px_1fr_48px]">
            <span className="truncate text-muted" title={l.label}>{l.label}</span>
            <div className="h-2.5 overflow-hidden rounded-full bg-bg">
              <div className={cn('h-full rounded-full transition-all', l.cor)} style={{ width: `${l.total ? Math.max(4, (l.total / maximo) * 100) : 0}%` }} />
            </div>
            <span className="text-right font-mono font-semibold text-text">{l.total}</span>
          </div>
        ))}
        {(devolvidos > 0 || rejeitados > 0) && (
          <div className="flex flex-wrap gap-2 border-t border-border pt-3">
            {devolvidos > 0 && <span className="rounded-full bg-badge-orange-bg px-2.5 py-0.5 text-[11px] font-semibold text-badge-orange-text">{devolvidos} devolvido{devolvidos !== 1 && 's'} para correcção</span>}
            {rejeitados > 0 && <span className="rounded-full bg-badge-red-bg px-2.5 py-0.5 text-[11px] font-semibold text-badge-red-text">{rejeitados} rejeitado{rejeitados !== 1 && 's'}</span>}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export function DashboardFormacaoDirigentePage() {
  const [dioceseId, setDioceseId] = useState('')
  const [formacaoId, setFormacaoId] = useState('')
  const { data: dioceses } = useOpcoesFiltro('dioceses')
  const { data: formacoes } = useCatalogoFormacoes('')

  const { data, isLoading, isError, error } = useDashboardFormacaoDirigente({
    dioceseId: dioceseId ? Number(dioceseId) : undefined,
    formacaoId: formacaoId ? Number(formacaoId) : undefined,
  })

  const totalTurmas = data ? Object.values(data.turmas).reduce((a, b) => a + b, 0) : 0

  return (
    <div className="mx-auto max-w-[1300px] space-y-5 px-4 py-6 sm:px-6 sm:py-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
            <LayoutDashboard className="size-5 text-muted" /> Dashboard Nacional — Formação de Dirigentes
          </h1>
          <p className="mt-0.5 text-[12.5px] text-subtle">Do registo do candidato até à Promessa do Dirigente.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={dioceseId} onChange={(e) => setDioceseId(e.target.value)} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]">
            <option value="">Todas as dioceses</option>
            {dioceses?.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
          </select>
          <select value={formacaoId} onChange={(e) => setFormacaoId(e.target.value)} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]">
            <option value="">Todas as formações</option>
            {formacoes?.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
        </div>
      </div>

      {isError && <Alert variant="error">{getApiErrorMessage(error, 'Não foi possível carregar o dashboard.')}</Alert>}
      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <KpiCard atraso={0} label="Candidatos Registados" valor={data.candidatos.registados} detalhe={`${data.candidatos.na_lista_candidatos} na Lista de Candidatos`} Icon={Users} gradiente="from-[#3b6fd4] to-[#2952a3]" />
            <KpiCard atraso={60} label="Em Validação" valor={data.candidatos.em_validacao} detalhe={`${data.candidatos.validados} já validados`} Icon={ClipboardCheck} gradiente="from-orange-400 to-orange-600" />
            <KpiCard atraso={120} label="Em Formação" valor={data.formacao.candidatos_em_formacao} detalhe={`${data.formacao.formacoes_concluidas} formações concluídas`} Icon={GraduationCap} gradiente="from-[#7655c8] to-[#5a3fa3]" />
            <KpiCard atraso={180} label="Em Tutoria" valor={data.tutoria.candidatos_em_tutoria} detalhe={`${data.tutoria.tutorias_concluidas} tutorias concluídas`} Icon={UserCheck} gradiente="from-emerald-500 to-emerald-700" />
            <KpiCard atraso={240} label="Certificados Emitidos" valor={data.certificacao.certificados_emitidos} detalhe={`${data.promessa.processos_concluidos} processos concluídos`} Icon={Award} gradiente="from-pink-500 to-rose-600" />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <FunilCandidatos porEstado={data.por_estado ?? {}} />
            </div>

            <div className="space-y-4 lg:col-span-2">
              <Card>
                <TituloCard icon={School} titulo="Turmas" to="/turmas-formacao" />
                <CardBody>
                  {totalTurmas > 0 && (
                    <div className="mb-4 flex h-2.5 overflow-hidden rounded-full bg-bg">
                      {([
                        [data.turmas.em_constituicao, 'bg-slate-400'],
                        [data.turmas.submetidas, 'bg-orange-500'],
                        [data.turmas.autorizadas, 'bg-[#3b6fd4]'],
                        [data.turmas.realizadas, 'bg-[#7655c8]'],
                        [data.turmas.encerradas, 'bg-emerald-500'],
                      ] as [number, string][]).map(([v, cor], i) => v > 0 && (
                        <div key={i} className={cor} style={{ width: `${(v / totalTurmas) * 100}%` }} />
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Metrica label="Em Constituição" valor={data.turmas.em_constituicao} cor="bg-slate-400" />
                    <Metrica label="Submetidas" valor={data.turmas.submetidas} cor="bg-orange-500" />
                    <Metrica label="Autorizadas" valor={data.turmas.autorizadas} cor="bg-[#3b6fd4]" />
                    <Metrica label="Realizadas" valor={data.turmas.realizadas} cor="bg-[#7655c8]" />
                    <Metrica label="Encerradas" valor={data.turmas.encerradas} cor="bg-emerald-500" />
                  </div>
                </CardBody>
              </Card>

              <Card>
                <TituloCard icon={HeartHandshake} titulo="Tutoria / Estágio" to="/tutorias" />
                <CardBody>
                  {data.tutoria.tutorias_fora_do_prazo > 0 && (
                    <p className="mb-3 flex items-center gap-1.5 rounded-lg bg-badge-red-bg px-3 py-2 text-[12px] font-medium text-badge-red-text">
                      <TriangleAlert className="size-3.5 shrink-0" />
                      {data.tutoria.tutorias_fora_do_prazo} tutoria{data.tutoria.tutorias_fora_do_prazo !== 1 && 's'} fora do prazo
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Metrica label="Em Tutoria" valor={data.tutoria.candidatos_em_tutoria} cor="bg-emerald-500" />
                    <Metrica label="Concluídas" valor={data.tutoria.tutorias_concluidas} cor="bg-emerald-700" />
                    <Metrica label="Relatórios Pendentes" valor={data.tutoria.relatorios_pendentes} cor="bg-orange-500" />
                    <Metrica label="Relatórios em Validação" valor={data.tutoria.relatorios_em_validacao} cor="bg-[#3b6fd4]" />
                    <Metrica label="Fora do Prazo" valor={data.tutoria.tutorias_fora_do_prazo} cor="bg-badge-red-text" alerta={data.tutoria.tutorias_fora_do_prazo > 0} />
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          <Card>
            <TituloCard icon={BadgeCheck} titulo="Certificação e Promessa" />
            <CardBody>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <Metrica label="Aptos para Certificado" valor={data.certificacao.candidatos_aptos} cor="bg-orange-500" />
                <Metrica label="Certificados Emitidos" valor={data.certificacao.certificados_emitidos} cor="bg-pink-500" />
                <Metrica label="A Aguardar Promessa" valor={data.promessa.dirigentes_aguardar_promessa} cor="bg-[#7655c8]" />
                <Metrica label="Promessas Realizadas" valor={data.promessa.promessas_realizadas} cor="bg-[#3b6fd4]" />
                <Metrica label="Processos Concluídos" valor={data.promessa.processos_concluidos} cor="bg-emerald-500" />
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}
