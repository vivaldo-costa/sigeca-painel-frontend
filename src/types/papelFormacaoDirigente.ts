export type PapelFormacaoDirigente =
  | 'assistente_paroco' | 'coordenacao_vicarial' | 'equipa_formacao_diocesana'
  | 'coordenacao_diocesana' | 'secretariado_nacional_recurso_adulto' | 'coordenacao_nacional'

export interface PapelFormacaoPainel {
  id: number
  utilizador_id: number
  nome: string
  codigo_associado: string
  papel: PapelFormacaoDirigente
  diocese_id: number | null
  diocese_nome: string | null
  vigararia_id: number | null
  vigararia_nome: string | null
  paroquia_id: number | null
  paroquia_nome: string | null
  created_at: string
}

export const PAPEIS_FORMACAO: { valor: PapelFormacaoDirigente; label: string; territorio: 'paroquia' | 'vigararia' | 'diocese' | 'nacional' }[] = [
  { valor: 'assistente_paroco', label: 'Assistente / Pároco', territorio: 'paroquia' },
  { valor: 'coordenacao_vicarial', label: 'Coordenação Vicarial', territorio: 'vigararia' },
  { valor: 'equipa_formacao_diocesana', label: 'Equipa de Formação Diocesana', territorio: 'diocese' },
  { valor: 'coordenacao_diocesana', label: 'Coordenação Diocesana', territorio: 'diocese' },
  { valor: 'secretariado_nacional_recurso_adulto', label: 'Secretariado Nacional de Recursos de Adultos', territorio: 'nacional' },
  { valor: 'coordenacao_nacional', label: 'Coordenação Nacional', territorio: 'nacional' },
]
