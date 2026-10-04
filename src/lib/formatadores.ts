import type { TipoUnidadeSeccao } from '@/types/unidadeSeccao'

/**
 * Formato "025 - Nome do Agrupamento" pedido na secção 2.2 do roteiro —
 * usar sempre que um agrupamento for apresentado (listagens, dropdowns,
 * autocomplete, filtros, inscrições...). Sem código, mostra só o nome,
 * para não aparecer um "— Nome" estranho em registos antigos sem
 * `ab_agrupamento` preenchido.
 */
export function formatarAgrupamento(agrupamento: { nome: string; ab_agrupamento?: string | null }): string {
  return agrupamento.ab_agrupamento ? `${agrupamento.ab_agrupamento} - ${agrupamento.nome}` : agrupamento.nome
}

/**
 * Deduz o `tipo` de unidade de secção (Bando/Patrulha/Equipa) a partir do
 * nome da Secção do associado — heurística "melhor esforço" por não haver
 * uma relação formal Secção → tipo de unidade na BD. Sem correspondência
 * (Secção não definida, ou nome que não bate com nenhum ramo conhecido),
 * devolve `null` e quem chama mostra os três tipos juntos em vez de um só.
 */
export function inferirTipoUnidadeSeccao(seccaoNome: string | null): TipoUnidadeSeccao | null {
  if (!seccaoNome) return null
  const nome = seccaoNome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

  if (nome.includes('alcateia') || nome.includes('castor')) return 'bando'
  if (nome.includes('explorador') || nome.includes('flotilha')) return 'patrulha'
  if (nome.includes('cla') || nome.includes('comunidade') || nome.includes('frota')) return 'equipa'
  return null
}
