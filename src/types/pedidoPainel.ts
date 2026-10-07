export type StatusPedido = 'pendente' | 'aguardando_pagamento' | 'pago' | 'pronto' | 'enviado' | 'entregue' | 'cancelado'
/** Rótulos dos estados (o cliente já enviou o comprovativo → "Pagamento em validação"). */
export const STATUS_LABEL: Record<StatusPedido, string> = {
  pendente: 'Pendente',
  aguardando_pagamento: 'Pagamento em validação',
  pago: 'Pago',
  pronto: 'Pronta p/ levantar',
  enviado: 'Enviada',
  entregue: 'Entregue/Levantada',
  cancelado: 'Cancelada',
}
export type EstadoStockPedido = 'nenhum' | 'reservado' | 'baixado' | 'libertado'
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
  variacao_id: number | null
  sku: string | null
  quantidade_devolvida: number
  origem_troca_item_id: number | null
  produto_nome: string
  produto_imagem: string | null
}

export interface PedidoPainel {
  id: number
  status: StatusPedido
  estado_stock: EstadoStockPedido
  origem: 'portal' | 'pos'
  total: string
  observacoes: ObservacoesPedido | null
  levantado_em: string | null
  observacao_entrega?: string | null
  levantamento_nome?: string | null
  levantamento_telefone?: string | null
  cancelado_em: string | null
  metodo_pagamento: string | null
  referencia_pagamento: string | null
  comprovativo: string | null
  tipo_entrega: string | null
  zona_entrega: string | null
  municipio: string | null
  bairro: string | null
  referencia_morada: string | null
  telefone: string | null
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
  origem?: 'portal' | 'pos' | ''
  pesquisa?: string
}
