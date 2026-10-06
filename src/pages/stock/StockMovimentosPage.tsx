import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { History, Loader2, Search, ArrowLeft, SlidersHorizontal } from 'lucide-react'
import { useMovimentos, type FiltrosMovimentos } from '@/hooks/useStock'
import { usePermissao } from '@/hooks/usePermissao'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { ModalAjusteStock } from '@/components/stock/ModalAjusteStock'
import { TIPO_MOVIMENTO_LABEL, type MovimentoStock, type TipoMovimento } from '@/types/stock'
import { cn } from '@/lib/cn'

const ORIGENS: Record<string, string> = {
  pos: 'POS', encomenda: 'Encomenda', levantamento: 'Levantamento', cancelamento: 'Cancelamento',
  devolucao: 'Devolução', troca: 'Troca', ajuste: 'Ajuste', produto: 'Produto', migracao: 'Migração',
}
const ENTRADAS: TipoMovimento[] = ['ENTRADA', 'DEVOLUCAO', 'TROCA_ENTRADA', 'AJUSTE_ENTRADA']

interface Props {
  /** `ajustes` → página "Stock › Ajustes" (só movimentos de ajuste + botão de novo ajuste). */
  modo?: 'todos' | 'ajustes'
}

/** Movimentos de stock — rastreabilidade de todas as alterações (quem, quando, porquê, antes/depois). */
export function StockMovimentosPage({ modo = 'todos' }: Props) {
  const [params] = useSearchParams()
  const variacaoId = Number(params.get('variacao')) || undefined
  const base: FiltrosMovimentos = { ...(modo === 'ajustes' ? { origem: 'ajuste' } : {}), ...(variacaoId ? { variacao_id: variacaoId } : {}), por_pagina: 50 }
  const [filtros, setFiltros] = useState<FiltrosMovimentos>({ ...base, pagina: 1 })
  const [rascunho, setRascunho] = useState<FiltrosMovimentos>(base)
  const [novoAjuste, setNovoAjuste] = useState(false)
  const { data, isLoading } = useMovimentos(filtros)
  const { criar: podeAjustar } = usePermissao('Stock')

  const movimentos = data?.dados ?? []
  const totalPaginas = data ? Math.max(1, Math.ceil(data.total / data.por_pagina)) : 1

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-6 sm:px-6 sm:py-7">
      <Link to="/stock" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-text">
        <ArrowLeft className="size-3.5" /> Inventário
      </Link>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          {modo === 'ajustes' ? <SlidersHorizontal className="size-5 text-muted" /> : <History className="size-5 text-muted" />}
          {modo === 'ajustes' ? 'Stock — Ajustes' : 'Stock — Movimentos'}
          {data && <span className="text-sm font-normal text-subtle">({data.total})</span>}
        </h1>
        <div className="flex items-center gap-2">
          <ExportarBotoes
            tamanho="sm"
            nomeFicheiro={modo === 'ajustes' ? 'ajustes-stock' : 'movimentos-stock'}
            titulo={modo === 'ajustes' ? 'Ajustes de stock' : 'Movimentos de stock'}
            subtitulo="Página actual da listagem"
            colunas={[
              { titulo: 'Data', valor: (m: MovimentoStock) => new Date(m.created_at).toLocaleString('pt-PT') },
              { titulo: 'Produto', valor: (m) => m.produto_nome },
              { titulo: 'SKU', valor: (m) => m.sku ?? '—' },
              { titulo: 'Tipo', valor: (m) => TIPO_MOVIMENTO_LABEL[m.tipo] },
              { titulo: 'Qtd', valor: (m) => m.quantidade },
              { titulo: 'Físico', valor: (m) => `${m.fisico_antes} → ${m.fisico_depois}` },
              { titulo: 'Reservado', valor: (m) => `${m.reservado_antes} → ${m.reservado_depois}` },
              { titulo: 'Origem', valor: (m) => ORIGENS[m.origem] ?? m.origem },
              { titulo: 'Referência', valor: (m) => (m.referencia_id ? `${m.referencia_tipo} #${m.referencia_id}` : '—') },
              { titulo: 'Motivo', valor: (m) => [m.motivo, m.observacao].filter(Boolean).join(' — ') || '—' },
              { titulo: 'Utilizador', valor: (m) => m.utilizador_nome ?? '—' },
            ]}
            linhas={movimentos}
          />
          {modo === 'ajustes' && podeAjustar && (
            <button onClick={() => setNovoAjuste(true)} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-black">
              <SlidersHorizontal className="size-3.5" /> Novo ajuste
            </button>
          )}
        </div>
      </div>

      <Card className="mb-4 p-4">
        <form onSubmit={(e) => { e.preventDefault(); setFiltros({ ...rascunho, pagina: 1 }) }} className="grid grid-cols-1 gap-2 sm:grid-cols-6">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
            <input value={rascunho.pesquisa ?? ''} onChange={(e) => setRascunho((f) => ({ ...f, pesquisa: e.target.value }))} placeholder="Produto ou SKU…"
              className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]" />
          </div>
          <select value={rascunho.tipo ?? ''} onChange={(e) => setRascunho((f) => ({ ...f, tipo: e.target.value || undefined }))} className="rounded-lg border border-border bg-white px-2.5 text-[12.5px]">
            <option value="">Tipo</option>
            {(Object.keys(TIPO_MOVIMENTO_LABEL) as TipoMovimento[])
              .filter((t) => modo !== 'ajustes' || t.startsWith('AJUSTE'))
              .map((t) => <option key={t} value={t}>{TIPO_MOVIMENTO_LABEL[t]}</option>)}
          </select>
          <input type="date" value={rascunho.data_inicio ?? ''} onChange={(e) => setRascunho((f) => ({ ...f, data_inicio: e.target.value || undefined }))} className="rounded-lg border border-border px-2.5 text-[12.5px]" />
          <input type="date" value={rascunho.data_fim ?? ''} onChange={(e) => setRascunho((f) => ({ ...f, data_fim: e.target.value || undefined }))} className="rounded-lg border border-border px-2.5 text-[12.5px]" />
          <button type="submit" className="rounded-lg bg-[#111827] px-3 py-2 text-[12.5px] font-semibold text-white">Filtrar</button>
        </form>
        {variacaoId && <p className="mt-2 text-[12px] text-subtle">A mostrar apenas os movimentos de um artigo. <Link to={modo === 'ajustes' ? '/stock/ajustes' : '/stock/movimentos'} className="underline">Ver todos</Link></p>}
      </Card>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3 py-2.5 font-medium">Data</th>
              <th className="px-3 py-2.5 font-medium">Artigo</th>
              <th className="px-3 py-2.5 font-medium">Tipo</th>
              <th className="px-3 py-2.5 text-right font-medium">Qtd</th>
              <th className="px-3 py-2.5 font-medium">Físico</th>
              <th className="px-3 py-2.5 font-medium">Reservado</th>
              <th className="px-3 py-2.5 font-medium">Origem / Ref.</th>
              <th className="px-3 py-2.5 font-medium">Motivo</th>
              <th className="px-3 py-2.5 font-medium">Utilizador</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!isLoading && movimentos.length === 0 && <tr><td colSpan={9} className="py-10 text-center text-subtle">Sem movimentos.</td></tr>}
            {movimentos.map((m) => (
              <tr key={m.id} className="align-top transition-colors hover:bg-bg">
                <td className="whitespace-nowrap px-3 py-2.5 text-muted">{new Date(m.created_at).toLocaleString('pt-PT')}</td>
                <td className="px-3 py-2.5">
                  <p className="font-medium text-text">{m.produto_nome}</p>
                  <p className="font-mono text-[11px] text-subtle">{m.sku}{[m.tamanho, m.cor].filter(Boolean).length ? ` · ${[m.tamanho, m.cor].filter(Boolean).join(' / ')}` : ''}</p>
                </td>
                <td className="px-3 py-2.5">
                  <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold',
                    ENTRADAS.includes(m.tipo) ? 'bg-badge-green-bg text-badge-green-text'
                      : m.tipo === 'RESERVA' || m.tipo === 'LIBERTACAO_RESERVA' ? 'bg-badge-orange-bg text-badge-orange-text'
                        : 'bg-badge-red-bg text-badge-red-text')}>
                    {TIPO_MOVIMENTO_LABEL[m.tipo]}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right font-mono font-semibold">{m.quantidade}</td>
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11.5px] text-muted">{m.fisico_antes} → {m.fisico_depois}</td>
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11.5px] text-muted">{m.reservado_antes} → {m.reservado_depois}</td>
                <td className="px-3 py-2.5 text-muted">
                  {ORIGENS[m.origem] ?? m.origem}
                  {m.referencia_id && <span className="block text-[11px] text-subtle">{m.referencia_tipo} #{m.referencia_id}</span>}
                  {m.operacao && <span className="block font-mono text-[10.5px] text-subtle">{m.operacao}</span>}
                </td>
                <td className="px-3 py-2.5 text-muted">{[m.motivo, m.observacao].filter(Boolean).join(' — ') || '—'}</td>
                <td className="px-3 py-2.5 text-muted">{m.utilizador_nome ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {totalPaginas > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-[12.5px]">
          <button disabled={(filtros.pagina ?? 1) <= 1} onClick={() => setFiltros((f) => ({ ...f, pagina: (f.pagina ?? 1) - 1 }))} className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40">Anterior</button>
          <span className="text-muted">Página {filtros.pagina ?? 1} de {totalPaginas}</span>
          <button disabled={(filtros.pagina ?? 1) >= totalPaginas} onClick={() => setFiltros((f) => ({ ...f, pagina: (f.pagina ?? 1) + 1 }))} className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40">Seguinte</button>
        </div>
      )}

      {novoAjuste && <ModalAjusteStock onClose={() => setNovoAjuste(false)} />}
    </div>
  )
}
