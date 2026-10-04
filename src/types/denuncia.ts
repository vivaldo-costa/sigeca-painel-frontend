export type EstadoDenuncia = 'nova' | 'em_analise' | 'resolvida' | 'encerrada'

export interface DenunciaPainel {
  id: number
  tipo: string
  descricao: string
  anonimo: number
  denunciante_id: number | null
  denunciante_nome: string | null
  denunciante_codigo: string | null
  associado_id: number | null
  associado_nome: string | null
  associado_codigo: string | null
  anexo_path: string | null
  anexo_nome: string | null
  estado: EstadoDenuncia
  atribuido_a: number | null
  atribuido_a_nome: string | null
  created_at: string
  updated_at: string
}

export interface HistoricoDenuncia {
  id: number
  estado_anterior: EstadoDenuncia | null
  estado_novo: EstadoDenuncia
  nota: string | null
  utilizador_nome: string | null
  created_at: string
}

export interface DenunciaDetalhe extends DenunciaPainel {
  historico: HistoricoDenuncia[]
}

export interface MinhaDenuncia {
  id: number
  tipo: string
  descricao: string
  estado: EstadoDenuncia
  created_at: string
  updated_at: string
}
