import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Receipt, Loader2, Search, Plus } from 'lucide-react'
import { useVendas } from '@/hooks/useVendas'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import type { VendaResumo } from '@/types/venda'

export function VendasLista() {
  const [pesquisaRascunho, setPesquisaRascunho] = useState('')
  const [pesquisa, setPesquisa] = useState('')
  const { data, isLoading } = useVendas(pesquisa)

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <Receipt className="size-5 text-muted" /> Vendas
        </h1>
        <div className="flex items-center gap-2">
          <ExportarBotoes
            tamanho="sm"
            nomeFicheiro="vendas"
            titulo="Vendas"
            colunas={[
              { titulo: 'Comprador', valor: (v: VendaResumo) => v.utilizador_nome },
              { titulo: 'Nº SIGECA', valor: (v) => v.codigo_associado },
              { titulo: 'Artigos', valor: (v) => v.total_itens },
              { titulo: 'Pagamento', valor: (v) => v.metodo_pagamento ?? '—' },
              { titulo: 'Vendido por', valor: (v) => v.vendido_por_nome ?? '—' },
              { titulo: 'Data', valor: (v) => new Date(v.pedido_em).toLocaleString('pt-PT') },
              { titulo: 'Total (Kz)', valor: (v) => v.total },
            ]}
            linhas={data ?? []}
          />
          <Link to="/vendas/pos" className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-black">
            <Plus className="size-3.5" /> Nova Venda
          </Link>
        </div>
      </div>

      <Card className="mb-5 p-4">
        <form onSubmit={(e) => { e.preventDefault(); setPesquisa(pesquisaRascunho) }} className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
          <input
            value={pesquisaRascunho}
            onChange={(e) => setPesquisaRascunho(e.target.value)}
            placeholder="Pesquisar por comprador..."
            className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]"
          />
        </form>
      </Card>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3.5 py-2.5 font-medium">Comprador</th>
              <th className="px-3.5 py-2.5 font-medium">Artigos</th>
              <th className="px-3.5 py-2.5 font-medium">Pagamento</th>
              <th className="px-3.5 py-2.5 font-medium">Vendido por</th>
              <th className="px-3.5 py-2.5 font-medium">Data</th>
              <th className="px-3.5 py-2.5 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!isLoading && data?.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-subtle">Nenhuma venda registada ainda.</td></tr>}
            {data?.map((v) => (
              <tr key={v.id} className="transition-colors hover:bg-bg">
                <td className="px-3.5 py-2.5">
                  <p className="font-medium text-text">{v.utilizador_nome}</p>
                  <p className="font-mono text-[11px] text-subtle">{v.codigo_associado}</p>
                </td>
                <td className="px-3.5 py-2.5 text-muted">{v.total_itens} artigo{v.total_itens !== 1 && 's'}</td>
                <td className="px-3.5 py-2.5 text-muted">{v.metodo_pagamento ?? '—'}</td>
                <td className="px-3.5 py-2.5 text-muted">{v.vendido_por_nome ?? '—'}</td>
                <td className="px-3.5 py-2.5 text-muted">{new Date(v.pedido_em).toLocaleString('pt-PT')}</td>
                <td className="px-3.5 py-2.5 text-right font-semibold text-text">{v.total.toLocaleString('pt-PT')} Kz</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
