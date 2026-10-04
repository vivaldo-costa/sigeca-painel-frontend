export type EstadoEmail = 'pendente' | 'processando' | 'enviado' | 'erro'

export const LABEL_ESTADO_EMAIL: Record<EstadoEmail, string> = {
  pendente: 'Pendente',
  processando: 'A processar',
  enviado: 'Enviado',
  erro: 'Erro',
}

export const COR_ESTADO_EMAIL: Record<EstadoEmail, string> = {
  pendente: 'bg-bg text-subtle',
  processando: 'bg-badge-blue-bg text-badge-blue-text',
  enviado: 'bg-badge-green-bg text-badge-green-text',
  erro: 'bg-badge-red-bg text-badge-red-text',
}

export interface EntradaHistoricoEmail {
  id: number
  email: string
  nome: string | null
  status: EstadoEmail
  tentativas: number
  data_envio: string | null
  tipo: string
  atividade: string | null
  erro: string | null
  created_at: string
}

export interface FiltrosHistoricoEmail {
  pagina?: number
  porPagina?: number
  status?: string
  tipo?: string
  pesquisa?: string
}
