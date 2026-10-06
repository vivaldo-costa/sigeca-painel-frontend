import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Loader2, Search } from 'lucide-react'
import { useCensoRespostas } from '@/hooks/useCenso'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { ModalCensoResposta } from '@/components/censo/ModalCensoResposta'
import { formatarAgrupamento } from '@/lib/formatadores'
import type { CensoRespostaResumo, EstadoRespostaCenso } from '@/types/censo'
import { cn } from '@/lib/cn'

const CORES_ESTADO: Record<string, string> = {
  por_preencher: 'bg-bg text-muted',
  rascunho: 'bg-badge-orange-bg text-badge-orange-text',
  submetido: 'bg-badge-green-bg text-badge-green-text',
}
const LABEL_ESTADO: Record<string, string> = {
  por_preencher: 'Por preencher', rascunho: 'Rascunho', submetido: 'Submetido',
}

export function CensoRespostasPage() {
  const { periodoId } = useParams()
  const { data, isLoading } = useCensoRespostas(Number(periodoId))
  const [pesquisa, setPesquisa] = useState('')
  const [estado, setEstado] = useState<EstadoRespostaCenso | ''>('')
  const [respostaAberta, setRespostaAberta] = useState<CensoRespostaResumo | null>(null)

  const filtrados = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase()
    return (data ?? []).filter((r) =>
      (!estado || r.estado === estado)
      && (!termo || r.agrupamento_nome.toLowerCase().includes(termo) || (r.ab_agrupamento ?? '').includes(termo)
        || (r.diocese_nome ?? '').toLowerCase().includes(termo)))
  }, [data, pesquisa, estado])
  const contagem = useMemo(() => {
    const c: Record<string, number> = { por_preencher: 0, rascunho: 0, submetido: 0 }
    for (const r of data ?? []) c[r.estado] = (c[r.estado] ?? 0) + 1
    return c
  }, [data])

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6 sm:px-6 sm:py-7">
      <Link to="/censo" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-text">
        <ChevronLeft className="size-3.5" /> Voltar aos períodos
      </Link>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-text">Respostas por agrupamento</h1>
        <ExportarBotoes
          tamanho="sm"
          nomeFicheiro="censo-respostas"
          titulo="Censo — respostas por agrupamento"
          subtitulo={estado ? `Estado: ${LABEL_ESTADO[estado]}` : 'Todos os estados'}
          colunas={[
            { titulo: 'Nº', valor: (r: CensoRespostaResumo) => r.ab_agrupamento ?? '' },
            { titulo: 'Agrupamento', valor: (r) => r.agrupamento_nome },
            { titulo: 'Diocese', valor: (r) => r.diocese_nome ?? '—' },
            { titulo: 'Estado', valor: (r) => LABEL_ESTADO[r.estado] },
            { titulo: 'Dirigentes', valor: (r) => r.num_dirigentes ?? '' },
            { titulo: 'Candidatos', valor: (r) => r.num_candidatos ?? '' },
            { titulo: 'Submetido em', valor: (r) => (r.submetido_em ? new Date(r.submetido_em).toLocaleDateString('pt-PT') : '—') },
            { titulo: 'Por', valor: (r) => r.respondido_por_nome ?? '—' },
          ]}
          linhas={filtrados}
        />
      </div>

      <Card className="mb-4 space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          {([['', 'Todos'], ['por_preencher', 'Por preencher'], ['rascunho', 'Rascunho'], ['submetido', 'Submetido']] as const).map(([v, rotulo]) => (
            <button key={v || 'todos'} type="button" onClick={() => setEstado(v)}
              className={cn('rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition', estado === v ? 'bg-[#111827] text-white' : 'bg-bg text-muted hover:bg-border')}>
              {rotulo}{v ? ` (${contagem[v] ?? 0})` : ` (${data?.length ?? 0})`}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
          <input
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder="Pesquisar agrupamento, número ou diocese..."
            className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]"
          />
        </div>
      </Card>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3.5 py-2.5 font-medium">Agrupamento</th>
              <th className="px-3.5 py-2.5 font-medium">Diocese</th>
              <th className="px-3.5 py-2.5 font-medium">Estado</th>
              <th className="px-3.5 py-2.5 font-medium">Submetido em</th>
              <th className="px-3.5 py-2.5 font-medium">Por</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtrados.map((r) => (
              <tr key={r.agrupamento_id} onClick={() => setRespostaAberta(r)} className="cursor-pointer transition-colors hover:bg-bg">
                <td className="px-3.5 py-2.5 font-medium text-text">{formatarAgrupamento({ nome: r.agrupamento_nome, ab_agrupamento: r.ab_agrupamento })}</td>
                <td className="px-3.5 py-2.5 text-muted">{r.diocese_nome ?? '—'}</td>
                <td className="px-3.5 py-2.5">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CORES_ESTADO[r.estado]}`}>
                    {LABEL_ESTADO[r.estado]}
                  </span>
                </td>
                <td className="px-3.5 py-2.5 text-muted">{r.submetido_em ? new Date(r.submetido_em).toLocaleDateString('pt-PT') : '—'}</td>
                <td className="px-3.5 py-2.5 text-muted">{r.respondido_por_nome ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {respostaAberta && periodoId && (
        <ModalCensoResposta periodoId={Number(periodoId)} resposta={respostaAberta} onClose={() => setRespostaAberta(null)} />
      )}
    </div>
  )
}
