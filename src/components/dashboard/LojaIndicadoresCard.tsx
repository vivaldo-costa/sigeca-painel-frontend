import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useResumoLoja } from '@/hooks/useStock'
import { usePermissao } from '@/hooks/usePermissao'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { cn } from '@/lib/cn'

/** Indicadores da Loja (stock, encomendas, vendas do dia) — só para quem pode ver o Stock. */
export function LojaIndicadoresCard() {
  const { ver } = usePermissao('Stock')
  const { data } = useResumoLoja(ver)
  if (!ver || !data) return null

  const itens: [string, number, string, string][] = [
    ['Vendas hoje', data.vendas_hoje, '/vendas', ''],
    ['Valor vendido hoje (Kz)', data.valor_vendas_hoje, '/vendas', ''],
    ['Encomendas pendentes', data.encomendas_pendentes, '/produtos/encomendas', 'text-badge-orange-text'],
    ['Prontas p/ levantamento', data.encomendas_prontas, '/produtos/encomendas', 'text-badge-blue-text'],
    ['Stock disponível', data.disponivel, '/stock', 'text-badge-green-text'],
    ['Stock reservado', data.reservado, '/stock', 'text-badge-orange-text'],
    ['Artigos c/ stock baixo', data.variantes_stock_baixo, '/stock', 'text-badge-orange-text'],
    ['Artigos esgotados', data.variantes_sem_stock, '/stock', 'text-badge-red-text'],
    ['Devoluções (30 dias)', data.devolucoes_30d, '/vendas/retornos', ''],
  ]

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold text-text">
          <ShoppingBag className="size-4 text-muted" /> Loja — Vendas e Stock
        </h3>
        <ExportarBotoes
          tamanho="sm"
          nomeFicheiro="indicadores-loja"
          titulo="Indicadores da Loja"
          colunas={[
            { titulo: 'Indicador', valor: (l: [string, number, string, string]) => l[0] },
            { titulo: 'Valor', valor: (l) => l[1] },
          ]}
          linhas={itens}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
        {itens.map(([rotulo, valor, to, cor]) => (
          <Link key={rotulo} to={to} className="rounded-lg border border-border p-3 transition hover:bg-bg">
            <p className="text-[11px] font-medium leading-tight text-subtle">{rotulo}</p>
            <p className={cn('mt-1 font-mono text-lg font-bold text-text', cor)}>{Number(valor || 0).toLocaleString('pt-PT')}</p>
          </Link>
        ))}
      </div>
    </Card>
  )
}
