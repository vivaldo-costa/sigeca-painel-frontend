export type Refeicao = 'pequeno_almoco' | 'almoco' | 'lanche' | 'jantar' | 'ceia'

export interface EventoEmenta {
  id: number
  data: string
  refeicao: Refeicao
  descricao: string
  custo_estimado: number | null
}

export interface DietaEspecial {
  nome: string
  codigo_associado: string
  agrupamento_nome: string
  ab_agrupamento?: string | null
  restricoes_alimentares: string | null
  alergias: string | null
}

export const REFEICOES: { valor: Refeicao; label: string }[] = [
  { valor: 'pequeno_almoco', label: 'Pequeno-almoço' },
  { valor: 'almoco', label: 'Almoço' },
  { valor: 'lanche', label: 'Lanche' },
  { valor: 'jantar', label: 'Jantar' },
  { valor: 'ceia', label: 'Ceia' },
]
