export interface Contadores {
  total_utilizadores: number
  utilizadores_ativos: number
  total_produtos: number
  total_eventos: number
  total_formacoes: number
  total_votacoes: number
  total_agrupamentos: number
  total_vendas: number
}

export interface CrescimentoMensal {
  escuteiros: number
  agrupamentos: number
  actividades: number
  formacoes: number
  vendas: number
}

export interface PontoEvolucao {
  mes: string
  total: number
}

export interface AtividadeRecente {
  id: number
  tipo: 'evento' | 'formacao'
  titulo: string
  local: string | null
  data_inicio: string
  created_at: string
}

export interface SeccaoDist {
  seccao: string
  ordem: number
  seccao_id: number
  total: number
}

export interface ParSeccao {
  seccao_a: string
  seccao_b: string
  id_a?: number
  id_b?: number
}

export interface DiocesePainel {
  diocese: string
  masculino: number
  feminino: number
  total: number
}

export interface VigarariaPainel {
  nome: string
  total: number
}

export interface ParoquiaPainel {
  nome: string
  total: number
}

export interface AgrupamentoPainel {
  nome: string
  ab_agrupamento?: string | null
  total: number
}

export interface MudancaSeccao {
  nome: string
  codigo_associado: string
  idade: number
  secao_atual: string | null
  secao_atual_id: number | null
  equivalencia: string | null
  nova_secao: string
  faixas_nova_secao: string
  total_sugestoes: number
}

export interface AtividadeResumo {
  titulo: string
  total_inscritos: number
}

export interface VotacaoResumo {
  id: number
  titulo: string
  total_votos: number
  opcao_mais_votada: number | null
}

export interface UltimoUtilizador {
  nome: string
  codigo_associado: string
  foto: string | null
  diocese: string | null
  vigararia: string | null
  agrupamento: string | null
  ab_agrupamento?: string | null
  seccao_nome: string | null
}

export interface DashboardPainelData {
  contadores: Contadores
  crescimento: CrescimentoMensal
  evolucao_escuteiros: PontoEvolucao[]
  ultimas_atividades: AtividadeRecente[]
  seccoes: SeccaoDist[]
  seccoes_par: SeccaoDist[]
  pares_seccao: ParSeccao[]
  genero: { masculino: number; feminino: number }
  dioceses: DiocesePainel[]
  mudanca_seccao: MudancaSeccao[]
  equivalencias: { seccao_a: string; seccao_b: string }[]
  vigararias: VigarariaPainel[]
  paroquias: ParoquiaPainel[]
  agrupamentos: AgrupamentoPainel[]
  actividades: AtividadeResumo[]
  formacoes: AtividadeResumo[]
  votacoes: VotacaoResumo[]
  ultimos_utilizadores: UltimoUtilizador[]
  meta: {
    perfil: string
    filtros: Record<string, number | null>
    gerado_em: string
  }
}

export interface FiltrosDashboard {
  diocese?: number
  vigararia?: number
  paroquia?: number
  agrupamento?: number
  seccao?: number
}

export interface OpcaoFiltro {
  id: number
  nome: string
  ab_agrupamento?: string | null
}
