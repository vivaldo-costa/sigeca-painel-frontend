export interface IndicadoresEvento {
  titulo: string
  total_inscritos: number
  confirmados: number
  desistencias: number
  lista_espera: number
  presentes: number
  taxa_ocupacao: number | null
  taxa_confirmacao: number
  taxa_desistencia: number
  taxa_presenca: number
  receita_total: number
  despesa_total: number
  saldo: number
  custo_por_participante: number
  receita_por_participante: number
  participacao_por_agrupamento: { agrupamento_nome: string; ab_agrupamento?: string | null; total_confirmados: number }[]
  cumprimento_tarefas_por_comissao: { comissao_nome: string; total_tarefas: number; tarefas_concluidas: number }[]
}
