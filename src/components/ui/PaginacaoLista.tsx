import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/** Divide uma lista em páginas (em vez de barra de scroll dentro do cartão). */
export function usePaginacao<T>(itens: T[], porPagina: number) {
  const [pagina, setPagina] = useState(1)
  const totalPaginas = Math.max(1, Math.ceil(itens.length / porPagina))

  // Se os dados mudarem (ex.: filtros), volta à primeira página válida.
  useEffect(() => {
    if (pagina > totalPaginas) setPagina(1)
  }, [pagina, totalPaginas])

  const visiveis = useMemo(
    () => itens.slice((pagina - 1) * porPagina, pagina * porPagina),
    [itens, pagina, porPagina],
  )
  return { pagina, setPagina, totalPaginas, visiveis, inicio: (pagina - 1) * porPagina, total: itens.length }
}

interface Props {
  pagina: number
  totalPaginas: number
  total: number
  inicio: number
  porPagina: number
  onMudar: (pagina: number) => void
  className?: string
}

export function PaginacaoLista({ pagina, totalPaginas, total, inicio, porPagina, onMudar, className = '' }: Props) {
  if (totalPaginas <= 1) return null
  const fim = Math.min(inicio + porPagina, total)
  const botao = 'grid size-7 place-items-center rounded-md border border-border text-muted transition hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div className={`flex items-center justify-between gap-2 border-t border-border pt-3 text-[11.5px] text-subtle ${className}`}>
      <span>{inicio + 1}–{fim} de {total}</span>
      <div className="flex items-center gap-1.5">
        <button type="button" className={botao} onClick={() => onMudar(pagina - 1)} disabled={pagina <= 1} aria-label="Página anterior">
          <ChevronLeft className="size-3.5" />
        </button>
        <span className="min-w-[52px] text-center font-medium text-text">{pagina} / {totalPaginas}</span>
        <button type="button" className={botao} onClick={() => onMudar(pagina + 1)} disabled={pagina >= totalPaginas} aria-label="Página seguinte">
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
