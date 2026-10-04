export type NivelTesouraria = 'agrupamento' | 'vigararia' | 'diocese' | 'nacional'
export type TipoMovimentoTesouraria = 'saldo_inicial' | 'entrada' | 'saida'
export type TipoRubrica = 'receita' | 'despesa'

export interface RubricaTesouraria {
  id: number
  tipo: TipoRubrica
  nome: string
  ordem: number
}

export interface MovimentoTesouraria {
  id: number
  nivel: NivelTesouraria
  estrutura_id: number | null
  tipo: TipoMovimentoTesouraria
  rubrica_id: number | null
  rubrica_nome: string | null
  rubrica_tipo: TipoRubrica | null
  seccao: string | null
  valor: string | number
  descricao: string | null
  data_movimento: string
  created_at: string
  criado_por_nome: string | null
}

export interface RelatorioSeccaoTesouraria {
  seccao: string | null
  total_entradas: number
  total_saidas: number
  saldo: number
}

export interface SaldoTesouraria {
  total_entradas: number
  total_saidas: number
  saldo_disponivel: number
  tem_saldo_inicial: boolean
}

export interface NovoMovimentoPayload {
  nivel: NivelTesouraria
  estrutura_id?: number
  rubrica_id?: number
  seccao?: string
  valor: number
  descricao?: string
  data_movimento: string
}

export interface NovoSaldoInicialPayload {
  nivel: NivelTesouraria
  estrutura_id?: number
  valor: number
  descricao?: string
  data_movimento: string
}
