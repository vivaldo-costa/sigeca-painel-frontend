export interface FormadorPainel {
  id: number
  utilizador_id: number
  nome: string
  codigo_associado: string
  especialidades: string | null
  certificacoes: string | null
  ativo: number
  total_cursos: number
  created_at: string
  responsavel_formacao_diocese?: number
  diocese_id?: number | null
  diocese_nome?: string | null
}

export interface CursoDoFormador {
  id: number
  titulo: string
  data_inicio: string
  data_fim: string | null
  ativo: number
  papel: string | null
}

export interface FormadorDetalhe extends FormadorPainel {
  biografia: string | null
  cursos: CursoDoFormador[]
}

export interface FormadorFormPayload {
  especialidades: string
  certificacoes: string
  biografia: string
  ativo: boolean
  responsavel_formacao_diocese: boolean
  diocese_id: number | null
}
