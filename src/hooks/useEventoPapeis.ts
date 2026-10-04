import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { EventoPapelPainel, PapelEvento } from '@/types/eventoPapel'

export function useEventoPapeis(atividadeId: number) {
  return useQuery({
    queryKey: ['painel-evento-papeis', atividadeId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: EventoPapelPainel[] }>(`/acampamentos/${atividadeId}/papeis`)
      return data.dados
    },
  })
}

export function useAtribuirPapel(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ utilizador_id, papel }: { utilizador_id: number; papel: PapelEvento }) => {
      const { data } = await api.post(`/acampamentos/${atividadeId}/papeis`, { utilizador_id, papel })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-evento-papeis', atividadeId] }),
  })
}

export function useRemoverPapel(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/acampamentos/papeis/${id}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-evento-papeis', atividadeId] }),
  })
}
