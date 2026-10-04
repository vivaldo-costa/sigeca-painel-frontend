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

export function AtividadesFormacoesVotacoesCard({
  actividades, formacoes, votacoes,
}: { actividades: AtividadeResumo[]; formacoes: AtividadeResumo[]; votacoes: VotacaoResumo[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader><h3 className="text-[13.5px] font-semibold text-text">Actividades</h3></CardHeader>
        <CardBody>
          <Lista
            itens={actividades.map((a) => ({ titulo: a.titulo, valor: a.total_inscritos }))}
            campoValor="insc."
            corBadge="bg-badge-blue-bg text-badge-blue-text"
          />
        </CardBody>
      </Card>
      <Card>
        <CardHeader><h3 className="text-[13.5px] font-semibold text-text">Formações</h3></CardHeader>
        <CardBody>
          <Lista
            itens={formacoes.map((f) => ({ titulo: f.titulo, valor: f.total_inscritos }))}
            campoValor="insc."
            corBadge="bg-badge-green-bg text-badge-green-text"
          />
        </CardBody>
      </Card>
      <Card>
        <CardHeader><h3 className="text-[13.5px] font-semibold text-text">Votações</h3></CardHeader>
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
