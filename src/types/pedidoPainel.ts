export type StatusPedido = 'pendente' | 'aguardando_pagamento' | 'pago' | 'enviado' | 'entregue' | 'cancelado'
export type StatusLinha = 'PENDENTE' | 'CONFIRMADO' | 'ENTREGUE'

export interface ObservacoesPedido {
  metodo_pagamento?: string
  referencia_pagamento?: string
  comprovativo?: string
  tipo_entrega?: 'levantamento' | 'domicilio'
  zona_entrega?: string | null
  municipio?: string | null
  bairro?: string | null
  referencia_morada?: string | null
  telefone?: string | null
}

export interface ItemPedidoPainel {
  id: number
  pedido_id: number
  produto_id: number
  quantidade: number
  preco_unitario: string
  subtotal: string
  status: StatusLinha
  tamanho: string | null
  cor: string | null
  produto_nome: string
  produto_imagem: string | null
}

export interface PedidoPainel {
  id: number
  status: StatusPedido
  total: string
  observacoes: ObservacoesPedido | null
  pdf_recibo: string | null
  pedido_em: string
  entrega_em: string | null
  utilizador_id: number
  utilizador_nome: string
  codigo_associado: string
  utilizador_telefone: string | null
  itens: ItemPedidoPainel[]
}

export interface FiltrosPedidos {
  status?: StatusPedido | ''
}
