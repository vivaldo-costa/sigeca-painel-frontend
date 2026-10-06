export interface Categoria {
  id: number
  nome: string
  descricao: string | null
  total_produtos: number
}

export interface VariacaoProduto {
  id?: number
  sku?: string | null
  tamanho: string | null
  cor: string | null
  modelo?: string | null
  /** Preço próprio da variante; vazio = usa o preço do produto. */
  preco?: string | number | null
  /** Stock FÍSICO (só editável como "stock inicial" de variantes novas). */
  stock: number
  stock_fisico?: number
  stock_reservado?: number
  stock_disponivel?: number
  stock_minimo?: number
  ativo?: number | boolean
  padrao?: number
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
  stock_reservado?: number
  stock_disponivel?: number
  total_variantes?: number
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
  /** Stock inicial (só na criação, produtos sem tamanhos/cores). */
  stock: string
  /** SKU e stock mínimo da variante única (produtos sem tamanhos/cores). */
  sku: string
  stock_minimo: string
  ativo: boolean
  etiqueta: string
  categoria_id: number | ''
  variacoes: VariacaoProduto[]
}
