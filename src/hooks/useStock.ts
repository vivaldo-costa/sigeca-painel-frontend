import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { LinhaInventario, MovimentoStock, ResumoLoja, RetornoResumo, VendaParaRetorno } from '@/types/stock'

export interface FiltrosInventario {
  pesquisa?: string
  sku?: string
  tamanho?: string
  cor?: string
  estado?: string
  produto_id?: number
}

export function useInventario(filtros: FiltrosInventario) {
  return useQuery({
    queryKey: ['stock-inventario', filtros],
    queryFn: async () => {
      const { data } = await api.get<{ dados: LinhaInventario[] }>('/stock/inventario', { params: filtros })
      return data.dados
    },
  })
}

/** Variantes vendáveis (POS / trocas). */
export function useVariantesVenda(pesquisa: string) {
  return useQuery({
    queryKey: ['stock-variantes', pesquisa],
    queryFn: async () => {
      const { data } = await api.get<{ dados: LinhaInventario[] }>('/stock/variantes', { params: { pesquisa } })
      return data.dados
    },
  })
}

export interface FiltrosMovimentos {
  pesquisa?: string
  tipo?: string
  origem?: string
  data_inicio?: string
  data_fim?: string
  variacao_id?: number
  pagina?: number
  por_pagina?: number
}

export function useMovimentos(filtros: FiltrosMovimentos) {
  return useQuery({
    queryKey: ['stock-movimentos', filtros],
    queryFn: async () => {
      const { data } = await api.get<{ dados: MovimentoStock[]; total: number; pagina: number; por_pagina: number }>('/stock/movimentos', { params: filtros })
      return data
    },
  })
}

export function useResumoLoja(ativo = true) {
  return useQuery({
    queryKey: ['stock-resumo'],
    queryFn: async () => {
      const { data } = await api.get<{ dados: ResumoLoja }>('/stock/resumo')
      return data.dados
    },
    enabled: ativo,
  })
}

export function useMotivosAjuste() {
  return useQuery({
    queryKey: ['stock-motivos'],
    queryFn: async () => {
      const { data } = await api.get<{ dados: string[] }>('/stock/motivos-ajuste')
      return data.dados
    },
    staleTime: Infinity,
  })
}

function invalidarStock(queryClient: ReturnType<typeof useQueryClient>) {
  ;['stock-inventario', 'stock-variantes', 'stock-movimentos', 'stock-resumo', 'painel-produtos', 'painel-pedidos', 'painel-vendas', 'vendas-retornos', 'painel-venda']
    .forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }))
}

export function useAjustarStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { variacao_id: number; sentido: 'entrada' | 'saida'; quantidade: number; motivo: string; observacao?: string }) => {
      const { data } = await api.post('/stock/ajustes', payload)
      return data
    },
    onSuccess: () => invalidarStock(queryClient),
  })
}

export function useRetornos(filtros: { tipo?: string; pesquisa?: string }) {
  return useQuery({
    queryKey: ['vendas-retornos', filtros],
    queryFn: async () => {
      const { data } = await api.get<{ dados: RetornoResumo[] }>('/vendas/retornos', { params: filtros })
      return data.dados
    },
  })
}

export function useVendaParaRetorno(pedidoId: number | null) {
  return useQuery({
    queryKey: ['venda-para-retorno', pedidoId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: VendaParaRetorno }>(`/vendas/pedido/${pedidoId}/retorno`)
      return data.dados
    },
    enabled: pedidoId !== null,
  })
}

export function useRegistarRetorno() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      pedido_id: number
      tipo: 'devolucao' | 'troca'
      motivo: string
      observacoes?: string
      itens: { pedido_item_id: number; quantidade: number; nova_variacao_id?: number }[]
    }) => {
      const { data } = await api.post('/vendas/retornos', payload)
      return data
    },
    onSuccess: () => {
      invalidarStock(queryClient)
      queryClient.invalidateQueries({ queryKey: ['venda-para-retorno'] })
    },
  })
}

export { invalidarStock }
