import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ListChecks, Loader2, Search } from 'lucide-react'
import { useAgrupamentosDaDiocese, useItensVenda, type FiltrosItensVenda } from '@/hooks/useVendas'
import { useOpcoesFiltro } from '@/hooks/useDashboardPainel'
import { useProdutos } from '@/hooks/useProdutosPainel'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { formatarAgrupamento } from '@/lib/formatadores'
import { STATUS_LABEL } from '@/types/pedidoPainel'
import type { ItemVendaListagem } from '@/types/venda'

const kz = (v: number) => `${v.toLocaleString('pt-PT')} Kz`
const agrupamentoDe = (i: ItemVendaListagem) => (i.agrupamento_nome ? formatarAgrupamento({ nome: i.agrupamento_nome, ab_agrupamento: i.ab_agrupamento }) : '—')

/**
 * Listagem de vendas por artigo — para preparar entregas (ex.: camisas por
 * agrupamento ou diocese) e relatórios. Filtra por artigo, tamanho,
 * escuteiro, agrupamento e diocese.
 */
export function VendasItensPage() {
  const [filtros, setFiltros] = useState<FiltrosItensVenda>({ por_entregar: false })
  const [rascunho, setRascunho] = useState('')
  const { data, isLoading, isFetching } = useItensVenda(filtros)
  const { data: produtos } = useProdutos({})
  const dioceses = useOpcoesFiltro('dioceses')
  const { data: agrupamentos } = useAgrupamentosDaDiocese(filtros.diocese_id)

  const itens = data?.dados ?? []
  const tamanhos = useMemo(() => [...new Set(itens.map((i) => i.tamanho).filter(Boolean))] as string[], [itens])
  const totais = useMemo(() => {
    const porTamanho = new Map<string, number>()
    let unidades = 0
    let valor = 0
    for (const i of itens) {
      unidades += i.quantidade
      valor += i.subtotal
      const t = i.tamanho || 'Sem tamanho'
      porTamanho.set(t, (porTamanho.get(t) ?? 0) + i.quantidade)
    }
    return { unidades, valor, porTamanho: [...porTamanho.entries()] }
  }, [itens])

  const set = (patch: Partial<FiltrosItensVenda>) => setFiltros((f) => ({ ...f, ...patch }))
  const nomeProduto = produtos?.find((p) => p.id === filtros.produto_id)?.nome

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-6 sm:px-6 sm:py-7">
      <Link to="/vendas" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-text">
        <ArrowLeft className="size-3.5" /> Vendas
      </Link>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <ListChecks className="size-5 text-muted" /> Vendas por artigo
          {data && <span className="text-sm font-normal text-subtle">({itens.length})</span>}
        </h1>
        <ExportarBotoes
          tamanho="sm"
          nomeFicheiro="vendas-por-artigo"
          titulo={`Vendas por artigo${nomeProduto ? ` — ${nomeProduto}` : ''}`}
          subtitulo={`${totais.unidades} unidade(s) · ${kz(totais.valor)}${filtros.por_entregar ? ' · só por entregar' : ''}`}
          colunas={[
            { titulo: 'Nome', valor: (i: ItemVendaListagem) => i.cliente_nome },
            { titulo: 'Nº SIGECA', valor: (i) => i.codigo_associado },
            { titulo: 'Contacto', valor: (i) => i.contacto ?? '' },
            { titulo: 'Diocese', valor: (i) => i.diocese_nome ?? '' },
            { titulo: 'Agrupamento', valor: agrupamentoDe },
            { titulo: 'Artigo', valor: (i) => i.produto_nome },
            { titulo: 'Tamanho', valor: (i) => i.tamanho ?? '' },
            { titulo: 'Cor', valor: (i) => i.cor ?? '' },
            { titulo: 'Qtd', valor: (i) => i.quantidade },
            { titulo: 'Valor (Kz)', valor: (i) => i.subtotal },
            { titulo: 'Pedido', valor: (i) => `#${i.pedido_id} (${i.origem === 'pos' ? 'POS' : 'Portal'})` },
            { titulo: 'Estado', valor: (i) => STATUS_LABEL[i.status as keyof typeof STATUS_LABEL] ?? i.status },
          ]}
          linhas={itens}
        />
      </div>

      <Card className="mb-4 space-y-3 p-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <form onSubmit={(e) => { e.preventDefault(); set({ pesquisa: rascunho || undefined }) }} className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
            <input value={rascunho} onChange={(e) => setRascunho(e.target.value)} placeholder="Escuteiro, Nº SIGECA ou nº do pedido…"
              className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]" />
          </form>
          <select value={filtros.produto_id ?? ''} onChange={(e) => set({ produto_id: Number(e.target.value) || undefined, tamanho: undefined })} className="rounded-lg border border-border bg-white px-2.5 py-2 text-[12.5px]">
            <option value="">Todos os artigos</option>
            {(produtos ?? []).map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
          <select value={filtros.tamanho ?? ''} onChange={(e) => set({ tamanho: e.target.value || undefined })} className="rounded-lg border border-border bg-white px-2.5 py-2 text-[12.5px]">
            <option value="">Todos os tamanhos</option>
            {tamanhos.map((t) => <option key={t} value={t}>{t}</option>)}
            {filtros.tamanho && !tamanhos.includes(filtros.tamanho) && <option value={filtros.tamanho}>{filtros.tamanho}</option>}
          </select>
          <select value={filtros.diocese_id ?? ''} onChange={(e) => set({ diocese_id: Number(e.target.value) || undefined, agrupamento_id: undefined })} className="rounded-lg border border-border bg-white px-2.5 py-2 text-[12.5px]">
            <option value="">Todas as dioceses</option>
            {(dioceses.data ?? []).map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
          </select>
          <select value={filtros.agrupamento_id ?? ''} disabled={!filtros.diocese_id} onChange={(e) => set({ agrupamento_id: Number(e.target.value) || undefined })} className="rounded-lg border border-border bg-white px-2.5 py-2 text-[12.5px] disabled:opacity-50">
            <option value="">{filtros.diocese_id ? 'Todos os agrupamentos' : 'Escolhe a diocese'}</option>
            {(agrupamentos ?? []).map((a) => <option key={a.id} value={a.id}>{formatarAgrupamento(a)}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[12.5px]">
          <select value={filtros.origem ?? ''} onChange={(e) => set({ origem: (e.target.value || undefined) as FiltrosItensVenda['origem'] })} className="rounded-lg border border-border bg-white px-2.5 py-1.5">
            <option value="">POS e Portal</option>
            <option value="pos">Só POS (loja)</option>
            <option value="portal">Só encomendas do Portal</option>
          </select>
          <label className="flex items-center gap-1.5">De <input type="date" value={filtros.data_inicio ?? ''} onChange={(e) => set({ data_inicio: e.target.value || undefined })} className="rounded-lg border border-border px-2 py-1" /></label>
          <label className="flex items-center gap-1.5">Até <input type="date" value={filtros.data_fim ?? ''} onChange={(e) => set({ data_fim: e.target.value || undefined })} className="rounded-lg border border-border px-2 py-1" /></label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={!!filtros.por_entregar} onChange={(e) => set({ por_entregar: e.target.checked })} className="size-3.5" />
            Só por entregar / levantar
          </label>
          {isFetching && <Loader2 className="size-3.5 animate-spin text-subtle" />}
        </div>
      </Card>

      {itens.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2 text-[12px]">
          <span className="rounded-full bg-[#111827] px-3 py-1 font-semibold text-white">{totais.unidades} unid. · {kz(totais.valor)}</span>
          {totais.porTamanho.map(([t, q]) => (
            <span key={t} className="rounded-full bg-bg px-3 py-1 text-muted">{t}: <b className="text-text">{q}</b></span>
          ))}
        </div>
      )}
      {data && itens.length >= data.limite && (
        <p className="mb-3 text-[12px] text-badge-orange-text">A mostrar as primeiras {data.limite} linhas — usa os filtros para reduzir.</p>
      )}

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3 py-2.5 font-medium">Escuteiro</th>
              <th className="px-3 py-2.5 font-medium">Contacto</th>
              <th className="px-3 py-2.5 font-medium">Diocese / Agrupamento</th>
              <th className="px-3 py-2.5 font-medium">Artigo</th>
              <th className="px-3 py-2.5 text-right font-medium">Qtd</th>
              <th className="px-3 py-2.5 font-medium">Pedido</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!isLoading && itens.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-subtle">Nenhuma venda encontrada.</td></tr>}
            {itens.map((i) => (
              <tr key={i.id} className="align-top hover:bg-bg">
                <td className="px-3 py-2"><p className="font-medium text-text">{i.cliente_nome}</p><p className="font-mono text-[11px] text-subtle">{i.codigo_associado}</p></td>
                <td className="px-3 py-2 text-muted">{i.contacto ?? '—'}</td>
                <td className="px-3 py-2 text-muted"><p>{i.diocese_nome ?? '—'}</p><p className="text-[11px] text-subtle">{agrupamentoDe(i)}</p></td>
                <td className="px-3 py-2"><p className="text-text">{i.produto_nome}</p><p className="text-[11px] text-subtle">{[i.tamanho, i.cor].filter(Boolean).join(' / ') || '—'}</p></td>
                <td className="px-3 py-2 text-right font-mono font-semibold">{i.quantidade}</td>
                <td className="px-3 py-2 text-muted">#{i.pedido_id} · {i.origem === 'pos' ? 'POS' : 'Portal'}<span className="block text-[11px] text-subtle">{STATUS_LABEL[i.status as keyof typeof STATUS_LABEL] ?? i.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
