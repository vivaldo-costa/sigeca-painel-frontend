export type EstadoTurma =
  | 'em_constituicao' | 'submetida_autorizacao' | 'devolvida_correcao' | 'nao_autorizada' | 'autorizada'
  | 'em_preparacao' | 'em_realizacao' | 'realizada' | 'em_encerramento' | 'encerrada'

export type PapelFormador = 'coordenador' | 'formador' | 'outro'
export type TipoDocumentoTurma = 'programa_formacao' | 'nota_pagamento' | 'lista_presenca' | 'ficha_avaliacao_geral' | 'avaliacao_formadores' | 'outro'
export type DecisaoAutorizacao = 'autorizar' | 'devolver_correcao' | 'nao_autorizar'

export const LABEL_ESTADO_TURMA: Record<EstadoTurma, string> = {
  em_constituicao: 'Em Constituição',
  submetida_autorizacao: 'Submetida para Autorização',
  devolvida_correcao: 'Devolvida para Correcção',
  nao_autorizada: 'Não Autorizada',
  autorizada: 'Autorizada',
  em_preparacao: 'Em Preparação',
  em_realizacao: 'Em Realização',
  realizada: 'Realizada',
  em_encerramento: 'Em Encerramento',
  encerrada: 'Encerrada',
}

export const LABEL_TIPO_DOC_TURMA: Record<TipoDocumentoTurma, string> = {
  programa_formacao: 'Programa da Formação',
  nota_pagamento: 'Nota de Pagamento',
  lista_presenca: 'Lista de Presença',
  ficha_avaliacao_geral: 'Ficha de Avaliação Geral',
  avaliacao_formadores: 'Avaliação dos Formadores',
  outro: 'Outro',
}

export interface TurmaRelatorio {
  id: number
  resumo: string
  participantes_concluintes: number
  observacoes: string | null
  relatorio_path: string | null
  created_at: string
}

export interface TurmaResumo {
  id: number
  codigo: string
  formacao_id: number
  formacao_nome: string
  minimo_participantes: number | null
  maximo_participantes: number | null
  diocese_id: number
  diocese_nome: string
  data_prevista: string | null
  data_inicio: string | null
  data_fim: string | null
  local: string | null
  estado: EstadoTurma
  numero_autorizacao: string | null
  created_at: string
  total_participantes: number
  total_formadores: number
}

export interface TurmaParticipante {
  id: number
  candidato_id: number
  nome: string
  codigo_associado: string
  agrupamento_nome: string
  ab_agrupamento?: string | null
  created_at: string
}

export interface TurmaFormador {
  id: number
  formador_id: number
  papel: PapelFormador
  nome: string
  especialidades: string | null
}

export interface TurmaDocumento {
  id: number
  tipo: TipoDocumentoTurma
  nome_ficheiro: string
  path: string
  enviado_por_nome: string
  created_at: string
}

export interface TurmaAutorizacao {
  id: number
  decisao: DecisaoAutorizacao
  motivo: string | null
  utilizador_nome: string
  created_at: string
}

export interface TurmaDetalhe extends TurmaResumo {
  horario: string | null
  numero_previsto_participantes: number | null
  observacoes: string | null
  declaracao_path: string | null
  participantes: TurmaParticipante[]
  formadores: TurmaFormador[]
  documentos: TurmaDocumento[]
  autorizacoes: TurmaAutorizacao[]
  relatorio: TurmaRelatorio | null
  /** Limite efectivo de participantes: 40, ou o máximo do Catálogo se for menor. */
  limite_participantes?: number
}
