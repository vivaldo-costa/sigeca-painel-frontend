import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { FormadorPainel, FormadorDetalhe, FormadorFormPayload } from '@/types/formador'

export function useFormadores(pesquisa: string) {
  return useQuery({
    queryKey: ['painel-formadores', pesquisa],
    queryFn: async () => {
      const { data } = await api.get<{ dados: FormadorPainel[] }>('/formadores', { params: { pesquisa } })
      return data.dados
    },
  })
}

export function useFormador(id: number | null) {
  return useQuery({
    queryKey: ['painel-formador', id],
    queryFn: async () => {
      const { data } = await api.get<{ dados: FormadorDetalhe }>(`/formadores/${id}`)
      return data.dados
    },
    enabled: id !== null,
  })
}

export function useCadastrarFormador() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: FormadorFormPayload & { utilizador_id: number }) => {
      const { data } = await api.post('/formadores', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-formadores'] }),
  })
}

export function useAtualizarFormador() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: FormadorFormPayload }) => {
      const { data } = await api.put(`/formadores/${id}`, payload)
      return data
    },
    onSuccess: (_d, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['painel-formadores'] })
      queryClient.invalidateQueries({ queryKey: ['painel-formador', id] })
    },
  })
}

export function useRemoverFormador() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/formadores/${id}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-formadores'] }),
  })
}
