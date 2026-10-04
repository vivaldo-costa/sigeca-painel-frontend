export interface EventoComissaoPainel {
  id: number
  nome: string
  coordenador_id: number | null
  coordenador_nome: string | null
  orcamento: number
  total_membros: number
  tarefas_pendentes: number
  created_at: string
}

export interface ComissaoMembro {
  id: number
  utilizador_id: number
  nome: string
  codigo_associado: string
  funcao: string | null
}

export type EstadoTarefa = 'pendente' | 'em_curso' | 'concluida'

export interface ComissaoTarefa {
  id: number
  titulo: string
  descricao: string | null
  responsavel_id: number | null
  responsavel_nome: string | null
  prazo: string | null
  estado: EstadoTarefa
  created_at: string
}

export interface ComissaoDocumento {
  id: number
  nome_ficheiro: string
  path: string
  enviado_por: number | null
  enviado_por_nome: string | null
  created_at: string
}

export const COMISSOES_SUGERIDAS = [
  'Coordenação-Geral', 'Secretaria', 'Finanças', 'Programa', 'Logística', 'Alimentação',
  'Saúde', 'Segurança', 'Transportes', 'Alojamento', 'Comunicação', 'Protocolo',
  'Ambiente e Saneamento', 'Espiritualidade',
]
