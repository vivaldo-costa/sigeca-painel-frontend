import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { Plus } from 'lucide-react'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import type { ColunaExportacao } from '@/lib/exportar'

interface Props<T = unknown> {
  icon: LucideIcon
  titulo: string
  novoHref: string
  novoLabel?: string
  /** Quando indicado, mostra os botões de exportar PDF/Excel com estes dados. */
  exportar?: { colunas: ColunaExportacao<T>[]; linhas: T[] }
}

export function ListaHeader<T = unknown>({ icon: Icon, titulo, novoHref, novoLabel = 'Adicionar', exportar }: Props<T>) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
        <Icon className="size-5 text-muted" /> {titulo}
      </h1>
      <div className="flex items-center gap-2">
        {exportar && (
          <ExportarBotoes tamanho="sm" nomeFicheiro={titulo.toLowerCase().replace(/\s+/g, '-')} titulo={titulo} colunas={exportar.colunas} linhas={exportar.linhas} />
        )}
        <Link
          to={novoHref}
          className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-black"
        >
          <Plus className="size-3.5" /> {novoLabel}
        </Link>
      </div>
    </div>
  )
}
