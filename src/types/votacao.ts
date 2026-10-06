export interface VotacaoPainel {
  id: number
  titulo: string
  descricao: string | null
  data_inicio: string | null
  data_fim: string | null
  ativo: number
  imagem: string | null
  imagens?: string[]
  created_at: string
}

export interface VotacaoFormPayload {
  titulo: string
  descricao: string
  data_inicio: string
  data_fim: string
  ativo: boolean
  /** Fotos adicionais já existentes que se mantêm */
  imagens_manter?: string[]
  /** Novas fotos adicionais a carregar */
  imagens_novas?: File[]
}
