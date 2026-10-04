export type TipoZona =
  | 'subcampo' | 'cozinha' | 'secretaria' | 'posto_medico' | 'agua' | 'saneamento'
  | 'atividades' | 'emergencia' | 'estacionamento' | 'alojamento' | 'transporte'

export interface EventoZonaPainel {
  id: number
  tipo: TipoZona
  nome: string
  capacidade: number | null
  responsavel_id: number | null
  responsavel_nome: string | null
  descricao: string | null
  detalhes: Record<string, string> | null
  total_ocupantes: number
  created_at: string
}

export interface ZonaOcupante {
  id: number
  inscricao_id: number
  nome: string
  codigo_associado: string
}

export const TIPOS_ZONA: { valor: TipoZona; label: string }[] = [
  { valor: 'subcampo', label: 'Subcampo' },
  { valor: 'cozinha', label: 'Cozinha' },
  { valor: 'secretaria', label: 'Secretaria' },
  { valor: 'posto_medico', label: 'Posto Médico' },
  { valor: 'agua', label: 'Água' },
  { valor: 'saneamento', label: 'Saneamento' },
  { valor: 'atividades', label: 'Actividades' },
  { valor: 'emergencia', label: 'Emergência' },
  { valor: 'estacionamento', label: 'Estacionamento' },
  { valor: 'alojamento', label: 'Alojamento' },
  { valor: 'transporte', label: 'Transporte' },
]
