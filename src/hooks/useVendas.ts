import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { VendaResumo, VendaDetalhe, ItemVendaListagem } from '@/types/venda'

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
      itens: { produto_id: number; variacao_id?: number; quantidade: number; tamanho?: string | null; cor?: string | null }[]
    }) => {
      const { data } = await api.post<{ dados: VendaDetalhe; mensagem: string }>('/vendas', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-vendas'] })
      queryClient.invalidateQueries({ queryKey: ['painel-produtos'] })
      ;['stock-inventario', 'stock-variantes', 'stock-movimentos', 'stock-resumo'].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }))
    },
  })
}

export interface FiltrosItensVenda {
  produto_id?: number
  tamanho?: string
  diocese_id?: number
  agrupamento_id?: number
  origem?: '' | 'pos' | 'portal'
  status?: string
  por_entregar?: boolean
  pesquisa?: string
  data_inicio?: string
  data_fim?: string
}

/** Listagem por artigo — cada linha um artigo vendido, com comprador, contacto, diocese e agrupamento. */
export function useItensVenda(filtros: FiltrosItensVenda) {
  return useQuery({
    queryKey: ['painel-vendas-itens', filtros],
    queryFn: async () => {
      const { data } = await api.get<{ dados: ItemVendaListagem[]; limite: number }>('/vendas/itens', { params: filtros })
      return data
    },
  })
}

/** Agrupamentos de uma diocese (ordem numérica). */
export function useAgrupamentosDaDiocese(dioceseId?: number) {
  return useQuery({
    queryKey: ['painel-agrupamentos-diocese', dioceseId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: { id: number; nome: string; ab_agrupamento: string | null }[] }>('/filtros/agrupamentos', { params: { diocese: dioceseId } })
      return data.dados
    },
    enabled: !!dioceseId,
  })
}
