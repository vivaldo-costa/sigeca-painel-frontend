export type TipoAtividade = 'evento' | 'formacao'
export type TipoAcesso = 'Pago' | 'Grátis'
export type EstadoInscricao = 'pendente' | 'confirmada' | 'pago' | 'cancelada'

export interface AtividadePainel {
  id: number
  abrangencia?: 'nacional' | 'dioceses'
  dioceses_ids?: number[]
  dioceses_nomes?: string[]
  tipo: TipoAtividade
  titulo: string
  descricao: string | null
  data_inicio: string
  data_fim: string | null
  tipo_acesso: TipoAcesso
  valor: string
  num_prestacoes: number
  idade_minima: number | null
  idade_maxima: number | null
  vagas: number | null
  local: string | null
  imagem: string | null
  ativo: number
  diocese_id: number | null
  seccao_id: number | null
  diocese_nome: string | null
  seccao_nome: string | null
  created_at: string
  total_inscritos: number
  banco?: string | null
  iban?: string | null
  titular_conta?: string | null
}

export interface InscritoAtividade {
  id: number
  utilizador_id: number
  estado: EstadoInscricao
  inscrito_em: string
  nome: string
  codigo_associado: string
  email: string | null
  telefone: string | null
  foto: string | null
}

export interface FiltrosAtividades {
  pesquisa?: string
  ativo?: '' | '1' | '0'
}

export interface FotoGaleriaAtividade {
  id: number
  atividade_id: number
  imagem: string
  legenda: string | null
  ordem: number
  created_at: string
  criado_por_nome: string | null
}

export interface AtividadeFormPayload {
  titulo: string
  descricao: string
  data_inicio: string
  data_fim: string
  tipo_acesso: TipoAcesso
  valor: string
  num_prestacoes: string
  idade_minima: string
  idade_maxima: string
  vagas: string
  local: string
  ativo: boolean
  diocese_id: number | ''
  seccao_id: number | ''
  abrangencia: 'nacional' | 'dioceses'
  dioceses_ids: number[]
  banco: string
  iban: string
  titular_conta: string
}
