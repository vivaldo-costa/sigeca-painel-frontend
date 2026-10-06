export interface VendaResumo {
  id: number
  total: number
  status: string
  metodo_pagamento: string | null
  pedido_em: string
  utilizador_id: number
  utilizador_nome: string
  codigo_associado: string
  vendido_por: number | null
  vendido_por_nome: string | null
  total_itens: number
}

export interface VendaItem {
  id: number
  produto_id: number
  variacao_id?: number | null
  sku?: string | null
  nome: string
  quantidade: number
  quantidade_devolvida?: number
  origem_troca_item_id?: number | null
  preco_unitario: number
  subtotal: number
  tamanho: string | null
  cor: string | null
}

export interface VendaDetalhe extends VendaResumo {
  itens: VendaItem[]
}

export interface ItemCarrinhoPos {
  produto_id: number
  variacao_id: number
  sku?: string | null
  nome: string
  preco: number
  quantidade: number
  stock: number
  tamanho?: string | null
  cor?: string | null
}

export const METODOS_PAGAMENTO = ['Dinheiro', 'Transferência', 'TPA/Multicaixa', 'Outro']

export interface ItemVendaListagem {
  id: number
  pedido_id: number
  pedido_em: string
  status: string
  origem: 'pos' | 'portal'
  levantado_em: string | null
  produto_id: number
  produto_nome: string
  sku: string | null
  tamanho: string | null
  cor: string | null
  quantidade: number
  preco_unitario: number
  subtotal: number
  utilizador_id: number
  cliente_nome: string
  codigo_associado: string
  contacto: string | null
  diocese_nome: string | null
  agrupamento_nome: string | null
  ab_agrupamento: string | null
  seccao_nome: string | null
}
