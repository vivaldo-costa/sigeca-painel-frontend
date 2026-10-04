import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Route, Plus, Loader2, Search } from 'lucide-react'
import { useCandidatosDirigente } from '@/hooks/useCandidatosDirigente'
import { useOpcoesFiltro } from '@/hooks/useDashboardPainel'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { ModalRegistarCandidato } from '@/components/candidatosDirigente/ModalRegistarCandidato'
import { LABEL_ESTADO_CANDIDATO, type EstadoCandidato, type CandidatoResumo } from '@/types/candidatoDirigente'
import { formatarAgrupamento } from '@/lib/formatadores'

const CORES_ESTADO: Partial<Record<EstadoCandidato, string>> = {
  em_validacao_paroco: 'bg-badge-blue-bg text-badge-blue-text',
  em_aprovacao_vicarial: 'bg-badge-blue-bg text-badge-blue-text',
  em_validacao_diocesana: 'bg-badge-blue-bg text-badge-blue-text',
  devolvido_correcao: 'bg-badge-orange-bg text-badge-orange-text',
  rejeitado: 'bg-badge-red-bg text-badge-red-text',
  na_lista_candidatos: 'bg-badge-green-bg text-badge-green-text',
}

export function CandidatosDirigenteLista() {
  const [pesquisaRascunho, setPesquisaRascunho] = useState('')
  const [pesquisa, setPesquisa] = useState('')
  const [dioceseId, setDioceseId] = useState<number | ''>('')
  const [estado, setEstado] = useState('')
  const { data: dioceses } = useOpcoesFiltro('dioceses')
  const { data, isLoading, isError } = useCandidatosDirigente({ dioceseId: dioceseId || undefined, estado: estado || undefined, pesquisa })

  const [modalAberto, setModalAberto] = useState(false)

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <Route className="size-5 text-muted" /> Formação de Dirigentes — Candidatos
        </h1>
        <div className="flex items-center gap-2">
          <ExportarBotoes
            tamanho="sm"
            nomeFicheiro="candidatos-dirigente"
            titulo="Formação de Dirigentes — Candidatos"
            colunas={[
              { titulo: 'Candidato', valor: (c: CandidatoResumo) => c.nome },
              { titulo: 'Nº SIGECA', valor: (c) => c.codigo_associado },
              { titulo: 'Agrupamento', valor: (c) => formatarAgrupamento({ nome: c.agrupamento_nome, ab_agrupamento: c.ab_agrupamento }) },
              { titulo: 'Formação', valor: (c) => c.formacao_nome },
              { titulo: 'Estado', valor: (c) => LABEL_ESTADO_CANDIDATO[c.estado] },
              { titulo: 'Dias em curso', valor: (c) => c.dias_em_curso },
            ]}
            linhas={data ?? []}
          />
          <button onClick={() => setModalAberto(true)} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-black">
            <Plus className="size-3.5" /> Registar Candidato
          </button>
        </div>
      </div>

      <Card className="mb-5 flex flex-wrap items-center gap-3 p-4">
        <form onSubmit={(e) => { e.preventDefault(); setPesquisa(pesquisaRascunho) }} className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
          <input
            value={pesquisaRascunho}
            onChange={(e) => setPesquisaRascunho(e.target.value)}
            placeholder="Pesquisar candidato..."
            className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]"
          />
        </form>
        <select value={dioceseId} onChange={(e) => setDioceseId(Number(e.target.value) || '')} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]">
          <option value="">Todas as dioceses</option>
          {dioceses?.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
        </select>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]">
          <option value="">Todos os estados</option>
          {(Object.keys(LABEL_ESTADO_CANDIDATO) as EstadoCandidato[]).map((e) => <option key={e} value={e}>{LABEL_ESTADO_CANDIDATO[e]}</option>)}
        </select>
      </Card>

      {isError && <p className="mb-4 rounded-lg bg-badge-red-bg px-4 py-3 text-[13px] text-badge-red-text">Escolhe uma diocese para veres os candidatos — não tens visão nacional.</p>}
      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3.5 py-2.5 font-medium">Candidato</th>
              <th className="px-3.5 py-2.5 font-medium">Agrupamento</th>
              <th className="px-3.5 py-2.5 font-medium">Formação</th>
              <th className="px-3.5 py-2.5 font-medium">Estado</th>
              <th className="px-3.5 py-2.5 text-right font-medium">Dias em curso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!isLoading && data?.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-subtle">Nenhum candidato encontrado.</td></tr>}
            {data?.map((c) => (
              <tr key={c.id} className="cursor-pointer transition-colors hover:bg-bg">
                <td className="px-3.5 py-2.5">
                  <Link to={`/candidatos-dirigente/${c.id}`} className="block">
                    <p className="font-medium text-text">{c.nome}</p>
                    <p className="font-mono text-[11px] text-subtle">{c.codigo_associado}</p>
                  </Link>
                </td>
                <td className="px-3.5 py-2.5 text-muted">{formatarAgrupamento({ nome: c.agrupamento_nome, ab_agrupamento: c.ab_agrupamento })}</td>
                <td className="px-3.5 py-2.5 text-muted">{c.formacao_nome}</td>
                <td className="px-3.5 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${CORES_ESTADO[c.estado] ?? 'bg-bg text-subtle'}`}>
                    {LABEL_ESTADO_CANDIDATO[c.estado]}
                  </span>
                </td>
                <td className="px-3.5 py-2.5 text-right text-muted">{c.dias_em_curso}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {modalAberto && <ModalRegistarCandidato onClose={() => setModalAberto(false)} />}
    </div>
  )
}
