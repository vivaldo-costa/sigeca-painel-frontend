import { FileText, FileSpreadsheet } from 'lucide-react'
import { exportarExcel, exportarPdf, type ColunaExportacao } from '@/lib/exportar'
import { notificar } from '@/lib/notificar'

interface ExportarBotoesProps<T> {
  nomeFicheiro: string
  titulo: string
  colunas: ColunaExportacao<T>[]
  linhas: T[]
  subtitulo?: string
  /** `sm` para caber ao lado de filtros/paginação já apertados numa lista. */
  tamanho?: 'sm' | 'md'
}

/**
 * Par de botões "Exportar PDF" / "Exportar Excel", reutilizado em todas
 * as listagens do Painel. Recebe as colunas já formatadas (rótulo +
 * como extrair o valor de cada linha) e os dados que a página já tem
 * carregados — não depende de nenhum endpoint novo por módulo.
 */
export function ExportarBotoes<T>({ nomeFicheiro, titulo, colunas, linhas, subtitulo, tamanho = 'md' }: ExportarBotoesProps<T>) {
  const classeBase =
    tamanho === 'sm'
      ? 'flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1.5 text-[11.5px] font-medium text-text hover:bg-bg'
      : 'flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-[12.5px] font-semibold text-text hover:bg-bg'
  const tamanhoIcone = tamanho === 'sm' ? 'size-3' : 'size-3.5'

  function handlePdf() {
    if (linhas.length === 0) { notificar.aviso('Não há dados para exportar.'); return }
    exportarPdf(nomeFicheiro, titulo, colunas, linhas, { subtitulo })
  }

  function handleExcel() {
    if (linhas.length === 0) { notificar.aviso('Não há dados para exportar.'); return }
    exportarExcel(nomeFicheiro, colunas, linhas)
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={handlePdf} className={classeBase} title="Exportar em PDF">
        <FileText className={tamanhoIcone} /> PDF
      </button>
      <button type="button" onClick={handleExcel} className={classeBase} title="Exportar em Excel">
        <FileSpreadsheet className={tamanhoIcone} /> Excel
      </button>
    </div>
  )
}
