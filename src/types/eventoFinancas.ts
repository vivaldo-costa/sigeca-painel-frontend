export interface EventoRubrica {
  id: number
  nome: string
  valor_previsto: number
  valor_realizado: number
}

export type EstadoDespesa = 'previsto' | 'comprometido' | 'pago'

export interface EventoDespesa {
  id: number
  rubrica_id: number | null
  rubrica_nome: string | null
  descricao: string
  valor: number
  fornecedor: string | null
  documento_path: string | null
  estado: EstadoDespesa
  registado_por: number | null
  registado_por_nome: string | null
  created_at: string
}

export type EstadoReceita = 'pendente' | 'validado'

export interface EventoReceita {
  id: number
  delegacao_id: number | null
  agrupamento_id: number | null
  agrupamento_nome: string | null
  ab_agrupamento?: string | null
  descricao: string
  valor: number
  comprovativo_path: string | null
  estado: EstadoReceita
  registado_por: number | null
  registado_por_nome: string | null
  validado_por: number | null
  validado_por_nome: string | null
  created_at: string
  pagamento_id: number | null
  utilizador_id: number | null
  metodo: string | null
  data_receita: string | null
}

export interface ResumoFinancasEvento {
  total_previsto: number
  total_despesas: number
  total_pago: number
  total_receitas: number
  total_estornado: number
  receitas_liquidas: number
  saldo: number
  inscritos: number
  pagos: number
  pendentes: number
}

export type MetodoPagamentoEvento = 'transferencia' | 'numerario' | 'multicaixa' | 'outro'
export type EstadoPagamentoEvento = 'pendente' | 'confirmado' | 'estornado' | 'rejeitado'

export const LABEL_METODO_PAGAMENTO: Record<MetodoPagamentoEvento, string> = {
  transferencia: 'Transferência',
  numerario: 'Numerário',
  multicaixa: 'Multicaixa',
  outro: 'Outro',
}

export interface EventoPagamento {
  id: number
  inscricao_id: number
  valor: number
  metodo: MetodoPagamentoEvento
  estado: EstadoPagamentoEvento
  data_pagamento: string | null
  comprovativo_path: string | null
  registado_por_nome: string | null
  confirmado_por_nome: string | null
  confirmado_em: string | null
  motivo_rejeicao?: string | null
  rejeitado_por_nome?: string | null
  rejeitado_em?: string | null
  created_at: string
}

export interface EventoEstorno {
  id: number
  receita_id: number
  valor: number
  motivo: string
  registado_por_nome: string | null
  created_at: string
}
