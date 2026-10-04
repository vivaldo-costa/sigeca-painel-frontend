import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  UtilizadorListagem, FiltrosUtilizadores, Paginacao, UtilizadorFormPayload,
} from '@/types/utilizador'
import type { TimelineEvento } from '@/types/timeline'

interface ListaResposta {
  dados: UtilizadorListagem[]
  paginacao: Paginacao
}

/**
 * GET /api/v1/utilizadores — paginado no servidor (não é viável carregar os
 * ~29 mil registos de uma vez, ao contrário dos módulos de estrutura que
 * usam createCrudHooks + DataTable client-side).
 */
export function useUtilizadores(filtros: FiltrosUtilizadores) {
  return useQuery({
    queryKey: ['painel-utilizadores', filtros],
    queryFn: async () => {
      const { data } = await api.get<ListaResposta>('/utilizadores', { params: filtros })
      return data
    },
    placeholderData: (anterior) => anterior,
  })
}

export function useUtilizador(id: number | undefined) {
  return useQuery({
    queryKey: ['painel-utilizador', id],
    queryFn: async () => {
      const { data } = await api.get<{ dados: UtilizadorListagem }>(`/utilizadores/${id}`)
      return data.dados
    },
    enabled: id !== undefined,
  })
}

export function useHistoricoUtilizador(id: number | undefined) {
  return useQuery({
    queryKey: ['painel-utilizador-historico', id],
    queryFn: async () => {
      const { data } = await api.get<{ dados: { eventos: TimelineEvento[] } }>(`/utilizadores/${id}/historico`)
      return data.dados.eventos
    },
    enabled: id !== undefined,
  })
}

export function useCriarUtilizador() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UtilizadorFormPayload) => {
      const { data } = await api.post('/utilizadores', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-utilizadores'] }),
  })
}

export function useAtualizarUtilizador() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<UtilizadorFormPayload> }) => {
      const { data } = await api.put(`/utilizadores/${id}`, payload)
      return data
    },
    onSuccess: (_d, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['painel-utilizadores'] })
      queryClient.invalidateQueries({ queryKey: ['painel-utilizador', id] })
    },
  })
}

export function useRemoverUtilizador() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/utilizadores/${id}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-utilizadores'] }),
  })
}
