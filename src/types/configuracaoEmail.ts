export interface ConfiguracaoEmail {
  id: number
  activo: number
  host: string | null
  porta: number
  seguro: number
  utilizador: string | null
  tem_password: boolean
  remetente_nome: string
  remetente_email: string | null
  reply_to: string | null
  atualizado_por: number | null
  updated_at: string
}

export interface ConfiguracaoEmailPayload {
  activo?: boolean
  host?: string
  porta?: number
  seguro?: boolean
  utilizador?: string
  password?: string
  remetente_nome?: string
  remetente_email?: string
  reply_to?: string
}
