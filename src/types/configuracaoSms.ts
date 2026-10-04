export interface ConfiguracaoSms {
  id: number
  activo: number
  fornecedor: string
  api_url: string | null
  username: string | null
  tem_api_key: boolean
  remetente: string | null
  atualizado_por: number | null
  updated_at: string
}

export interface ConfiguracaoSmsPayload {
  activo?: boolean
  fornecedor?: string
  api_url?: string
  username?: string
  api_key?: string
  remetente?: string
}
