import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RotateCcw, Loader2, Search, ArrowLeft } from 'lucide-react'
import { useRetornos } from '@/hooks/useStock'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import type { RetornoResumo } from '@/types/stock'
import { cn } from '@/lib/cn'

/** Devoluções e Trocas — sempre ligadas à venda/encomenda original. */
export function RetornosLista() {
  const [tipo, setTipo] = useState<'' | 'devolucao' | 'troca'>('')
  const [rascunho, setRascunho] = useState('')
  const [pesquisa, setPesquisa] = useState('')
  const { data, isLoading } = useRetornos({ tipo: tipo || undefined, pesquisa: pesquisa || undefined })

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-7">
      <Link to="/vendas" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-text">
        <ArrowLeft className="size-3.5" /> Vendas
      </Link>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <RotateCcw className="size-5 text-muted" /> Devoluções e Trocas
          {data && <span className="text-sm font-normal text-subtle">({data.length})</span>}
        </h1>
        <ExportarBotoes
          tamanho="sm"
          nomeFicheiro="devolucoes-trocas"
          titulo="Devoluções e Trocas"
          colunas={[
            { titulo: 'Nº', valor: (r: RetornoResumo) => `#${r.id}` },
            { titulo: 'Tipo', valor: (r) => (r.tipo === 'troca' ? 'Troca' : 'Devolução') },
            { titulo: 'Venda', valor: (r) => `#${r.pedido_id} (${r.pedido_origem === 'pos' ? 'POS' : 'Portal'})` },
            { titulo: 'Cliente', valor: (r) => r.cliente_nome },
            { titulo: 'Unidades', valor: (r) => r.total_unidades },
            { titulo: 'Reembolso (Kz)', valor: (r) => r.valor_reembolso },
            { titulo: 'Motivo', valor: (r) => r.motivo },
            { titulo: 'Registado por', valor: (r) => r.registado_por_nome ?? '—' },
            { titulo: 'Data', valor: (r) => new Date(r.created_at).toLocaleString('pt-PT') },
          ]}
          linhas={data ?? []}
        />
      </div>

      <Card className="mb-4 flex flex-wrap items-center gap-2 p-4">
        <form onSubmit={(e) => { e.preventDefault(); setPesquisa(rascunho) }} className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
          <input value={rascunho} onChange={(e) => setRascunho(e.target.value)} placeholder="Nº da venda, cliente ou Nº SIGECA…"
            className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]" />
        </form>
        {([['', 'Todas'], ['devolucao', 'Devoluções'], ['troca', 'Trocas']] as const).map(([v, r]) => (
          <button key={v || 'todas'} onClick={() => setTipo(v)}
            className={cn('rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition', tipo === v ? 'bg-[#111827] text-white' : 'bg-bg text-muted hover:bg-border')}>
            {r}
          </button>
        ))}
      </Card>

      <p className="mb-3 text-[12px] text-subtle">
        Para registar uma devolução ou troca, abre a venda em <Link to="/vendas" className="underline">Vendas</Link> ou a encomenda em <Link to="/produtos/encomendas" className="underline">Encomendas</Link> e usa "Devolver / Trocar".
      </p>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3.5 py-2.5 font-medium">Nº</th>
              <th className="px-3.5 py-2.5 font-medium">Tipo</th>
              <th className="px-3.5 py-2.5 font-medium">Venda</th>
              <th className="px-3.5 py-2.5 font-medium">Cliente</th>
              <th className="px-3.5 py-2.5 text-right font-medium">Unid.</th>
              <th className="px-3.5 py-2.5 text-right font-medium">Reembolso</th>
              <th className="px-3.5 py-2.5 font-medium">Motivo</th>
              <th className="px-3.5 py-2.5 font-medium">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!isLoading && (data ?? []).length === 0 && <tr><td colSpan={8} className="py-10 text-center text-subtle">Sem devoluções nem trocas.</td></tr>}
            {data?.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-bg">
                <td className="px-3.5 py-2.5 font-mono text-muted">#{r.id}</td>
                <td className="px-3.5 py-2.5">
                  <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', r.tipo === 'troca' ? 'bg-badge-violet-bg text-badge-violet-text' : 'bg-badge-blue-bg text-badge-blue-text')}>
                    {r.tipo === 'troca' ? 'Troca' : 'Devolução'}
                  </span>
                </td>
                <td className="px-3.5 py-2.5 text-muted">#{r.pedido_id} · {r.pedido_origem === 'pos' ? 'POS' : 'Portal'}</td>
                <td className="px-3.5 py-2.5"><p className="font-medium text-text">{r.cliente_nome}</p><p className="font-mono text-[11px] text-subtle">{r.cliente_codigo}</p></td>
                <td className="px-3.5 py-2.5 text-right font-mono">{r.total_unidades}</td>
                <td className="px-3.5 py-2.5 text-right font-mono">{r.valor_reembolso ? `${r.valor_reembolso.toLocaleString('pt-PT')} Kz` : '—'}</td>
                <td className="px-3.5 py-2.5 text-muted">{r.motivo}</td>
                <td className="px-3.5 py-2.5 text-muted">{new Date(r.created_at).toLocaleString('pt-PT')}<span className="block text-[11px] text-subtle">{r.registado_por_nome}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
