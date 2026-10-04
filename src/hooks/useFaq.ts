import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { FaqPainel, FaqFormPayload } from '@/types/faq'

export function useFaqs() {
  return useQuery({
    queryKey: ['painel-faq'],
    queryFn: async () => {
      const { data } = await api.get<{ dados: FaqPainel[] }>('/faq')
      return data.dados
    },
  })
}

export function useCriarFaq() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: FaqFormPayload) => {
      const { data } = await api.post('/faq', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-faq'] }),
  })
}

export function useAtualizarFaq() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: FaqFormPayload }) => {
      const { data } = await api.put(`/faq/${id}`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-faq'] }),
  })
}

export function useRemoverFaq() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/faq/${id}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-faq'] }),
  })
}
