import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import type { Paginacao } from '@/types/utilizador'

interface Props {
  paginacao: Paginacao | undefined
  onMudarPagina: (pagina: number) => void
}

export function PaginacaoServidor({ paginacao, onMudarPagina }: Props) {
  if (!paginacao || paginacao.total === 0) return null
  const { pagina, totalPaginas, total, porPagina } = paginacao
  const inicio = (pagina - 1) * porPagina + 1
  const fim = Math.min(pagina * porPagina, total)

  return (
    <div className="flex items-center justify-between text-[12.5px] text-muted">
      <span>
        {inicio.toLocaleString('pt-PT')}–{fim.toLocaleString('pt-PT')} de {total.toLocaleString('pt-PT')}
      </span>
      <div className="flex gap-1">
        <BotaoPagina onClick={() => onMudarPagina(1)} disabled={pagina <= 1} icon={ChevronsLeft} />
        <BotaoPagina onClick={() => onMudarPagina(pagina - 1)} disabled={pagina <= 1} icon={ChevronLeft} />
        <span className="flex items-center px-3 font-medium text-text">
          {pagina} / {totalPaginas}
        </span>
        <BotaoPagina onClick={() => onMudarPagina(pagina + 1)} disabled={pagina >= totalPaginas} icon={ChevronRight} />
        <BotaoPagina onClick={() => onMudarPagina(totalPaginas)} disabled={pagina >= totalPaginas} icon={ChevronsRight} />
      </div>
    </div>
  )
}

function BotaoPagina({ onClick, disabled, icon: Icon }: { onClick: () => void; disabled: boolean; icon: typeof ChevronLeft }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="grid size-8 place-items-center rounded-lg border border-border bg-white transition hover:bg-bg disabled:opacity-40"
    >
      <Icon className="size-3.5" />
    </button>
  )
}
