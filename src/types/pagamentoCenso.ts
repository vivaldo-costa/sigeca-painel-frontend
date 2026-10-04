export type EstadoPagamentoCenso = 'pendente' | 'validado' | 'rejeitado'

export interface PagamentoCensoPainel {
  id: number
  periodo_censo_id: number
  periodo_titulo: string
  valor_por_membro: string
  diocese_id: number | null
  diocese_nome: string | null
  agrupamentos_nomes: string | null
  valor_total: string
  num_membros: number
  comprovativo_path: string | null
  comprovativo_nome: string | null
  estado: EstadoPagamentoCenso
  motivo_rejeicao: string | null
  submetido_por: number | null
  submetido_por_nome: string | null
  validado_por: number | null
  validado_por_nome: string | null
  validado_em: string | null
  created_at: string
}

export interface MembroPagamentoCenso {
  id: number
  utilizador_id: number
  nome: string
  codigo_associado: string
}

export interface AgrupamentoPagamentoCenso {
  id: number
  agrupamento_id: number
  nome: string
  ab_agrupamento: string
}

export interface PagamentoCensoDetalhe extends PagamentoCensoPainel {
  membros: MembroPagamentoCenso[]
  agrupamentos: AgrupamentoPagamentoCenso[]
}
