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
  nome: string
  quantidade: number
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
  nome: string
  preco: number
  quantidade: number
  stock: number
  tamanho?: string | null
  cor?: string | null
}

export const METODOS_PAGAMENTO = ['Dinheiro', 'Transferência', 'TPA/Multicaixa', 'Outro']
