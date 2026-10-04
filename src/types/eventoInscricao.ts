export type EstadoInscricaoEvento =
  | 'rascunho' | 'submetida' | 'em_verificacao' | 'aguardando_pagamento'
  | 'confirmada' | 'lista_espera' | 'rejeitada' | 'cancelada' | 'presenca_registada'

export interface EventoDelegacao {
  id: number
  agrupamento_id: number
  agrupamento_nome: string
  ab_agrupamento?: string | null
  chefe_responsavel_id: number
  chefe_nome: string
  estado: 'rascunho' | 'submetida'
  created_at: string
  total_inscritos: number
}

export interface EventoInscricaoResumo {
  id: number
  utilizador_id: number
  nome: string
  codigo_associado: string
  funcao: string | null
  seccao_id: number | null
  estado: EstadoInscricaoEvento
  motivo: string | null
  created_at: string
  updated_at: string
  tem_dados_participante: boolean
}

export interface HistoricoInscricaoEvento {
  id: number
  estado_anterior: EstadoInscricaoEvento | null
  estado_novo: EstadoInscricaoEvento
  nota: string | null
  utilizador_nome: string | null
  created_at: string
}

export interface EventoInscricaoDetalhe extends EventoInscricaoResumo {
  atividade_id: number
  historico: HistoricoInscricaoEvento[]
}

export interface DadosParticipante {
  contacto_emergencia_nome: string | null
  contacto_emergencia_telefone: string | null
  restricoes_alimentares: string | null
  alergias: string | null
  doencas_cronicas: string | null
  medicacao: string | null
  necessidades_especiais: string | null
  transporte: string | null
}

export const ESTADOS_INSCRICAO_EVENTO: EstadoInscricaoEvento[] = [
  'rascunho', 'submetida', 'em_verificacao', 'aguardando_pagamento',
  'confirmada', 'lista_espera', 'rejeitada', 'cancelada', 'presenca_registada',
]

export const LABEL_ESTADO_INSCRICAO: Record<EstadoInscricaoEvento, string> = {
  rascunho: 'Rascunho', submetida: 'Submetida', em_verificacao: 'Em verificação',
  aguardando_pagamento: 'A aguardar pagamento', confirmada: 'Confirmada', lista_espera: 'Lista de espera',
  rejeitada: 'Rejeitada', cancelada: 'Cancelada', presenca_registada: 'Presença registada',
}
