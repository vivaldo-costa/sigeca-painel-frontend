export type CategoriaFormacao = 'formacao_inicial' | 'formacao_especifica' | 'formacao_continua' | 'seminario' | 'formacao_complementar'

export interface ItemCatalogo {
  id: number
  categoria: CategoriaFormacao
  nome: string
  descricao: string | null
  carga_horaria: number | null
  publico_alvo: string | null
  ativo: number
  minimo_participantes: number | null
  maximo_participantes: number | null
  total_cursos: number
  created_at: string
  pre_requisito_id: number | null
  pre_requisito_nome: string | null
}

export interface ItemCatalogoFormPayload {
  categoria: CategoriaFormacao
  nome: string
  descricao: string
  carga_horaria: string
  publico_alvo: string
  ativo: boolean
  minimo_participantes: string
  maximo_participantes: string
  pre_requisito_id: number | ''
}

export const CATEGORIAS_FORMACAO: { valor: CategoriaFormacao; label: string }[] = [
  { valor: 'formacao_inicial', label: 'Formação Inicial' },
  { valor: 'formacao_especifica', label: 'Formação Específica' },
  { valor: 'formacao_continua', label: 'Formação Contínua' },
  { valor: 'seminario', label: 'Seminário' },
  { valor: 'formacao_complementar', label: 'Formação Complementar' },
]
