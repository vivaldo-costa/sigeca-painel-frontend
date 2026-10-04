import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  totalSelecionado: number
  todosOsResultados: boolean
  todosDaPaginaSelecionados: boolean
  totalGeral: number
  totalNaPagina: number
  onSelecionarTodosOsResultados: () => void
  onLimpar: () => void
  children?: ReactNode
}

/**
 * Barra que aparece por cima da tabela assim que há pelo menos um item
 * seleccionado — mostra quantos estão seleccionados, oferece "seleccionar
 * todos os N resultados" quando a página inteira já está marcada e há
 * mais páginas, e dá espaço (`children`) para os botões de acção em
 * massa da secção 2.4.
 */
export function SelecaoMultiplaBar({
  totalSelecionado, todosOsResultados, todosDaPaginaSelecionados, totalGeral, totalNaPagina,
  onSelecionarTodosOsResultados, onLimpar, children,
}: Props) {
  if (totalSelecionado === 0) return null

  const podeOferecerTodos = todosDaPaginaSelecionados && !todosOsResultados && totalGeral > totalNaPagina

  return (
    <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg bg-[#111827] px-4 py-2.5 text-white">
      <span className="text-[12.5px] font-medium">
        {totalSelecionado} seleccionado{totalSelecionado !== 1 && 's'}
        {todosOsResultados && ' (todos os resultados)'}
      </span>

      {podeOferecerTodos && (
        <button onClick={onSelecionarTodosOsResultados} className="text-[12.5px] font-medium underline underline-offset-2 hover:no-underline">
          Seleccionar todos os {totalGeral} resultados
        </button>
      )}

      <div className="ml-auto flex items-center gap-2">
        {children}
        <button onClick={onLimpar} className="flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-white/80 hover:bg-white/10 hover:text-white">
          <X className="size-3.5" /> Limpar
        </button>
      </div>
    </div>
  )
}
