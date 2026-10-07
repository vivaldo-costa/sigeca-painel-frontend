import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Tent, Loader2, Search, Users, MapPin } from 'lucide-react'
import { useAcampamentos } from '@/hooks/useAcampamentos'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import type { EstadoEvento, EventoResumo } from '@/types/acampamento'

const LABEL_ESTADO: Record<EstadoEvento, string> = {
  preparacao: 'Preparação', inscricoes_abertas: 'Inscrições abertas', em_curso: 'Em curso',
  encerrado: 'Encerrado', arquivado: 'Arquivado',
}
const CORES_ESTADO: Record<EstadoEvento, string> = {
  preparacao: 'bg-bg text-muted',
  inscricoes_abertas: 'bg-badge-blue-bg text-badge-blue-text',
  em_curso: 'bg-badge-green-bg text-badge-green-text',
  encerrado: 'bg-badge-orange-bg text-badge-orange-text',
  arquivado: 'bg-bg text-subtle',
}

export function AcampamentosLista() {
  const [pesquisaRascunho, setPesquisaRascunho] = useState('')
  const [pesquisa, setPesquisa] = useState('')
  const [estadoEvento, setEstadoEvento] = useState('')
  const { data, isLoading } = useAcampamentos(pesquisa, estadoEvento)

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-6 sm:px-6 sm:py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <Tent className="size-5 text-muted" /> Gerir eventos
        </h1>
        <ExportarBotoes
          tamanho="sm"
          nomeFicheiro="acampamentos-eventos"
          titulo="Acampamentos e Eventos"
          colunas={[
            { titulo: 'Título', valor: (ev: EventoResumo) => ev.titulo },
            { titulo: 'Estado', valor: (ev) => LABEL_ESTADO[ev.estado_evento] },
            { titulo: 'Data Início', valor: (ev) => new Date(ev.data_inicio).toLocaleDateString('pt-PT') },
            { titulo: 'Data Fim', valor: (ev) => (ev.data_fim ? new Date(ev.data_fim).toLocaleDateString('pt-PT') : '—') },
            { titulo: 'Local', valor: (ev) => ev.local ?? '—' },
            { titulo: 'Confirmados', valor: (ev) => ev.total_confirmados },
            { titulo: 'Delegações', valor: (ev) => ev.total_delegacoes },
          ]}
          linhas={data ?? []}
        />
      </div>

      <Card className="mb-5 flex flex-wrap items-center gap-3 p-4">
        <form onSubmit={(e) => { e.preventDefault(); setPesquisa(pesquisaRascunho) }} className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
          <input
            value={pesquisaRascunho}
            onChange={(e) => setPesquisaRascunho(e.target.value)}
            placeholder="Pesquisar evento..."
            className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]"
          />
        </form>
        <select value={estadoEvento} onChange={(e) => setEstadoEvento(e.target.value)} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]">
          <option value="">Todos os estados</option>
          {(Object.keys(LABEL_ESTADO) as EstadoEvento[]).map((e) => <option key={e} value={e}>{LABEL_ESTADO[e]}</option>)}
        </select>
      </Card>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((ev, i) => (
          <Link key={ev.id} to={`/acampamentos/${ev.id}`}>
            <Card className="hover-lift animate-slide-up p-4" style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}>
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <h3 className="font-semibold text-text">{ev.titulo}</h3>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${CORES_ESTADO[ev.estado_evento]}`}>
                  {LABEL_ESTADO[ev.estado_evento]}
                </span>
              </div>
              {ev.lema && <p className="mb-1.5 text-[12px] italic text-subtle">"{ev.lema}"</p>}
              <p className="text-[12px] text-subtle">
                {new Date(ev.data_inicio).toLocaleDateString('pt-PT')}
                {ev.data_fim && ` – ${new Date(ev.data_fim).toLocaleDateString('pt-PT')}`}
              </p>
              {ev.local && <p className="mt-0.5 flex items-center gap-1 text-[12px] text-subtle"><MapPin className="size-3" /> {ev.local}</p>}
              <div className="mt-3 flex items-center gap-3 border-t border-border pt-3 text-[12px] text-muted">
                <span className="flex items-center gap-1"><Users className="size-3.5" /> {ev.total_confirmados} confirmado{ev.total_confirmados !== 1 && 's'}</span>
                <span>{ev.total_delegacoes} delegação{ev.total_delegacoes !== 1 && 'ões'}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {!isLoading && data?.length === 0 && <p className="py-16 text-center text-sm text-subtle">Nenhum evento encontrado.</p>}
    </div>
  )
}
