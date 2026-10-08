export type NivelOrganizador = 'agrupamento' | 'vigararia' | 'diocese' | 'nacional'
export type EstadoEvento = 'preparacao' | 'inscricoes_abertas' | 'em_curso' | 'encerrado' | 'arquivado'

export interface EventoResumo {
  id: number
  titulo: string
  lema: string | null
  local: string | null
  data_inicio: string
  data_fim: string | null
  nivel_organizador: NivelOrganizador | null
  vagas: number | null
  capacidade_minima: number | null
  valor: string
  estado_evento: EstadoEvento
  ativo: number
  director_id: number | null
  director_nome: string | null
  total_delegacoes: number
  total_confirmados: number
}

export interface EventoDocumento {
  id: number
  tipo: string
  nome_ficheiro: string
  path: string
  enviado_por: number | null
  enviado_por_nome: string | null
  created_at: string
}

export interface EventoDetalhe extends Omit<EventoResumo, 'total_delegacoes' | 'total_confirmados'> {
  abrangencia?: 'nacional' | 'dioceses'
  dioceses_ids?: number[]
  dioceses_nomes?: string[]
  descricao: string | null
  nivel_organizador_id: number | null
  prazo_inscricao: string | null
  banco?: string | null
  iban?: string | null
  titular_conta?: string | null
  documentos: EventoDocumento[]
}

export interface EventoFormPayload {
  titulo: string
  lema: string
  descricao: string
  local: string
  data_inicio: string
  data_fim: string
  nivel_organizador: NivelOrganizador | ''
  nivel_organizador_id: number | ''
  prazo_inscricao: string
  vagas: string
  capacidade_minima: string
  valor: string
  director_id: number | ''
  ativo: boolean
  abrangencia: 'nacional' | 'dioceses'
  dioceses_ids: number[]
  banco: string
  iban: string
  titular_conta: string
}

export const ESTADOS_EVENTO: EstadoEvento[] = ['preparacao', 'inscricoes_abertas', 'em_curso', 'encerrado', 'arquivado']
