import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ProgramaItem } from '@/types/eventoCampo'

export function useEventoPrograma(atividadeId: number) {
  return useQuery({
    queryKey: ['painel-evento-programa', atividadeId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: ProgramaItem[] }>(`/acampamentos/${atividadeId}/programa`)
      return data.dados
    },
  })
}

export function useCriarItemPrograma(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { data: string; hora_inicio: string; hora_fim: string; titulo: string; local: string; ramo: string; capacidade: string; materiais: string }) => {
      const { data } = await api.post(`/acampamentos/${atividadeId}/programa`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-evento-programa', atividadeId] }),
  })
}

export function useRemoverItemPrograma(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/acampamentos/programa/${id}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-evento-programa', atividadeId] }),
  })
}
