import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ShoppingBag, Loader2, MapPin, Landmark, FileText, Search, RotateCcw, PackageCheck } from 'lucide-react'
import { usePedidosPainel, useAtualizarStatusPedido, useAtualizarStatusLinha } from '@/hooks/usePedidosPainel'
import { usePermissao } from '@/hooks/usePermissao'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { useConfirmar } from '@/components/ui/ConfirmProvider'
import { ModalRetorno } from '@/components/vendas/ModalRetorno'
import { uploadUrl } from '@/lib/uploads'
import { getApiErrorMessage } from '@/lib/api'
import { notificar } from '@/lib/notificar'
import type { FiltrosPedidos, StatusPedido, StatusLinha, PedidoPainel, EstadoStockPedido } from '@/types/pedidoPainel'

const ESTADOS_PEDIDO: StatusPedido[] = ['pendente', 'aguardando_pagamento', 'pago', 'pronto', 'enviado', 'entregue', 'cancelado']
const ROTULO_PEDIDO: Record<StatusPedido, string> = {
  pendente: 'Pendente',
  aguardando_pagamento: 'A aguardar pagamento',
  pago: 'Pago',
  pronto: 'Pronta p/ levantar',
  enviado: 'Enviada',
  entregue: 'Entregue/Levantada',
  cancelado: 'Cancelada',
}
const CORES_PEDIDO: Record<StatusPedido, string> = {
  pendente: 'bg-badge-orange-bg text-badge-orange-text',
  aguardando_pagamento: 'bg-badge-orange-bg text-badge-orange-text',
  pago: 'bg-badge-blue-bg text-badge-blue-text',
  pronto: 'bg-badge-violet-bg text-badge-violet-text',
  enviado: 'bg-badge-violet-bg text-badge-violet-text',
  entregue: 'bg-badge-green-bg text-badge-green-text',
  cancelado: 'bg-bg text-muted',
}
/** Igual às regras da API (pedidoPainel.service.js) — só mostra mudanças válidas. */
const TRANSICOES: Record<StatusPedido, StatusPedido[]> = {
  pendente: ['aguardando_pagamento', 'pago', 'pronto', 'enviado', 'entregue', 'cancelado'],
  aguardando_pagamento: ['pendente', 'pago', 'pronto', 'enviado', 'entregue', 'cancelado'],
  pago: ['pronto', 'enviado', 'entregue', 'cancelado'],
  pronto: ['pago', 'enviado', 'entregue', 'cancelado'],
  enviado: ['entregue', 'cancelado'],
  entregue: [],
  cancelado: [],
}
const STOCK_BADGE: Record<EstadoStockPedido, [string, string]> = {
  reservado: ['Stock reservado', 'bg-badge-orange-bg text-badge-orange-text'],
  baixado: ['Stock entregue', 'bg-badge-green-bg text-badge-green-text'],
  libertado: ['Reserva libertada', 'bg-bg text-muted'],
  nenhum: ['—', 'bg-bg text-muted'],
}
const ESTADOS_LINHA: StatusLinha[] = ['PENDENTE', 'CONFIRMADO', 'ENTREGUE']

export function EncomendasLista() {
  const [filtros, setFiltros] = useState<FiltrosPedidos>({ origem: 'portal' })
  const [pesquisa, setPesquisa] = useState('')
  const { data, isLoading } = usePedidosPainel(filtros)
  const atualizarPedido = useAtualizarStatusPedido()
  const atualizarLinha = useAtualizarStatusLinha()
  const confirmar = useConfirmar()
  const { editar: podeEditar } = usePermissao('Produtos')
  const [retorno, setRetorno] = useState<number | null>(null)

  async function mudarEstado(pedido: PedidoPainel, status: StatusPedido) {
    const mensagens: Partial<Record<StatusPedido, string>> = {
      cancelado: pedido.estado_stock === 'reservado'
        ? 'Cancelar a encomenda? A reserva de stock é libertada (fica de novo disponível). Esta acção não se pode desfazer.'
        : 'Cancelar a encomenda? Os artigos que já tinham saído voltam a dar entrada no stock. Esta acção não se pode desfazer.',
      entregue: pedido.estado_stock === 'reservado'
        ? 'Confirmar o levantamento/entrega? A reserva passa a saída real do stock físico.'
        : 'Marcar como entregue?',
      enviado: pedido.estado_stock === 'reservado' ? 'Confirmar o envio? A reserva passa a saída real do stock físico.' : undefined,
    }
    if (mensagens[status]) {
      const ok = await confirmar({
        titulo: `Encomenda #${pedido.id} — ${ROTULO_PEDIDO[status]}`,
        mensagem: mensagens[status]!,
        textoConfirmar: status === 'cancelado' ? 'Sim, cancelar' : 'Confirmar',
        perigoso: status === 'cancelado',
      })
      if (!ok) return
    }
    try {
      await atualizarPedido.mutateAsync({ id: pedido.id, status })
      notificar.sucesso(`Encomenda #${pedido.id}: ${ROTULO_PEDIDO[status]}.`)
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível mudar o estado.'))
    }
  }

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
            { titulo: 'Origem', valor: (p) => (p.origem === 'pos' ? 'POS' : 'Portal') },
            { titulo: 'Comprador', valor: (p) => p.utilizador_nome },
            { titulo: 'Nº SIGECA', valor: (p) => p.codigo_associado },
            { titulo: 'Data', valor: (p) => new Date(p.pedido_em).toLocaleString('pt-PT') },
            { titulo: 'Estado', valor: (p) => ROTULO_PEDIDO[p.status] ?? p.status },
            { titulo: 'Stock', valor: (p) => STOCK_BADGE[p.estado_stock]?.[0] ?? p.estado_stock },
            { titulo: 'Total (Kz)', valor: (p) => Number(p.total) },
          ]}
          linhas={data ?? []}
        />
      </div>

      <Card className="mb-4 space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <form
            onSubmit={(e) => { e.preventDefault(); setFiltros((f) => ({ ...f, pesquisa })) }}
            className="relative min-w-[220px] flex-1"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
            <input value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} placeholder="Nº da encomenda, nome ou Nº SIGECA…"
              className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]" />
          </form>
          <select value={filtros.origem ?? ''} onChange={(e) => setFiltros((f) => ({ ...f, origem: e.target.value as FiltrosPedidos['origem'] }))}
            className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] outline-none">
            <option value="portal">Encomendas do Portal</option>
            <option value="pos">Vendas POS</option>
            <option value="">Todas</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['', ...ESTADOS_PEDIDO] as (StatusPedido | '')[]).map((e) => (
            <button
              key={e || 'todos'}
              onClick={() => setFiltros((f) => ({ ...f, status: e }))}
              className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition ${
                (filtros.status ?? '') === e ? 'bg-[#111827] text-white' : 'bg-bg text-muted hover:bg-border'
              }`}
            >
              {e ? ROTULO_PEDIDO[e] : 'Activas'}
            </button>
          ))}
        </div>
      </Card>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}
      {!isLoading && data?.length === 0 && <p className="py-16 text-center text-sm text-subtle">Nenhuma encomenda encontrada.</p>}

      <div className="space-y-4">
        {data?.map((pedido, i) => {
          const pagamento = pedido.metodo_pagamento ?? pedido.observacoes?.metodo_pagamento
          const tipoEntrega = pedido.tipo_entrega ?? pedido.observacoes?.tipo_entrega
          const comprovativo = pedido.comprovativo ?? pedido.observacoes?.comprovativo
          const proximos = TRANSICOES[pedido.status] ?? []
          return (
            <Card key={pedido.id} className="animate-slide-up p-4 sm:p-5" style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-text">
                    {pedido.origem === 'pos' ? 'Venda' : 'Encomenda'} #{pedido.id} — {pedido.utilizador_nome}
                  </p>
                  <p className="text-[11.5px] text-subtle">
                    {pedido.codigo_associado} · {new Date(pedido.pedido_em).toLocaleString('pt-PT')}
                    {pedido.levantado_em && ` · levantada ${new Date(pedido.levantado_em).toLocaleString('pt-PT')}`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STOCK_BADGE[pedido.estado_stock]?.[1] ?? ''}`}>
                    {STOCK_BADGE[pedido.estado_stock]?.[0] ?? pedido.estado_stock}
                  </span>
                  {podeEditar && proximos.length > 0 ? (
                    <select
                      value={pedido.status}
                      onChange={(e) => mudarEstado(pedido, e.target.value as StatusPedido)}
                      disabled={atualizarPedido.isPending}
                      className={`rounded-full border-0 px-3 py-1 text-[11.5px] font-semibold outline-none ${CORES_PEDIDO[pedido.status]}`}
                    >
                      <option value={pedido.status}>{ROTULO_PEDIDO[pedido.status]}</option>
                      {proximos.map((e) => <option key={e} value={e}>→ {ROTULO_PEDIDO[e]}</option>)}
                    </select>
                  ) : (
                    <span className={`rounded-full px-3 py-1 text-[11.5px] font-semibold ${CORES_PEDIDO[pedido.status]}`}>{ROTULO_PEDIDO[pedido.status]}</span>
                  )}
                  {podeEditar && pedido.estado_stock === 'reservado' && pedido.status !== 'cancelado' && (
                    <button onClick={() => mudarEstado(pedido, 'entregue')} className="flex items-center gap-1 rounded-lg bg-[#111827] px-2.5 py-1 text-[11.5px] font-semibold text-white">
                      <PackageCheck className="size-3.5" /> Confirmar levantamento
                    </button>
                  )}
                  {podeEditar && pedido.estado_stock === 'baixado' && pedido.status !== 'cancelado' && (
                    <button onClick={() => setRetorno(pedido.id)} className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[11.5px] font-semibold text-text hover:bg-bg">
                      <RotateCcw className="size-3.5" /> Devolver / Trocar
                    </button>
                  )}
                </div>
              </div>

              {(pagamento || tipoEntrega || comprovativo) && (
                <div className="mb-3 flex flex-wrap gap-4 rounded-lg bg-bg px-3 py-2 text-[12px] text-muted">
                  {pagamento && (
                    <span className="flex items-center gap-1.5"><Landmark className="size-3" /> {pagamento}{pedido.referencia_pagamento ? ` · Ref. ${pedido.referencia_pagamento}` : ''}</span>
                  )}
                  {tipoEntrega && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3" />
                      {tipoEntrega === 'domicilio'
                        ? `Entrega: ${pedido.bairro ?? pedido.observacoes?.bairro ?? ''} ${pedido.municipio ?? pedido.observacoes?.municipio ?? ''}`.trim()
                        : 'Levantamento na sede'}
                    </span>
                  )}
                  {comprovativo && (
                    <a href={uploadUrl('comprovativos_pedidos', comprovativo)!} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-badge-blue-text hover:underline">
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
                      <p className="truncate text-[12.5px] font-medium text-text">
                        {item.produto_nome}
                        {item.origem_troca_item_id && <span className="ml-1.5 rounded bg-badge-violet-bg px-1.5 text-[10px] font-semibold text-badge-violet-text">troca</span>}
                      </p>
                      <p className="text-[11px] text-subtle">
                        {item.quantidade}× {item.tamanho && `· ${item.tamanho}`} {item.cor && `· ${item.cor}`} {item.sku && `· ${item.sku}`} · {Number(item.subtotal).toLocaleString('pt-PT')} Kz
                        {item.quantidade_devolvida > 0 && ` · ${item.quantidade_devolvida} devolvida(s)/trocada(s)`}
                      </p>
                    </div>
                    <select
                      value={item.status}
                      onChange={(e) => atualizarLinha.mutate({ itemId: item.id, status: e.target.value as StatusLinha })}
                      disabled={atualizarLinha.isPending || !podeEditar}
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
          )
        })}
      </div>

      {retorno !== null && <ModalRetorno pedidoId={retorno} onClose={() => setRetorno(null)} />}
    </div>
  )
}
