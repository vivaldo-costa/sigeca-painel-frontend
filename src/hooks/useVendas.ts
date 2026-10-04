import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { VendaResumo, VendaDetalhe } from '@/types/venda'

export function useVendas(pesquisa: string) {
  return useQuery({
    queryKey: ['painel-vendas', pesquisa],
    queryFn: async () => {
      const { data } = await api.get<{ dados: VendaResumo[] }>('/vendas', { params: { pesquisa } })
      return data.dados
    },
  })
}

export function useVenda(id: number | null) {
  return useQuery({
    queryKey: ['painel-venda', id],
    queryFn: async () => {
      const { data } = await api.get<{ dados: VendaDetalhe }>(`/vendas/${id}`)
      return data.dados
    },
    enabled: id !== null,
  })
}

export function useCriarVenda() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      utilizador_id: number
      metodo_pagamento: string
      observacoes?: string
      itens: { produto_id: number; quantidade: number; tamanho?: string | null; cor?: string | null }[]
    }) => {
      const { data } = await api.post<{ dados: VendaDetalhe; mensagem: string }>('/vendas', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-vendas'] })
      queryClient.invalidateQueries({ queryKey: ['painel-produtos'] })
    },
  })
}
