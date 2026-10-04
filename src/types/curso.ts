export interface CursoResumo {
  id: number
  titulo: string
  data_inicio: string
  data_fim: string | null
  local: string | null
  vagas: number | null
  carga_horaria: number | null
  certificacao_automatica: number
  ativo: number
  num_inscritos: number
  catalogo_nome: string | null
  catalogo_categoria: string | null
  total_formadores: number
}

export interface CursoFormadorAtribuido {
  id: number
  formador_id: number
  nome: string
  codigo_associado: string
  papel: string | null
}

export type Aproveitamento = 'aprovado' | 'reprovado' | 'pendente'

export interface CursoAvaliacao {
  id: number
  utilizador_id: number
  nome: string
  codigo_associado: string
  nota: string | null
  aproveitamento: Aproveitamento
  observacoes: string | null
  created_at: string
}

export interface CursoDetalhe extends CursoResumo {
  descricao: string | null
  catalogo_formacao_id: number | null
  formadores: CursoFormadorAtribuido[]
  avaliacoes: CursoAvaliacao[]
}

export interface CursoFormPayload {
  titulo: string
  descricao: string
  local: string
  data_inicio: string
  data_fim: string
  catalogo_formacao_id: number | ''
  carga_horaria: string
  certificacao_automatica: boolean
  vagas: string
  ativo: boolean
}
