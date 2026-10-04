import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { EventoEmenta, DietaEspecial, Refeicao } from '@/types/eventoAlimentacao'

export function useEventoEmentas(atividadeId: number) {
  return useQuery({
    queryKey: ['painel-evento-ementas', atividadeId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: { ementas: EventoEmenta[]; total_confirmados: number } }>(`/acampamentos/${atividadeId}/ementas`)
      return data.dados
    },
  })
}

export function useCriarEmenta(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { data: string; refeicao: Refeicao; descricao: string; custo_estimado: string }) => {
      const { data } = await api.post(`/acampamentos/${atividadeId}/ementas`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-evento-ementas', atividadeId] }),
  })
}

export function useRemoverEmenta(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/acampamentos/ementas/${id}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-evento-ementas', atividadeId] }),
  })
}

export function useDietasEspeciais(atividadeId: number) {
  return useQuery({
    queryKey: ['painel-evento-dietas', atividadeId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: DietaEspecial[] }>(`/acampamentos/${atividadeId}/dietas-especiais`)
      return data.dados
    },
  })
}
