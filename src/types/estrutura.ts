export interface Diocese {
  id: number
  nome: string
  bispo: string
  cidade: string | null
  ab_diocese: string
  coordenador: string
  telefone_coordenador: string
  email_coordenador: string
  assistente: string
  telefone_assistente: string
  email_assistente: string
}

export interface Vigararia {
  id: number
  nome: string
  vigario_foraneo: string
  diocese_id: number
  diocese_nome?: string
  coordenador: string
  telefone_coordenador: string | null
  email_coordenador: string | null
  assistente: string | null
  telefone_assistente: string | null
  email_assistente: string | null
  ativa: boolean
  criado_em?: string
}

export interface Paroquia {
  id: number
  nome: string
  paroco: string | null
  telefone: string | null
  email: string | null
  endereco: string | null
  vigararia_id: number
  vigararia_nome?: string
}

export interface Agrupamento {
  id: number
  nome: string
  ab_agrupamento: string
  paroquia_id: number
  paroquia_nome?: string
  vigararia_id?: number
  diocese_id?: number
  diocese_nome?: string
  chefe_agrupamento: string | null
  chefe_telefone: string | null
  chefe_email: string | null
  assistente_espiritual: string | null
  assistente_telefone: string | null
  assistente_email: string | null
  secretario: string | null
  secretario_telefone: string | null
  secretario_email: string | null
  data_fundacao: string | null
}

export interface Seccao {
  id: number
  nome: string
  faixa_minima: number
  faixa_maxima: number
}
