export type DestinoNotificacao = 'portal' | 'painel' | 'ambos'
export type LocalExibicao = 'abertura' | 'dashboard' | 'perfil' | 'loja' | 'documentos' | 'actividades'

export interface NotificacaoPainel {
  id: number
  titulo: string | null
  mensagem: string
  destino: DestinoNotificacao
  local_exibicao: LocalExibicao
  global: number
  utilizador_id: number | null
  utilizador_nome: string | null
  ativo: number
  data_inicio: string | null
  data_fim: string | null
  criado_por: number | null
  criado_por_nome: string | null
  created_at: string
}

export interface NotificacaoVisivel {
  id: number
  titulo: string | null
  mensagem: string
  local_exibicao: LocalExibicao
  global: number
  lida: number
  created_at: string
}

export interface NotificacaoFormPayload {
  titulo: string
  mensagem: string
  destino: DestinoNotificacao
  local_exibicao: LocalExibicao
  global: boolean
  utilizador_id: number | ''
  ativo: boolean
  data_inicio: string
  data_fim: string
}
