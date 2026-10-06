import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Boxes, Loader2, Search, SlidersHorizontal, History } from 'lucide-react'
import { useInventario, useResumoLoja, type FiltrosInventario } from '@/hooks/useStock'
import { usePermissao } from '@/hooks/usePermissao'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { ModalAjusteStock } from '@/components/stock/ModalAjusteStock'
import { ESTADO_STOCK_LABEL, type LinhaInventario, type EstadoStock } from '@/types/stock'
import { cn } from '@/lib/cn'

const POR_PAGINA = 50
const CORES_ESTADO: Record<EstadoStock, string> = {
  DISPONIVEL: 'bg-badge-green-bg text-badge-green-text',
  STOCK_BAIXO: 'bg-badge-orange-bg text-badge-orange-text',
  ESGOTADO: 'bg-badge-red-bg text-badge-red-text',
}

/** Inventário da Loja — stock físico, reservado e disponível por variante (SKU). */
export function StockInventarioPage() {
  const [filtros, setFiltros] = useState<FiltrosInventario>({})
  const [rascunho, setRascunho] = useState<FiltrosInventario>({})
  const [pagina, setPagina] = useState(1)
  const [ajustar, setAjustar] = useState<LinhaInventario | 'novo' | null>(null)
  const { data, isLoading } = useInventario(filtros)
  const { data: resumo } = useResumoLoja()
  const { criar: podeAjustar } = usePermissao('Stock')

  const linhas = data ?? []
  const totalPaginas = Math.max(1, Math.ceil(linhas.length / POR_PAGINA))
  const visiveis = useMemo(() => linhas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA), [linhas, pagina])
  const tamanhos = useMemo(() => [...new Set(linhas.map((l) => l.tamanho).filter(Boolean))] as string[], [linhas])
  const cores = useMemo(() => [...new Set(linhas.map((l) => l.cor).filter(Boolean))] as string[], [linhas])

  function aplicar(novos: FiltrosInventario) {
    setFiltros(novos)
    setPagina(1)
  }

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-6 sm:px-6 sm:py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <Boxes className="size-5 text-muted" /> Stock — Inventário
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <ExportarBotoes
            tamanho="sm"
            nomeFicheiro="inventario-loja"
            titulo="Inventário da Loja"
            colunas={[
              { titulo: 'Produto', valor: (l: LinhaInventario) => l.produto_nome },
              { titulo: 'SKU', valor: (l) => l.sku ?? '—' },
              { titulo: 'Tamanho', valor: (l) => l.tamanho ?? '—' },
              { titulo: 'Cor', valor: (l) => l.cor ?? '—' },
              { titulo: 'Físico', valor: (l) => l.stock_fisico },
              { titulo: 'Reservado', valor: (l) => l.stock_reservado },
              { titulo: 'Disponível', valor: (l) => l.stock_disponivel },
              { titulo: 'Mínimo', valor: (l) => l.stock_minimo },
              { titulo: 'Estado', valor: (l) => ESTADO_STOCK_LABEL[l.estado] },
            ]}
            linhas={linhas}
          />
          <Link to="/stock/movimentos" className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-[12.5px] font-semibold text-text hover:bg-bg">
            <History className="size-3.5" /> Movimentos
          </Link>
          {podeAjustar && (
            <button onClick={() => setAjustar('novo')} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-black">
              <SlidersHorizontal className="size-3.5" /> Novo ajuste
            </button>
          )}
        </div>
      </div>

      {resumo && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            ['Stock físico', resumo.fisico, ''],
            ['Reservado', resumo.reservado, 'text-badge-orange-text'],
            ['Disponível', resumo.disponivel, 'text-badge-green-text'],
            ['Stock baixo', resumo.variantes_stock_baixo, 'text-badge-orange-text'],
            ['Esgotados', resumo.variantes_sem_stock, 'text-badge-red-text'],
          ].map(([rotulo, valor, cor]) => (
            <Card key={rotulo as string} className="p-3.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-subtle">{rotulo}</p>
              <p className={cn('mt-1 font-mono text-xl font-bold text-text', cor as string)}>{Number(valor).toLocaleString('pt-PT')}</p>
            </Card>
          ))}
        </div>
      )}

      <Card className="mb-4 p-4">
        <form onSubmit={(e) => { e.preventDefault(); aplicar(rascunho) }} className="grid grid-cols-1 gap-2 sm:grid-cols-6">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
            <input value={rascunho.pesquisa ?? ''} onChange={(e) => setRascunho((f) => ({ ...f, pesquisa: e.target.value }))} placeholder="Produto…"
              className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]" />
          </div>
          <input value={rascunho.sku ?? ''} onChange={(e) => setRascunho((f) => ({ ...f, sku: e.target.value }))} placeholder="SKU"
            className="rounded-lg border border-border px-3 py-2 font-mono text-[12.5px] outline-none focus:border-[#111827]" />
          <select value={rascunho.tamanho ?? ''} onChange={(e) => setRascunho((f) => ({ ...f, tamanho: e.target.value || undefined }))} className="rounded-lg border border-border bg-white px-2.5 text-[12.5px]">
            <option value="">Tamanho</option>
            {tamanhos.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={rascunho.cor ?? ''} onChange={(e) => setRascunho((f) => ({ ...f, cor: e.target.value || undefined }))} className="rounded-lg border border-border bg-white px-2.5 text-[12.5px]">
            <option value="">Cor</option>
            {cores.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" className="rounded-lg bg-[#111827] px-3 py-2 text-[12.5px] font-semibold text-white">Filtrar</button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {([['', 'Todos'], ['DISPONIVEL', 'Disponível'], ['STOCK_BAIXO', 'Stock baixo'], ['ESGOTADO', 'Sem stock']] as const).map(([valor, rotulo]) => (
            <button key={valor || 'todos'} type="button"
              onClick={() => { const n = { ...rascunho, estado: valor || undefined }; setRascunho(n); aplicar(n) }}
              className={cn('rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition',
                (filtros.estado ?? '') === valor ? 'bg-[#111827] text-white' : 'bg-bg text-muted hover:bg-border')}>
              {rotulo}
            </button>
          ))}
        </div>
      </Card>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3.5 py-2.5 font-medium">Produto</th>
              <th className="px-3.5 py-2.5 font-medium">SKU</th>
              <th className="px-3.5 py-2.5 font-medium">Tamanho</th>
              <th className="px-3.5 py-2.5 font-medium">Cor</th>
              <th className="px-3.5 py-2.5 text-right font-medium">Físico</th>
              <th className="px-3.5 py-2.5 text-right font-medium">Reservado</th>
              <th className="px-3.5 py-2.5 text-right font-medium">Disponível</th>
              <th className="px-3.5 py-2.5 text-right font-medium">Mínimo</th>
              <th className="px-3.5 py-2.5 font-medium">Estado</th>
              <th className="px-3.5 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!isLoading && linhas.length === 0 && <tr><td colSpan={10} className="py-10 text-center text-subtle">Nenhum artigo encontrado.</td></tr>}
            {visiveis.map((l) => (
              <tr key={l.variacao_id} className="transition-colors hover:bg-bg">
                <td className="px-3.5 py-2.5 font-medium text-text">{l.produto_nome}{l.modelo ? <span className="text-subtle"> · {l.modelo}</span> : null}</td>
                <td className="px-3.5 py-2.5 font-mono text-[11.5px] text-muted">{l.sku ?? '—'}</td>
                <td className="px-3.5 py-2.5 text-muted">{l.tamanho ?? '—'}</td>
                <td className="px-3.5 py-2.5 text-muted">{l.cor ?? '—'}</td>
                <td className="px-3.5 py-2.5 text-right font-mono">{l.stock_fisico}</td>
                <td className="px-3.5 py-2.5 text-right font-mono text-badge-orange-text">{l.stock_reservado}</td>
                <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-text">{l.stock_disponivel}</td>
                <td className="px-3.5 py-2.5 text-right font-mono text-subtle">{l.stock_minimo}</td>
                <td className="px-3.5 py-2.5"><span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', CORES_ESTADO[l.estado])}>{ESTADO_STOCK_LABEL[l.estado]}</span></td>
                <td className="px-3.5 py-2.5 text-right">
                  <div className="flex justify-end gap-1.5">
                    <Link to={`/stock/movimentos?variacao=${l.variacao_id}`} title="Ver movimentos" className="rounded-md border border-border p-1.5 text-muted hover:bg-white"><History className="size-3.5" /></Link>
                    {podeAjustar && (
                      <button onClick={() => setAjustar(l)} title="Ajustar stock" className="rounded-md border border-border p-1.5 text-muted hover:bg-white"><SlidersHorizontal className="size-3.5" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {totalPaginas > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-[12.5px]">
          <button disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)} className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40">Anterior</button>
          <span className="text-muted">Página {pagina} de {totalPaginas} · {linhas.length} artigos</span>
          <button disabled={pagina >= totalPaginas} onClick={() => setPagina((p) => p + 1)} className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40">Seguinte</button>
        </div>
      )}

      {ajustar !== null && <ModalAjusteStock variante={ajustar === 'novo' ? null : ajustar} onClose={() => setAjustar(null)} />}
    </div>
  )
}
