export interface ColunaLegado {
  nome: string
  tipo: string
}

export interface TabelaLegado {
  nome: string
  total_linhas: number
  colunas: ColunaLegado[]
}

export interface AnaliseLegado {
  sessao: string
  tabelas: TabelaLegado[]
}

export interface ResultadoImportacaoLegado {
  importadas: string[]
  ignoradas_ja_existentes: string[]
  falhas: { tabela: string; erro: string }[]
}
