export type EstadoTransferencia = 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'CANCELADA'

export interface Transferencia {
  id: number
  escuteiro_id: number
  escuteiro_nome: string
  codigo_associado: string
  agrupamento_origem_id: number | null
  agrupamento_origem_nome: string | null
  agrupamento_origem_ab_agrupamento?: string | null
  agrupamento_destino_id: number
  agrupamento_destino_nome: string
  agrupamento_destino_ab_agrupamento?: string | null
  motivo: string | null
  documento_path: string | null
  documento_nome: string | null
  estado: EstadoTransferencia
  notas_destino: string | null
  solicitado_por: number
  solicitado_por_nome: string
  aprovado_por: number | null
  aprovado_por_nome: string | null
  data_solicitacao: string
  data_decisao: string | null
  created_at: string
}

export interface FiltrosTransferencias {
  pagina?: number
  porPagina?: number
  estado?: EstadoTransferencia | ''
  agrupamentoId?: number
  escuteiroId?: number
}

export interface SolicitarTransferenciaPayload {
  escuteiro_id: number
  agrupamento_destino_id: number
  motivo: string
  documento?: File | null
}
