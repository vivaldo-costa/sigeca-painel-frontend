import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface GrupoPdf {
  /** Título do grupo (ex.: "Patrulha Águia"). */
  titulo: string
  /** Linha de detalhe por baixo do título (ex.: "Secção: … · Agrupamento: …"). */
  detalhe?: string
  /** Linhas da tabela, já formatadas, pela ordem de `colunas`. */
  linhas: (string | number)[][]
  /** Texto mostrado no lugar da tabela quando `linhas` está vazio. */
  textoVazio?: string
}

/**
 * Variante agrupada do `exportarPdf` (lib/exportar.ts): o mesmo cabeçalho
 * institucional, mas com uma tabela por grupo, cada uma com o seu título —
 * para listas do tipo "unidade → membros", que não cabem numa tabela plana.
 */
export function exportarPdfAgrupado(
  nomeFicheiro: string,
  titulo: string,
  colunas: string[],
  grupos: GrupoPdf[],
  opcoes?: { subtitulo?: string },
) {
  const doc = new jsPDF({ orientation: colunas.length > 5 ? 'landscape' : 'portrait', unit: 'pt' })
  const largura = doc.internal.pageSize.getWidth()
  const altura = doc.internal.pageSize.getHeight()
  const margem = 32

  doc.setFillColor(11, 31, 77)
  doc.rect(0, 0, largura, 56, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('SIGECA — Associação de Escuteiros Católicos de Angola', margem, 24)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10.5)
  doc.text(titulo, margem, 40)

  doc.setTextColor(20, 20, 20)
  doc.setFontSize(9)
  doc.text(`Emitido em: ${new Date().toLocaleString('pt-PT')}`, margem, 72)
  if (opcoes?.subtitulo) doc.text(opcoes.subtitulo, margem, 86)
  const totalLinhas = grupos.reduce((n, g) => n + g.linhas.length, 0)
  doc.text(`Total de registos: ${totalLinhas}`, largura - margem, 72, { align: 'right' })

  let y = opcoes?.subtitulo ? 104 : 92

  grupos.forEach((grupo) => {
    // Título + detalhe + (pelo menos) o cabeçalho e uma linha da tabela têm de caber — senão começa noutra página.
    if (y + 70 > altura - 40) { doc.addPage(); y = 40 }

    doc.setFillColor(235, 239, 247)
    doc.rect(margem, y - 12, largura - margem * 2, grupo.detalhe ? 32 : 20, 'F')
    doc.setTextColor(11, 31, 77)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(grupo.titulo, margem + 6, y + 2)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(70, 70, 70)
    doc.text(`${grupo.linhas.length} membro(s)`, largura - margem - 6, y + 2, { align: 'right' })
    if (grupo.detalhe) doc.text(grupo.detalhe, margem + 6, y + 14)
    y += grupo.detalhe ? 26 : 14

    if (grupo.linhas.length === 0) {
      doc.setFontSize(9)
      doc.setTextColor(120, 120, 120)
      doc.text(grupo.textoVazio ?? 'Sem registos.', margem + 6, y + 10)
      y += 30
      return
    }

    autoTable(doc, {
      startY: y,
      head: [colunas],
      body: grupo.linhas.map((l) => l.map((c) => String(c))),
      headStyles: { fillColor: [11, 31, 77], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 251] },
      styles: { fontSize: 8.5, cellPadding: 4.5 },
      // Coluna "Nº" (a primeira) estreita — o resto reparte a largura.
      columnStyles: colunas[0] === 'Nº' ? { 0: { cellWidth: 30 } } : undefined,
      margin: { left: margem, right: margem, top: 40 },
    })
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 26
  })

  // Rodapé só no fim, para o "de N" ser o total real de páginas.
  const paginas = doc.getNumberOfPages()
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text(`Página ${i} de ${paginas}`, largura - margem, altura - 16, { align: 'right' })
  }

  doc.save(`${nomeFicheiro}.pdf`)
}
