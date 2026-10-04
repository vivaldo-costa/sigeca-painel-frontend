export interface Categoria {
  id: number
  nome: string
  descricao: string | null
  total_produtos: number
}

export interface VariacaoProduto {
  id?: number
  tamanho: string
  cor: string
  stock: number
}

export interface ImagemProduto {
  id: number
  produto_id: number
  imagem: string
  ordem: number
}

export interface ProdutoPainel {
  id: number
  nome: string
  descricao: string | null
  descricao_curta: string | null
  preco: string
  preco_antigo: string | null
  stock: number
  ativo: number
  etiqueta: string | null
  categoria_id: number | null
  categoria_nome: string | null
  imagem: string | null
  created_at: string
  variacoes?: VariacaoProduto[]
  imagens?: ImagemProduto[]
}

export interface FiltrosProdutos {
  pesquisa?: string
  categoriaId?: number
  ativo?: '' | '1' | '0'
}

export interface ProdutoFormPayload {
  nome: string
  descricao: string
  descricao_curta: string
  preco: string
  preco_antigo: string
  stock: string
  ativo: boolean
  etiqueta: string
  categoria_id: number | ''
  variacoes: VariacaoProduto[]
}
