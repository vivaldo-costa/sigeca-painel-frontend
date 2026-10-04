export interface EmailTemplate {
  id: number
  chave: string
  nome_exibicao: string
  assunto: string
  corpo_html: string
  variaveis_disponiveis: string | null
  activo: number
  atualizado_por: number | null
  created_at: string
  updated_at: string
}

export interface EmailTemplatePayload {
  assunto: string
  corpo_html: string
  activo: boolean
}
