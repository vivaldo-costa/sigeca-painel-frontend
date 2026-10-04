export interface CensoPeriodo {
  id: number
  titulo: string
  data_inicio: string
  data_fim: string
  valor_por_membro: string
  ativo: number
  created_at: string
  total_respostas: number
  total_submetidas: number
}

export type EstadoRespostaCenso = 'por_preencher' | 'rascunho' | 'submetido'

export interface CensoRespostaResumo {
  agrupamento_id: number
  agrupamento_nome: string
  ab_agrupamento: string
  resposta_id: number | null
  num_dirigentes: number | null
  num_candidatos: number | null
  contagem_seccoes: Record<string, number> | null
  observacoes: string | null
  estado: EstadoRespostaCenso
  submetido_em: string | null
  respondido_por_nome: string | null
}

export interface CensoRespostaFormPayload {
  num_dirigentes: number
  num_candidatos: number
  contagem_seccoes: Record<string, number>
  observacoes: string
  estado: 'rascunho' | 'submetido'
}

export interface CensoPeriodoFormPayload {
  titulo: string
  data_inicio: string
  data_fim: string
  valor_por_membro: string
  ativo: boolean
}
