export type EstadoStock = 'DISPONIVEL' | 'STOCK_BAIXO' | 'ESGOTADO'

export interface LinhaInventario {
  variacao_id: number
  sku: string | null
  tamanho: string | null
  cor: string | null
  modelo: string | null
  padrao: number
  ativo: number
  preco: number
  produto_id: number
  produto_nome: string
  produto_imagem: string | null
  produto_ativo: number
  categoria_nome: string | null
  stock_fisico: number
  stock_reservado: number
  stock_disponivel: number
  stock_minimo: number
  estado: EstadoStock
}

export type TipoMovimento =
  | 'ENTRADA' | 'SAIDA' | 'VENDA' | 'RESERVA' | 'LIBERTACAO_RESERVA'
  | 'DEVOLUCAO' | 'TROCA_ENTRADA' | 'TROCA_SAIDA' | 'AJUSTE_ENTRADA' | 'AJUSTE_SAIDA'

export interface MovimentoStock {
  id: number
  variacao_id: number
  produto_id: number
  produto_nome: string
  sku: string | null
  tamanho: string | null
  cor: string | null
  tipo: TipoMovimento
  quantidade: number
  fisico_antes: number
  fisico_depois: number
  reservado_antes: number
  reservado_depois: number
  origem: string
  referencia_tipo: string | null
  referencia_id: number | null
  operacao: string | null
  motivo: string | null
  observacao: string | null
  utilizador_nome: string | null
  created_at: string
}

export interface ResumoLoja {
  fisico: number
  reservado: number
  disponivel: number
  variantes_sem_stock: number
  variantes_stock_baixo: number
  produtos_sem_stock: number
  produtos_stock_baixo: number
  encomendas_pendentes: number
  encomendas_prontas: number
  vendas_hoje: number
  valor_vendas_hoje: number
  devolucoes_30d: number
  trocas_30d: number
}

export interface RetornoResumo {
  id: number
  tipo: 'devolucao' | 'troca'
  pedido_id: number
  motivo: string
  observacoes: string | null
  valor_reembolso: number
  created_at: string
  pedido_origem: 'portal' | 'pos'
  cliente_nome: string
  cliente_codigo: string
  registado_por_nome: string | null
  total_unidades: number
}

export interface VendaParaRetorno {
  id: number
  status: string
  estado_stock: string
  origem: 'portal' | 'pos'
  total: number
  pedido_em: string
  cliente_nome: string
  cliente_codigo: string
  pode_devolver: boolean
  itens: {
    id: number
    produto_id: number
    variacao_id: number | null
    sku: string | null
    produto_nome: string
    tamanho: string | null
    cor: string | null
    quantidade: number
    quantidade_devolvida: number
    quantidade_disponivel_retorno: number
    preco_unitario: number
  }[]
}

export const TIPO_MOVIMENTO_LABEL: Record<TipoMovimento, string> = {
  ENTRADA: 'Entrada',
  SAIDA: 'Saída',
  VENDA: 'Venda',
  RESERVA: 'Reserva',
  LIBERTACAO_RESERVA: 'Libertação de reserva',
  DEVOLUCAO: 'Devolução',
  TROCA_ENTRADA: 'Troca (entrada)',
  TROCA_SAIDA: 'Troca (saída)',
  AJUSTE_ENTRADA: 'Ajuste (entrada)',
  AJUSTE_SAIDA: 'Ajuste (saída)',
}

export const ESTADO_STOCK_LABEL: Record<EstadoStock, string> = {
  DISPONIVEL: 'Disponível',
  STOCK_BAIXO: 'Stock baixo',
  ESGOTADO: 'Esgotado',
}

export function descreverVariante(l: { produto_nome?: string; tamanho?: string | null; cor?: string | null; modelo?: string | null }) {
  const partes = [l.tamanho, l.cor, l.modelo].filter(Boolean)
  return partes.length ? partes.join(' / ') : 'Único'
}
