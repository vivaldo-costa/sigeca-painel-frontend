export interface ProgramaItem {
  id: number
  data: string
  hora_inicio: string
  hora_fim: string | null
  titulo: string
  local: string | null
  responsavel_id: number | null
  responsavel_nome: string | null
  ramo: string | null
  capacidade: number | null
  materiais: string | null
}

export interface EventoCredencial {
  id: number
  utilizador_id: number
  nome: string
  codigo_associado: string
  foto: string | null
  token: string
  total_presencas: number
}

export type TipoAcaoQr = 'entrada' | 'saida' | 'material' | 'refeicao' | 'atividade' | 'atendimento_medico' | 'saida_antecipada'

export interface RegistoQr {
  id: number
  tipo_acao: TipoAcaoQr
  zona_id: number | null
  zona_nome: string | null
  detalhes: Record<string, string> | null
  registado_por_nome: string | null
  created_at: string
  nome: string
  codigo_associado: string
}

export const TIPOS_ACAO_QR: { valor: TipoAcaoQr; label: string }[] = [
  { valor: 'entrada', label: 'Entrada' },
  { valor: 'saida', label: 'Saída' },
  { valor: 'material', label: 'Entrega de material' },
  { valor: 'refeicao', label: 'Refeição' },
  { valor: 'atividade', label: 'Presença em actividade' },
  { valor: 'atendimento_medico', label: 'Atendimento médico' },
  { valor: 'saida_antecipada', label: 'Saída antecipada' },
]

export type GravidadeOcorrencia = 'leve' | 'moderada' | 'grave'
export type EstadoOcorrencia = 'aberta' | 'em_acompanhamento' | 'encerrada'

export interface OcorrenciaSaude {
  id: number
  inscricao_id: number
  nome: string
  codigo_associado: string
  tipo: string
  descricao: string | null
  gravidade: GravidadeOcorrencia
  encaminhamento: string | null
  estado: EstadoOcorrencia
  registado_por_nome: string | null
  created_at: string
}
