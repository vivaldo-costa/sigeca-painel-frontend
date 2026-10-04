import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightLeft, Loader2, FileText } from 'lucide-react'
import { useTransferencias, useDecidirTransferencia, useCancelarTransferencia } from '@/hooks/useTransferencias'
import { useAuthStore } from '@/store/auth'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { PaginacaoServidor } from '@/components/crud/PaginacaoServidor'
import { BadgeEstadoTransferencia } from '@/components/crud/BadgesEstado'
import { formatarAgrupamento } from '@/lib/formatadores'
import type { FiltrosTransferencias, EstadoTransferencia, Transferencia } from '@/types/transferencia'

const ESTADOS: EstadoTransferencia[] = ['PENDENTE', 'APROVADA', 'REJEITADA', 'CANCELADA']

export function TransferenciasLista() {
  const user = useAuthStore((s) => s.user)
  const [filtros, setFiltros] = useState<FiltrosTransferencias>({ pagina: 1, porPagina: 20, estado: 'PENDENTE' })
  const { data, isLoading } = useTransferencias(filtros)
  const decidir = useDecidirTransferencia()
  const cancelar = useCancelarTransferencia()

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <ArrowRightLeft className="size-5 text-muted" /> Transferências
          {data && <span className="text-sm font-normal text-subtle">({data.paginacao.total.toLocaleString('pt-PT')})</span>}
        </h1>
        <ExportarBotoes
          tamanho="sm"
          nomeFicheiro="transferencias-pagina-atual"
          titulo="Transferências"
          colunas={[
            { titulo: 'Escuteiro', valor: (t: Transferencia) => t.escuteiro_nome },
            { titulo: 'Origem', valor: (t) => t.agrupamento_origem_nome ? formatarAgrupamento({ nome: t.agrupamento_origem_nome, ab_agrupamento: t.agrupamento_origem_ab_agrupamento }) : '—' },
            { titulo: 'Destino', valor: (t) => formatarAgrupamento({ nome: t.agrupamento_destino_nome, ab_agrupamento: t.agrupamento_destino_ab_agrupamento }) },
            { titulo: 'Estado', valor: (t) => t.estado },
            { titulo: 'Solicitado por', valor: (t) => t.solicitado_por_nome },
            { titulo: 'Data', valor: (t) => new Date(t.data_solicitacao).toLocaleDateString('pt-PT') },
          ]}
          linhas={data?.dados ?? []}
        />
      </div>

      <Card className="mb-4 flex flex-wrap gap-2 p-4">
        {(['', ...ESTADOS] as (EstadoTransferencia | '')[]).map((e) => (
          <button
            key={e || 'todos'}
            onClick={() => setFiltros((f) => ({ ...f, estado: e, pagina: 1 }))}
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition ${
              filtros.estado === e ? 'bg-[#111827] text-white' : 'bg-bg text-muted hover:bg-border'
            }`}
          >
            {e || 'Todos'}
          </button>
        ))}
      </Card>

      {isLoading && (
        <div className="flex justify-center py-16"><Loader2 className="size-5 animate-spin text-subtle" /></div>
      )}

      {!isLoading && data?.dados.length === 0 && (
        <p className="py-16 text-center text-sm text-subtle">Nenhuma transferência encontrada.</p>
      )}

      <div className="space-y-3">
        {data?.dados.map((t) => (
          <Card key={t.id} className="p-4">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <Link to={`/utilizadores/${t.escuteiro_id}`} className="font-semibold text-text hover:underline">
                {t.escuteiro_nome}
              </Link>
              <BadgeEstadoTransferencia estado={t.estado} />
            </div>
            <p className="text-[13px] text-muted">
              {t.agrupamento_origem_nome ? formatarAgrupamento({ nome: t.agrupamento_origem_nome, ab_agrupamento: t.agrupamento_origem_ab_agrupamento }) : '—'} → <strong className="text-text">{formatarAgrupamento({ nome: t.agrupamento_destino_nome, ab_agrupamento: t.agrupamento_destino_ab_agrupamento })}</strong>
            </p>
            {t.motivo && <p className="mt-1 text-[12.5px] text-muted">{t.motivo}</p>}
            {t.documento_nome && (
              <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-subtle">
                <FileText className="size-3" /> {t.documento_nome}
              </p>
            )}
            <p className="mt-1.5 text-[11px] text-subtle">
              Solicitado por {t.solicitado_por_nome} em {new Date(t.data_solicitacao).toLocaleDateString('pt-PT')}
              {t.aprovado_por_nome && <> · Decidido por {t.aprovado_por_nome}</>}
            </p>

            {t.estado === 'PENDENTE' && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => decidir.mutate({ id: t.id, estado: 'APROVADA' })}
                  disabled={decidir.isPending}
                  className="rounded-lg bg-badge-green-bg px-3 py-1.5 text-[12px] font-semibold text-badge-green-text transition hover:opacity-80 disabled:opacity-50"
                >
                  Aprovar
                </button>
                <button
                  onClick={() => decidir.mutate({ id: t.id, estado: 'REJEITADA' })}
                  disabled={decidir.isPending}
                  className="rounded-lg bg-badge-red-bg px-3 py-1.5 text-[12px] font-semibold text-badge-red-text transition hover:opacity-80 disabled:opacity-50"
                >
                  Rejeitar
                </button>
                {(user?.perfil_nome === 'ADMIN' || t.solicitado_por === user?.id) && (
                  <button
                    onClick={() => cancelar.mutate(t.id)}
                    disabled={cancelar.isPending}
                    className="rounded-lg bg-bg px-3 py-1.5 text-[12px] font-semibold text-muted transition hover:bg-border disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-4">
        <PaginacaoServidor paginacao={data?.paginacao} onMudarPagina={(pagina) => setFiltros((f) => ({ ...f, pagina }))} />
      </div>
    </div>
  )
}
