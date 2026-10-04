import { useMemo, useState, type ReactNode } from 'react'
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export interface Coluna<T> {
  chave: string
  titulo: string
  render: (item: T) => ReactNode
  largura?: string
  /** Valor em texto/número para PDF/Excel — quando ausente, usa `item[chave]` directamente (só funciona se `render` não transformar o valor). */
  valorExportacao?: (item: T) => string | number
}

/** Converte as colunas da DataTable (que rendem JSX) nas colunas de texto que a exportação PDF/Excel precisa. */
export function paraColunasExportacao<T>(colunas: Coluna<T>[]) {
  return colunas.map((c) => ({
    titulo: c.titulo,
    valor: c.valorExportacao ?? ((item: T) => {
      const v = (item as Record<string, unknown>)[c.chave]
      return v === null || v === undefined ? '—' : String(v)
    }),
  }))
}

interface Props<T> {
  itens: T[] | undefined
  isLoading: boolean
  colunas: Coluna<T>[]
  filtros: { chave: string; label: string }[]
  /** Extrai o texto pesquisável de um item para um dado filtro (ex.: nome, cidade). */
  valorFiltro: (item: T, chave: string) => string
  acoes: (item: T) => ReactNode
  porPagina?: number
  vazioTexto?: string
}

/**
 * Tabela genérica reutilizada pelos 5 módulos de estrutura: filtros de texto
 * por coluna (client-side, tal como o `aplicarFiltros()` do painel actual),
 * paginação de 20 em 20, e uma coluna de acções fixa à direita.
 */
export function DataTable<T>({
  itens, isLoading, colunas, filtros, valorFiltro, acoes, porPagina = 20, vazioTexto = 'Nenhum registo encontrado.',
}: Props<T>) {
  const [valores, setValores] = useState<Record<string, string>>({})
  const [pagina, setPagina] = useState(1)

  const filtrados = useMemo(() => {
    if (!itens) return []
    return itens.filter((item) =>
      filtros.every(({ chave }) => {
        const filtro = (valores[chave] ?? '').toLowerCase().trim()
        if (!filtro) return true
        return valorFiltro(item, chave).toLowerCase().includes(filtro)
      })
    )
  }, [itens, valores, filtros, valorFiltro])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina))
  const paginaActual = Math.min(pagina, totalPaginas)
  const visiveis = filtrados.slice((paginaActual - 1) * porPagina, paginaActual * porPagina)

  function actualizarFiltro(chave: string, valor: string) {
    setValores((v) => ({ ...v, [chave]: valor }))
    setPagina(1)
  }

  return (
    <div className="space-y-4">
      {filtros.length > 0 && (
        <Card className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtros.map((f) => (
            <div key={f.chave} className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
              <input
                value={valores[f.chave] ?? ''}
                onChange={(e) => actualizarFiltro(f.chave, e.target.value)}
                placeholder={f.label}
                className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]"
              />
            </div>
          ))}
        </Card>
      )}

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
            <tr>
              {colunas.map((c) => (
                <th key={c.chave} className="whitespace-nowrap px-3.5 py-2.5 font-medium" style={{ width: c.largura }}>
                  {c.titulo}
                </th>
              ))}
              <th className="sticky right-0 bg-bg px-3.5 py-2.5 text-center font-medium">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr>
                <td colSpan={colunas.length + 1} className="py-12 text-center text-subtle">
                  <Loader2 className="mx-auto size-5 animate-spin" />
                </td>
              </tr>
            )}
            {!isLoading && visiveis.length === 0 && (
              <tr>
                <td colSpan={colunas.length + 1} className="py-12 text-center text-subtle">{vazioTexto}</td>
              </tr>
            )}
            {!isLoading &&
              visiveis.map((item, i) => (
                <tr key={i} className="hover:bg-bg">
                  {colunas.map((c) => (
                    <td key={c.chave} className="whitespace-nowrap px-3.5 py-2.5 text-text">
                      {c.render(item)}
                    </td>
                  ))}
                  <td className="sticky right-0 bg-white px-3.5 py-2.5">
                    <div className="flex items-center justify-center gap-2">{acoes(item)}</div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </Card>

      {filtrados.length > 0 && (
        <div className="flex items-center justify-between text-[12.5px] text-muted">
          <span>
            {filtrados.length} registo{filtrados.length !== 1 && 's'} · página {paginaActual} de {totalPaginas}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={paginaActual <= 1}
              className="grid size-8 place-items-center rounded-lg border border-border bg-white transition hover:bg-bg disabled:opacity-40"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual >= totalPaginas}
              className="grid size-8 place-items-center rounded-lg border border-border bg-white transition hover:bg-bg disabled:opacity-40"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
