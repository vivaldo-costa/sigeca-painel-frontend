export type NivelInventario = 'sede' | 'diocese' | 'vigararia' | 'agrupamento'
export type EstadoMaterial = 'bom' | 'regular' | 'danificado' | 'inutilizado'
export type TipoMovimentoInventario = 'entrada' | 'saida' | 'transferencia_saida' | 'transferencia_entrada' | 'baixa' | 'ajuste'

export interface ItemInventario {
  id: number
  nivel: NivelInventario
  estrutura_id: number | null
  nome: string
  categoria: string | null
  quantidade: number
  localizacao: string | null
  estado: EstadoMaterial
  observacoes: string | null
  created_at: string
  updated_at: string
}

export interface MovimentoInventario {
  id: number
  item_id: number
  tipo: TipoMovimentoInventario
  quantidade: number
  nivel_destino: NivelInventario | null
  estrutura_destino_id: number | null
  estrutura_destino_nome: string | null
  item_destino_id: number | null
  item_destino_quantidade_actual: number | null
  atividade_id: number | null
  atividade_titulo: string | null
  motivo: string | null
  criado_por_nome: string | null
  created_at: string
}

export interface NovoItemPayload {
  nivel: NivelInventario
  estrutura_id?: number
  nome: string
  categoria?: string
  quantidade?: number
  localizacao?: string
  estado?: EstadoMaterial
  observacoes?: string
}
