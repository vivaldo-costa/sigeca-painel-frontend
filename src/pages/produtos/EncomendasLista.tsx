import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ShoppingBag, Loader2, MapPin, Landmark, FileText } from 'lucide-react'
import { usePedidosPainel, useAtualizarStatusPedido, useAtualizarStatusLinha } from '@/hooks/usePedidosPainel'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { uploadUrl } from '@/lib/uploads'
import type { FiltrosPedidos, StatusPedido, StatusLinha, PedidoPainel } from '@/types/pedidoPainel'

const ESTADOS_PEDIDO: StatusPedido[] = ['pendente', 'aguardando_pagamento', 'pago', 'enviado', 'entregue', 'cancelado']
const CORES_PEDIDO: Record<StatusPedido, string> = {
  pendente: 'bg-badge-orange-bg text-badge-orange-text',
  aguardando_pagamento: 'bg-badge-orange-bg text-badge-orange-text',
  pago: 'bg-badge-blue-bg text-badge-blue-text',
  enviado: 'bg-badge-violet-bg text-badge-violet-text',
  entregue: 'bg-badge-green-bg text-badge-green-text',
  cancelado: 'bg-bg text-muted',
}
const ESTADOS_LINHA: StatusLinha[] = ['PENDENTE', 'CONFIRMADO', 'ENTREGUE']

export function EncomendasLista() {
  const [filtros, setFiltros] = useState<FiltrosPedidos>({})
  const { data, isLoading } = usePedidosPainel(filtros)
  const atualizarPedido = useAtualizarStatusPedido()
  const atualizarLinha = useAtualizarStatusLinha()

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-7">
      <Link to="/produtos" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-text">
        <ChevronLeft className="size-3.5" /> Voltar a Produtos
      </Link>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <ShoppingBag className="size-5 text-muted" /> Encomendas
          {data && <span className="text-sm font-normal text-subtle">({data.length})</span>}
        </h1>
        <ExportarBotoes
          tamanho="sm"
          nomeFicheiro="encomendas"
          titulo="Encomendas"
          colunas={[
            { titulo: 'Pedido', valor: (p: PedidoPainel) => `#${p.id}` },
            { titulo: 'Comprador', valor: (p) => p.utilizador_nome },
            { titulo: 'Nº SIGECA', valor: (p) => p.codigo_associado },
            { titulo: 'Data', valor: (p) => new Date(p.pedido_em).toLocaleString('pt-PT') },
            { titulo: 'Estado', valor: (p) => p.status },
            { titulo: 'Total (Kz)', valor: (p) => Number(p.total) },
          ]}
          linhas={data ?? []}
        />
      </div>

      <Card className="mb-4 flex flex-wrap gap-2 p-4">
        {(['', ...ESTADOS_PEDIDO] as (StatusPedido | '')[]).map((e) => (
          <button
            key={e || 'todos'}
            onClick={() => setFiltros({ status: e })}
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition ${
              (filtros.status ?? '') === e ? 'bg-[#111827] text-white' : 'bg-bg text-muted hover:bg-border'
            }`}
          >
            {e || 'Activos'}
          </button>
        ))}
      </Card>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}
      {!isLoading && data?.length === 0 && <p className="py-16 text-center text-sm text-subtle">Nenhuma encomenda encontrada.</p>}

      <div className="space-y-4">
        {data?.map((pedido, i) => (
          <Card key={pedido.id} className="animate-slide-up p-4 sm:p-5" style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-text">Pedido #{pedido.id} — {pedido.utilizador_nome}</p>
                <p className="text-[11.5px] text-subtle">
                  {pedido.codigo_associado} · {new Date(pedido.pedido_em).toLocaleString('pt-PT')}
                </p>
              </div>
              <select
                value={pedido.status}
                onChange={(e) => atualizarPedido.mutate({ id: pedido.id, status: e.target.value as StatusPedido })}
                disabled={atualizarPedido.isPending}
                className={`rounded-full border-0 px-3 py-1 text-[11.5px] font-semibold outline-none ${CORES_PEDIDO[pedido.status]}`}
              >
                {ESTADOS_PEDIDO.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            {pedido.observacoes && (
              <div className="mb-3 flex flex-wrap gap-4 rounded-lg bg-bg px-3 py-2 text-[12px] text-muted">
                {pedido.observacoes.metodo_pagamento && (
                  <span className="flex items-center gap-1.5"><Landmark className="size-3" /> {pedido.observacoes.metodo_pagamento}</span>
                )}
                {pedido.observacoes.tipo_entrega && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3" />
                    {pedido.observacoes.tipo_entrega === 'domicilio'
                      ? `Entrega: ${pedido.observacoes.bairro ?? ''} ${pedido.observacoes.municipio ?? ''}`.trim()
                      : 'Levantamento na sede'}
                  </span>
                )}
                {pedido.observacoes.comprovativo && (
                  <a
                    href={uploadUrl('comprovativos_pedidos', pedido.observacoes.comprovativo)!}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-badge-blue-text hover:underline"
                  >
                    <FileText className="size-3" /> Ver comprovativo
                  </a>
                )}
              </div>
            )}

            <div className="divide-y divide-border">
              {pedido.itens.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2.5">
                  <div className="size-10 shrink-0 overflow-hidden rounded-lg border border-border bg-bg">
                    {item.produto_imagem && <img src={uploadUrl('produtos', item.produto_imagem)!} className="size-full object-cover" alt="" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-text">{item.produto_nome}</p>
                    <p className="text-[11px] text-subtle">
                      {item.quantidade}× {item.tamanho && `· ${item.tamanho}`} {item.cor && `· ${item.cor}`} · {Number(item.subtotal).toLocaleString('pt-PT')} Kz
                    </p>
                  </div>
                  <select
                    value={item.status}
                    onChange={(e) => atualizarLinha.mutate({ itemId: item.id, status: e.target.value as StatusLinha })}
                    disabled={atualizarLinha.isPending}
                    className="rounded-lg border border-border bg-white px-2 py-1 text-[11px] text-text outline-none"
                  >
                    {ESTADOS_LINHA.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-end border-t border-border pt-2.5 text-[13px] font-bold text-text">
              Total: {Number(pedido.total).toLocaleString('pt-PT')} Kz
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
