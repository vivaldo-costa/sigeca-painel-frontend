import { exportarPdfAgrupado, type GrupoPdf } from '@/lib/exportarPdfAgrupado'
import { formatarAgrupamento } from '@/lib/formatadores'
import { LABEL_TIPO_UNIDADE_SECCAO, type TipoUnidadeSeccao } from '@/types/unidadeSeccao'
import type { MembroUnidadeSeccao } from '@/hooks/useUnidadesSeccao'

interface UnidadeParaImprimir {
  tipo: TipoUnidadeSeccao
  nome: string
  membros: MembroUnidadeSeccao[]
}

function nomeFicheiroSeguro(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase()
}

/**
 * PDF "lista de membros" de um ou mais Bandos/Patrulhas/Equipas. Como o nome
 * é partilhado por todos os agrupamentos, cada unidade sai dividida por
 * agrupamento (um bloco por unidade + agrupamento), com Nº, Nome, Código
 * SIGECA e — se algum membro a tiver — Cargo/Função.
 */
export function imprimirUnidadesSeccao(
  unidades: UnidadeParaImprimir[],
  opcoes: { titulo: string; nomeFicheiro: string; subtitulo?: string; incluirVazias?: boolean },
) {
  const temCargo = unidades.some((u) => u.membros.some((m) => m.cargo_funcao))
  const colunas = ['Nº', 'Nome', 'Código SIGECA', ...(temCargo ? ['Cargo/Função'] : [])]

  const grupos: GrupoPdf[] = []
  unidades.forEach((u) => {
    const rotulo = `${LABEL_TIPO_UNIDADE_SECCAO[u.tipo]} ${u.nome}`
    if (u.membros.length === 0) {
      if (opcoes.incluirVazias) {
        grupos.push({ titulo: rotulo, detalhe: `Tipo: ${LABEL_TIPO_UNIDADE_SECCAO[u.tipo]}`, linhas: [], textoVazio: 'Sem membros na tua área.' })
      }
      return
    }
    const porAgrupamento = new Map<string, MembroUnidadeSeccao[]>()
    u.membros.forEach((m) => {
      const chave = m.agrupamento_nome ? formatarAgrupamento({ nome: m.agrupamento_nome, ab_agrupamento: m.ab_agrupamento }) : '—'
      if (!porAgrupamento.has(chave)) porAgrupamento.set(chave, [])
      porAgrupamento.get(chave)!.push(m)
    })
    porAgrupamento.forEach((membros, agrupamento) => {
      const seccoes = [...new Set(membros.map((m) => m.seccao_nome).filter(Boolean))].join(', ') || '—'
      grupos.push({
        titulo: rotulo,
        detalhe: `Tipo: ${LABEL_TIPO_UNIDADE_SECCAO[u.tipo]} · Secção: ${seccoes} · Agrupamento: ${agrupamento}`,
        linhas: membros.map((m, i) => [
          i + 1, m.nome, m.codigo_associado || '—', ...(temCargo ? [m.cargo_funcao || '—'] : []),
        ]),
      })
    })
  })

  exportarPdfAgrupado(nomeFicheiroSeguro(opcoes.nomeFicheiro) || 'lista', opcoes.titulo, colunas, grupos, { subtitulo: opcoes.subtitulo })
}
