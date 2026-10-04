export type EstadoQuota = 'pendente' | 'pago' | 'isento'

export interface QuotaPainel {
  id: number
  utilizador_id: number
  utilizador_nome: string
  codigo_associado: string
  agrupamento_nome: string | null
  ab_agrupamento?: string | null
  periodo: string
  valor: string
  estado: EstadoQuota
  metodo_pagamento: string | null
  referencia: string | null
  data_pagamento: string | null
  observacoes: string | null
  created_at: string
}

export interface ResumoQuotas {
  total_registos: number
  total_pagos: number
  total_pendentes: number
  total_isentos: number
  total_arrecadado: number
  total_em_falta: number
}

export interface FiltrosQuotas {
  periodo?: string
  estado?: EstadoQuota | ''
  pesquisa?: string
}

export interface QuotaFormPayload {
  codigo_associado: string
  periodo: string
  valor: string
  estado: EstadoQuota
  metodo_pagamento: string
  referencia: string
  data_pagamento: string
  observacoes: string
}
