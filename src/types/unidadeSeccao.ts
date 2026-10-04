/**
 * Catálogo global de Bandos / Patrulhas / Equipas — sub-grupos dentro de uma
 * Secção (Alcateia tem "Bandos", Exploradores tem "Patrulhas", Clã/Comunidade
 * tem "Equipas"). Criados por um Agrupamento mas visíveis/reutilizáveis por
 * todos (catálogo partilhado, nomes únicos por `tipo`, case-insensitive).
 */
export type TipoUnidadeSeccao = 'bando' | 'patrulha' | 'equipa'

export interface UnidadeSeccao {
  id: number
  tipo: TipoUnidadeSeccao
  nome: string
  agrupamento_criador_id: number | null
  agrupamento_criador_nome?: string | null
  agrupamento_criador_ab_agrupamento?: string | null
  criado_por: number | null
  criado_por_nome?: string | null
  created_at: string
  total_membros?: number
}

export const LABEL_TIPO_UNIDADE_SECCAO: Record<TipoUnidadeSeccao, string> = {
  bando: 'Bando',
  patrulha: 'Patrulha',
  equipa: 'Equipa',
}
