export type EstadoCandidato =
  | 'registo_iniciado' | 'em_validacao_paroco' | 'em_aprovacao_vicarial' | 'em_validacao_diocesana'
  | 'devolvido_correcao' | 'rejeitado' | 'validado' | 'na_lista_candidatos' | 'selecionado_turma'
  | 'em_formacao' | 'formacao_concluida_aguardar_tutoria' | 'em_tutoria' | 'tutoria_concluida_relatorio_pendente'
  | 'relatorio_em_validacao' | 'tutoria_validada' | 'certificado_emitido_aguardar_promessa'
  | 'promessa_realizada' | 'processo_formativo_concluido'

export type EtapaValidacao = 'assistente_paroco' | 'coordenacao_vicarial' | 'equipa_formacao_diocesana'
export type DecisaoValidacao = 'validado' | 'devolvido' | 'rejeitado'
export type TipoDocumentoCandidato = 'parecer_direccao_agrupamento' | 'bilhete_identidade' | 'cedula_baptismal' | 'outro'

export interface CandidatoResumo {
  id: number
  utilizador_id: number
  nome: string
  codigo_associado: string
  agrupamento_id: number
  agrupamento_nome: string
  ab_agrupamento?: string | null
  diocese_id: number
  diocese_nome: string
  vigararia_id: number | null
  vigararia_nome: string | null
  formacao_pretendida_id: number
  formacao_nome: string
  estado: EstadoCandidato
  created_at: string
  dias_em_curso: number
}

export interface DocumentoCandidato {
  id: number
  tipo: TipoDocumentoCandidato
  nome_ficheiro: string
  path: string
  enviado_por_nome: string | null
  created_at: string
}

export interface ValidacaoCandidato {
  id: number
  etapa: EtapaValidacao
  decisao: DecisaoValidacao
  checklist: Record<string, boolean> | null
  observacoes: string | null
  motivo: string | null
  utilizador_nome: string
  created_at: string
}

export interface TermoEtica {
  aceite: number
  aceite_em: string | null
  versao_termo: string
}

export interface PromessaDirigente {
  id: number
  data_promessa: string
  local: string
  responsavel_id: number
  responsavel_nome: string
  observacoes: string | null
  documento_evidencia_path: string | null
  created_at: string
}

export interface CandidatoDetalhe extends CandidatoResumo {
  paroquia_id: number | null
  paroquia_nome: string | null
  parecer_direccao_agrupamento: number
  certificado_id: number | null
  documentos: DocumentoCandidato[]
  validacoes: ValidacaoCandidato[]
  termo_etica: TermoEtica | null
  promessa?: PromessaDirigente | null
}

export const LABEL_ESTADO_CANDIDATO: Record<EstadoCandidato, string> = {
  registo_iniciado: 'Registo Iniciado',
  em_validacao_paroco: 'Em Validação — Assistente/Pároco',
  em_aprovacao_vicarial: 'Em Aprovação — Coordenação Vicarial',
  em_validacao_diocesana: 'Em Validação — Equipa de Formação Diocesana',
  devolvido_correcao: 'Devolvido para Correcção',
  rejeitado: 'Rejeitado',
  validado: 'Validado',
  na_lista_candidatos: 'Na Lista de Candidatos',
  selecionado_turma: 'Seleccionado para Turma',
  em_formacao: 'Em Formação',
  formacao_concluida_aguardar_tutoria: 'Formação Concluída — a Aguardar Tutoria',
  em_tutoria: 'Em Tutoria',
  tutoria_concluida_relatorio_pendente: 'Tutoria Concluída — Relatório Pendente',
  relatorio_em_validacao: 'Relatório em Validação',
  tutoria_validada: 'Tutoria Validada',
  certificado_emitido_aguardar_promessa: 'Certificado Emitido — a Aguardar Promessa',
  promessa_realizada: 'Promessa Realizada',
  processo_formativo_concluido: 'Processo Formativo Concluído',
}

export const LABEL_ETAPA: Record<EtapaValidacao, string> = {
  assistente_paroco: 'Assistente/Pároco',
  coordenacao_vicarial: 'Coordenação Vicarial',
  equipa_formacao_diocesana: 'Equipa de Formação Diocesana',
}

export const ETAPA_POR_ESTADO: Partial<Record<EstadoCandidato, EtapaValidacao>> = {
  em_validacao_paroco: 'assistente_paroco',
  em_aprovacao_vicarial: 'coordenacao_vicarial',
  em_validacao_diocesana: 'equipa_formacao_diocesana',
}

export const CHECKLIST_PADRAO: { chave: string; label: string }[] = [
  { chave: 'dados_pessoais', label: 'Dados pessoais preenchidos correctamente' },
  { chave: 'documentacao', label: 'Documentação obrigatória disponível' },
  { chave: 'parecer_direccao', label: 'Parecer da Direcção do Agrupamento' },
  { chave: 'pertence_agrupamento', label: 'Candidato pertence ao Agrupamento' },
  { chave: 'diocese_vigararia', label: 'Diocese/Vigararia correctamente identificada' },
  { chave: 'requisitos_formacao', label: 'Requisitos para a formação cumpridos' },
]
