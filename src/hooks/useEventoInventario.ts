import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { EventoInventarioItem } from '@/types/eventoInventario'

export function useEventoInventario(atividadeId: number) {
  return useQuery({
    queryKey: ['painel-evento-inventario', atividadeId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: EventoInventarioItem[] }>(`/acampamentos/${atividadeId}/inventario`)
      return data.dados
    },
  })
}

export function useCriarItemInventario(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { nome: string; quantidade_necessaria: string; quantidade_disponivel: string; estado: string; localizacao: string }) => {
      const { data } = await api.post(`/acampamentos/${atividadeId}/inventario`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-evento-inventario', atividadeId] }),
  })
}

export function useAtualizarItemInventario(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number; nome: string; quantidade_necessaria: number; quantidade_disponivel: number; estado: string; localizacao: string | null; observacoes: string | null }) => {
      const { data } = await api.put(`/acampamentos/${atividadeId}/inventario/${id}`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-evento-inventario', atividadeId] }),
  })
}

export function useRemoverItemInventario(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/acampamentos/${atividadeId}/inventario/${id}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-evento-inventario', atividadeId] }),
  })
}
