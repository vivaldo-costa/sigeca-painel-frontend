export interface FaqPainel {
  id: number
  pergunta: string
  resposta: string
  ativo: number
  created_at: string
}

export interface FaqFormPayload {
  pergunta: string
  resposta: string
  ativo: boolean
}
