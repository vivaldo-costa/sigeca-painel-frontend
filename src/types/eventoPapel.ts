export type PapelEvento =
  | 'administrador_nacional' | 'coordenacao_nacional' | 'coordenacao_diocesana' | 'coordenacao_vigarial'
  | 'chefe_agrupamento' | 'director_acampamento' | 'coordenador_comissao' | 'tesoureiro'
  | 'equipa_saude' | 'secretaria' | 'participante' | 'encarregado_educacao'

export interface EventoPapelPainel {
  id: number
  utilizador_id: number
  nome: string
  codigo_associado: string
  papel: PapelEvento
  comissao_id: number | null
  atribuido_por: number | null
  atribuido_por_nome: string | null
  created_at: string
}

export const PAPEIS_EVENTO: { valor: PapelEvento; label: string }[] = [
  { valor: 'administrador_nacional', label: 'Administrador Nacional' },
  { valor: 'coordenacao_nacional', label: 'Coordenação Nacional' },
  { valor: 'coordenacao_diocesana', label: 'Coordenação Diocesana' },
  { valor: 'coordenacao_vigarial', label: 'Coordenação Vicarial' },
  { valor: 'chefe_agrupamento', label: 'Chefe de Agrupamento' },
  { valor: 'director_acampamento', label: 'Director do Acampamento' },
  { valor: 'coordenador_comissao', label: 'Coordenador de Comissão' },
  { valor: 'tesoureiro', label: 'Tesoureiro' },
  { valor: 'equipa_saude', label: 'Equipa de Saúde' },
  { valor: 'secretaria', label: 'Secretaria' },
  { valor: 'participante', label: 'Participante' },
  { valor: 'encarregado_educacao', label: 'Encarregado de Educação' },
]
