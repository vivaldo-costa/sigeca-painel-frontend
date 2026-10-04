import { useState } from 'react'
import { Flag, Loader2, EyeOff, UserRound } from 'lucide-react'
import { useDenunciasGestao } from '@/hooks/useDenuncias'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { BadgeEstadoDenuncia } from '@/components/denuncias/BadgeEstadoDenuncia'
import { ModalDenunciaDetalhe } from '@/components/denuncias/ModalDenunciaDetalhe'
import type { EstadoDenuncia, DenunciaPainel } from '@/types/denuncia'

const ESTADOS: EstadoDenuncia[] = ['nova', 'em_analise', 'resolvida', 'encerrada']

export function DenunciasLista() {
  const [estado, setEstado] = useState<EstadoDenuncia | ''>('')
  const { data, isLoading } = useDenunciasGestao(estado)
  const [detalheId, setDetalheId] = useState<number | null>(null)

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <Flag className="size-5 text-muted" /> Denúncias
          {data && <span className="text-sm font-normal text-subtle">({data.length})</span>}
        </h1>
        <ExportarBotoes
          tamanho="sm"
          nomeFicheiro="denuncias"
          titulo="Denúncias"
          colunas={[
            { titulo: 'Tipo', valor: (d: DenunciaPainel) => d.tipo },
            { titulo: 'Descrição', valor: (d) => d.descricao },
            { titulo: 'Denunciante', valor: (d) => (d.anonimo ? 'Anónimo' : (d.denunciante_nome ?? '—')) },
            { titulo: 'Estado', valor: (d) => d.estado },
            { titulo: 'Data', valor: (d) => new Date(d.created_at).toLocaleDateString('pt-PT') },
          ]}
          linhas={data ?? []}
        />
      </div>

      <Card className="mb-5 flex flex-wrap gap-2 p-4">
        {(['', ...ESTADOS] as (EstadoDenuncia | '')[]).map((e) => (
          <button
            key={e || 'todos'}
            onClick={() => setEstado(e)}
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition ${
              estado === e ? 'bg-[#111827] text-white' : 'bg-bg text-muted hover:bg-border'
            }`}
          >
            {e || 'Todas'}
          </button>
        ))}
      </Card>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <div className="space-y-3">
        {data?.map((d, i) => (
          <Card
            key={d.id}
            onClick={() => setDetalheId(d.id)}
            className="hover-lift animate-slide-up cursor-pointer p-4"
            style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-text">{d.tipo}</p>
                <p className="mt-0.5 line-clamp-2 text-[12.5px] text-muted">{d.descricao}</p>
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-subtle">
                  {d.anonimo ? <><EyeOff className="size-3" /> Anónimo</> : <><UserRound className="size-3" /> {d.denunciante_nome ?? '—'}</>}
                  {' · '}{new Date(d.created_at).toLocaleDateString('pt-PT')}
                </p>
              </div>
              <BadgeEstadoDenuncia estado={d.estado} />
            </div>
          </Card>
        ))}
      </div>

      {!isLoading && data?.length === 0 && <p className="py-16 text-center text-sm text-subtle">Nenhuma denúncia encontrada.</p>}

      {detalheId !== null && <ModalDenunciaDetalhe id={detalheId} onClose={() => setDetalheId(null)} />}
    </div>
  )
}
