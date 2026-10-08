import type { EstadoCandidato } from './candidatoDirigente'

export interface DashboardFormacaoDirigente {
  candidatos: {
    registados: number
    em_validacao: number
    validados: number
    na_lista_candidatos: number
  }
  turmas: {
    em_constituicao: number
    submetidas: number
    autorizadas: number
    realizadas: number
    encerradas: number
  }
  formacao: {
    candidatos_em_formacao: number
    formacoes_concluidas: number
  }
  tutoria: {
    candidatos_em_tutoria: number
    tutorias_concluidas: number
    relatorios_pendentes: number
    relatorios_em_validacao: number
    tutorias_fora_do_prazo: number
  }
  certificacao: {
    candidatos_aptos: number
    certificados_emitidos: number
  }
  promessa: {
    dirigentes_aguardar_promessa: number
    promessas_realizadas: number
    processos_concluidos: number
  }
  /** Contagem de candidatos por estado — alimenta o funil por etapa. */
  por_estado?: Partial<Record<EstadoCandidato, number>>
}

export interface FiltrosDashboardFormacao {
  dioceseId?: number
  vigarariaId?: number
  agrupamentoId?: number
  formacaoId?: number
  dataInicio?: string
  dataFim?: string
}
