import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { QuotaPainel, ResumoQuotas, FiltrosQuotas, QuotaFormPayload } from '@/types/quota'

export function useQuotas(filtros: FiltrosQuotas) {
  return useQuery({
    queryKey: ['painel-quotas', filtros],
    queryFn: async () => {
      const { data } = await api.get<{ dados: QuotaPainel[] }>('/financas', { params: filtros })
      return data.dados
    },
  })
}

export function useResumoQuotas(periodo?: string) {
  return useQuery({
    queryKey: ['painel-quotas-resumo', periodo],
    queryFn: async () => {
      const { data } = await api.get<{ dados: ResumoQuotas }>('/financas/resumo', { params: { periodo } })
      return data.dados
    },
  })
}

export function useCriarQuota() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: QuotaFormPayload) => {
      const { data } = await api.post('/financas', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-quotas'] })
      queryClient.invalidateQueries({ queryKey: ['painel-quotas-resumo'] })
    },
  })
}

export function useAtualizarQuota() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<QuotaFormPayload> }) => {
      const { data } = await api.put(`/financas/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-quotas'] })
      queryClient.invalidateQueries({ queryKey: ['painel-quotas-resumo'] })
    },
  })
}

export function useRemoverQuota() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/financas/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-quotas'] })
      queryClient.invalidateQueries({ queryKey: ['painel-quotas-resumo'] })
    },
  })
}
