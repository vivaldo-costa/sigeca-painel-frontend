import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PedidoPainel, FiltrosPedidos, StatusPedido, StatusLinha } from '@/types/pedidoPainel'

export function usePedidosPainel(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ['painel-pedidos', filtros],
    queryFn: async () => {
      const { data } = await api.get<{ dados: PedidoPainel[] }>('/pedidos', { params: filtros })
      return data.dados
    },
  })
}

export function useAtualizarStatusPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status, observacao_entrega }: { id: number; status: StatusPedido; observacao_entrega?: string }) => {
      const { data } = await api.patch(`/pedidos/${id}/status`, { status, observacao_entrega })
      return data
    },
    onSuccess: () => {
      ;['painel-pedidos', 'stock-inventario', 'stock-variantes', 'stock-movimentos', 'stock-resumo', 'painel-produtos']
        .forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }))
    },
  })
}

export function useAtualizarStatusLinha() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ itemId, status }: { itemId: number; status: StatusLinha }) => {
      const { data } = await api.patch(`/pedidos/itens/${itemId}/status`, { status })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-pedidos'] }),
  })
}
