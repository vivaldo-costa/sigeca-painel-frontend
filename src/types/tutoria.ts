export type EstadoPrazo = 'dentro_do_prazo' | 'proximo_do_prazo' | 'prazo_ultrapassado' | 'concluida'
export type DecisaoTutoria = 'validado' | 'devolvido' | 'nao_validado'

export const LABEL_ESTADO_PRAZO: Record<EstadoPrazo, string> = {
  dentro_do_prazo: 'Dentro do prazo',
  proximo_do_prazo: 'Próximo do prazo',
  prazo_ultrapassado: 'Prazo ultrapassado',
  concluida: 'Concluída',
}

export const COR_ESTADO_PRAZO: Record<EstadoPrazo, string> = {
  dentro_do_prazo: 'bg-badge-green-bg text-badge-green-text',
  proximo_do_prazo: 'bg-badge-orange-bg text-badge-orange-text',
  prazo_ultrapassado: 'bg-badge-red-bg text-badge-red-text',
  concluida: 'bg-bg text-subtle',
}

export interface TutoriaResumo {
  id: number
  candidato_id: number
  nome: string
  codigo_associado: string
  estado_candidato: string
  tutor_id: number
  tutor_nome: string
  diocese_id: number
  diocese_nome: string
  data_inicio: string
  data_prevista_conclusao: string
  data_conclusao_real: string | null
  dias_decorridos: number
  dias_restantes: number
  estado_prazo: EstadoPrazo
}

export interface TutoriaDocumento {
  id: number
  nome_ficheiro: string
  path: string
  enviado_por_nome: string
  created_at: string
}

export interface TutoriaRelatorio {
  id: number
  checklist: Record<string, boolean>
  relatorio_texto: string
  submetido_em: string
}

export interface TutoriaValidacao {
  id: number
  decisao: DecisaoTutoria
  motivo: string | null
  utilizador_nome: string
  created_at: string
}

export interface TutoriaDetalhe extends TutoriaResumo {
  matriz_diagnostica: string | null
  ppde: string | null
  documentos: TutoriaDocumento[]
  relatorio: TutoriaRelatorio | null
  validacoes: TutoriaValidacao[]
}

export const CRITERIOS_RELATORIO_TUTORIA = [
  { chave: 'reuniao1', label: '1ª reunião realizada' },
  { chave: 'reuniao2', label: '2ª reunião realizada' },
  { chave: 'reuniao3', label: '3ª reunião realizada' },
  { chave: 'observacao_pratica', label: 'Observação prática realizada' },
  { chave: 'compromissos_cumpridos', label: 'Cumprimento dos compromissos' },
]
