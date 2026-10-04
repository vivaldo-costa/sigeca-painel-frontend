export type EstadoInventario = 'em_falta' | 'requisitado' | 'disponivel' | 'emprestado' | 'danificado' | 'devolvido'

export interface EventoInventarioItem {
  id: number
  nome: string
  quantidade_necessaria: number
  quantidade_disponivel: number
  estado: EstadoInventario
  responsavel_id: number | null
  responsavel_nome: string | null
  localizacao: string | null
  observacoes: string | null
  created_at: string
}

export const ESTADOS_INVENTARIO: EstadoInventario[] = ['em_falta', 'requisitado', 'disponivel', 'emprestado', 'danificado', 'devolvido']

export const LABEL_ESTADO_INVENTARIO: Record<EstadoInventario, string> = {
  em_falta: 'Em falta', requisitado: 'Requisitado', disponivel: 'Disponível',
  emprestado: 'Emprestado', danificado: 'Danificado', devolvido: 'Devolvido',
}
