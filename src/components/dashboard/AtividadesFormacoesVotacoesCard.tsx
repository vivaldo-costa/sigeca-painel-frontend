import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import type { AtividadeResumo, VotacaoResumo } from '@/types/dashboard'

function Lista({ itens, campoValor, corBadge }: { itens: { titulo: string; valor: number }[]; campoValor: string; corBadge: string }) {
  if (itens.length === 0) {
    return <p className="py-6 text-center text-[13px] text-subtle">Sem dados para mostrar.</p>
  }
  return (
    <div className="space-y-2">
      {itens.slice(0, 6).map((item, i) => (
        <div key={i} className="flex items-center justify-between gap-2 rounded-lg bg-bg px-3 py-2">
          <span className="truncate text-[12.5px] font-medium text-text">{item.titulo}</span>
          <span className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold ${corBadge}`}>
            {item.valor} {campoValor}
          </span>
        </div>
      ))}
    </div>
  )
}

/** Totais no topo do cartão — já limitados à área (âmbito) do perfil pela API. */
function Totais({ itens }: { itens: AtividadeResumo[] }) {
  const soma = (k: 'total_inscritos' | 'confirmados' | 'pendentes' | 'total_pago') => itens.reduce((t, a) => t + Number(a[k] ?? 0), 0)
  const caixas: [string, string][] = [
    ['Inscritos', soma('total_inscritos').toLocaleString('pt-PT')],
    ['Confirmados', soma('confirmados').toLocaleString('pt-PT')],
    ['Pendentes', soma('pendentes').toLocaleString('pt-PT')],
    ['Total pago', `${soma('total_pago').toLocaleString('pt-PT')} Kz`],
  ]
  return (
    <div className="mb-3 grid grid-cols-2 gap-2">
      {caixas.map(([r, v]) => (
        <div key={r} className="rounded-lg border border-border px-2.5 py-1.5">
          <p className="text-[10.5px] uppercase tracking-wide text-subtle">{r}</p>
          <p className="font-mono text-[13px] font-semibold text-text">{v}</p>
        </div>
      ))}
    </div>
  )
}

const COLUNAS_RESUMO = [
  { titulo: 'Título', valor: (x: AtividadeResumo) => x.titulo },
  { titulo: 'Inscritos', valor: (x: AtividadeResumo) => x.total_inscritos },
  { titulo: 'Confirmados', valor: (x: AtividadeResumo) => x.confirmados ?? 0 },
  { titulo: 'Pendentes', valor: (x: AtividadeResumo) => x.pendentes ?? 0 },
  { titulo: 'Total pago (Kz)', valor: (x: AtividadeResumo) => x.total_pago ?? 0 },
]

export function AtividadesFormacoesVotacoesCard({
  actividades, formacoes, votacoes,
}: { actividades: AtividadeResumo[]; formacoes: AtividadeResumo[]; votacoes: VotacaoResumo[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex items-center justify-between gap-2">
          <h3 className="text-[13.5px] font-semibold text-text">Actividades</h3>
          <ExportarBotoes tamanho="sm" nomeFicheiro="resumo-actividades" titulo="Actividades — resumo"
            colunas={COLUNAS_RESUMO}
            linhas={actividades} />
        </CardHeader>
        <CardBody>
          <Totais itens={actividades} />
          <Lista
            itens={actividades.map((a) => ({ titulo: a.titulo, valor: a.total_inscritos }))}
            campoValor="insc."
            corBadge="bg-badge-blue-bg text-badge-blue-text"
          />
        </CardBody>
      </Card>
      <Card>
        <CardHeader className="flex items-center justify-between gap-2">
          <h3 className="text-[13.5px] font-semibold text-text">Formações</h3>
          <ExportarBotoes tamanho="sm" nomeFicheiro="resumo-formacoes" titulo="Formações — resumo"
            colunas={COLUNAS_RESUMO}
            linhas={formacoes} />
        </CardHeader>
        <CardBody>
          <Totais itens={formacoes} />
          <Lista
            itens={formacoes.map((f) => ({ titulo: f.titulo, valor: f.total_inscritos }))}
            campoValor="insc."
            corBadge="bg-badge-green-bg text-badge-green-text"
          />
        </CardBody>
      </Card>
      <Card>
        <CardHeader className="flex items-center justify-between gap-2">
          <h3 className="text-[13.5px] font-semibold text-text">Votações</h3>
          <ExportarBotoes tamanho="sm" nomeFicheiro="resumo-votacoes" titulo="Votações — resumo"
            colunas={[{ titulo: 'Título', valor: (x: { titulo: string }) => x.titulo }, { titulo: 'Votos', valor: (x: { total_votos: number }) => x.total_votos }]}
            linhas={votacoes} />
        </CardHeader>
        <CardBody>
          <Lista
            itens={votacoes.map((v) => ({ titulo: v.titulo, valor: v.total_votos }))}
            campoValor="votos"
            corBadge="bg-badge-violet-bg text-badge-violet-text"
          />
        </CardBody>
      </Card>
    </div>
  )
}
