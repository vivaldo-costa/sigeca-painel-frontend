import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export interface ColunaExportacao<T> {
  /** Cabeçalho mostrado no PDF/Excel. */
  titulo: string
  /** Extrai o valor da linha — já formatado como o utilizador deve ver (datas, moeda, etc.). */
  valor: (linha: T) => string | number
}

/**
 * Exportação PDF/Excel genérica e reutilizável — usada em todas as
 * listagens do Painel para que o administrador possa sempre extrair os
 * dados que está a consultar, sem depender de um endpoint dedicado por
 * módulo. Corre inteiramente no browser (os dados já estão carregados
 * na página), por isso funciona da mesma forma em qualquer ecrã.
 */
export function exportarExcel<T>(nomeFicheiro: string, colunas: ColunaExportacao<T>[], linhas: T[]) {
  const dados = linhas.map((linha) => {
    const objecto: Record<string, string | number> = {}
    colunas.forEach((coluna) => { objecto[coluna.titulo] = coluna.valor(linha) })
    return objecto
  })
  const folha = XLSX.utils.json_to_sheet(dados)
  folha['!cols'] = colunas.map((c) => ({ wch: Math.max(c.titulo.length + 2, 14) }))
  const livro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(livro, folha, 'Dados')
  XLSX.writeFile(livro, `${nomeFicheiro}.xlsx`)
}

/**
 * PDF "bem estruturado" — cabeçalho institucional, título do relatório,
 * data/hora de emissão e tabela paginada automaticamente — porque um
 * cartão/relatório oficial do SIGECA não pode sair como uma tabela crua.
 */
export function exportarPdf<T>(
  nomeFicheiro: string,
  titulo: string,
  colunas: ColunaExportacao<T>[],
  linhas: T[],
  opcoes?: { subtitulo?: string },
) {
  const doc = new jsPDF({ orientation: colunas.length > 5 ? 'landscape' : 'portrait', unit: 'pt' })
  const largura = doc.internal.pageSize.getWidth()

  doc.setFillColor(11, 31, 77)
  doc.rect(0, 0, largura, 56, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('SIGECA — Associação de Escuteiros Católicos de Angola', 32, 24)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10.5)
  doc.text(titulo, 32, 40)

  doc.setTextColor(20, 20, 20)
  doc.setFontSize(9)
  const emitidoEm = new Date().toLocaleString('pt-PT')
  doc.text(`Emitido em: ${emitidoEm}`, 32, 72)
  if (opcoes?.subtitulo) doc.text(opcoes.subtitulo, 32, 86)
  doc.text(`Total de registos: ${linhas.length}`, largura - 32, 72, { align: 'right' })

  autoTable(doc, {
    startY: opcoes?.subtitulo ? 96 : 84,
    head: [colunas.map((c) => c.titulo)],
    body: linhas.map((linha) => colunas.map((c) => String(c.valor(linha)))),
    headStyles: { fillColor: [11, 31, 77], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 251] },
    styles: { fontSize: 8.5, cellPadding: 5 },
    margin: { left: 32, right: 32 },
    didDrawPage: () => {
      const paginas = doc.getNumberOfPages()
      doc.setFontSize(8)
      doc.setTextColor(120, 120, 120)
      doc.text(
        `Página ${doc.getCurrentPageInfo().pageNumber} de ${paginas}`,
        largura - 32,
        doc.internal.pageSize.getHeight() - 16,
        { align: 'right' },
      )
    },
  })

  doc.save(`${nomeFicheiro}.pdf`)
}
