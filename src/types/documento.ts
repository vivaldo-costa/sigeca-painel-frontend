export type EstadoDocumento = 'pendente' | 'gerado' | 'cancelado'

export interface DocumentoOficial {
  id: number
  codigo_associado: string
  utilizador_id: number | null
  atividade_id: number
  data_inicio: string
  data_fim: string
  entidade_empregadora: string | null
  nome_utilizador: string | null
  email: string | null
  pdf_path: string | null
  estado: EstadoDocumento
  created_at: string
  atividade_titulo: string | null
}

export interface AtividadeInscrito {
  id: number
  titulo: string
  data_inicio: string
  data_fim: string | null
  local: string | null
  descricao: string | null
}

export interface UtilizadorAtividades {
  utilizador: { id: number; nome: string; email: string | null }
  atividades: AtividadeInscrito[]
}

export interface FiltrosDocumentos {
  pesquisa?: string
  estado?: EstadoDocumento | ''
}

export interface NovoDocumentoPayload {
  codigo_associado: string
  atividade_id: number
  entidade_empregadora: string
}
