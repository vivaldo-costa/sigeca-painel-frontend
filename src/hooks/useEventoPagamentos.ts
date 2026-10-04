import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { EventoPagamento, MetodoPagamentoEvento } from '@/types/eventoFinancas'

export function useEventoPagamentos(atividadeId: number, inscricaoId: number) {
  return useQuery({
    queryKey: ['painel-evento-pagamentos', inscricaoId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: EventoPagamento[] }>(`/acampamentos/${atividadeId}/inscricoes/${inscricaoId}/pagamentos`)
      return data.dados
    },
  })
}

export function useRegistarPagamento(atividadeId: number, inscricaoId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { valor: string; metodo: MetodoPagamentoEvento; data_pagamento?: string; comprovativo?: File }) => {
      const form = new FormData()
      form.append('valor', payload.valor)
      form.append('metodo', payload.metodo)
      if (payload.data_pagamento) form.append('data_pagamento', payload.data_pagamento)
      if (payload.comprovativo) form.append('comprovativo', payload.comprovativo)
      const { data } = await api.post(`/acampamentos/${atividadeId}/inscricoes/${inscricaoId}/pagamentos`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-evento-pagamentos', inscricaoId] }),
  })
}

export function useConfirmarPagamento(atividadeId: number, inscricaoId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (pagamentoId: number) => {
      const { data } = await api.post(`/acampamentos/pagamentos/${pagamentoId}/confirmar`, {})
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-evento-pagamentos', inscricaoId] })
      queryClient.invalidateQueries({ queryKey: ['painel-evento-receitas', atividadeId] })
      queryClient.invalidateQueries({ queryKey: ['painel-evento-financas-resumo', atividadeId] })
      queryClient.invalidateQueries({ queryKey: ['painel-evento-inscricao', inscricaoId] })
    },
  })
}
