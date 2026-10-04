import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { EventoZonaPainel, ZonaOcupante, TipoZona } from '@/types/eventoZona'

export function useEventoZonas(atividadeId: number, tipo?: string) {
  return useQuery({
    queryKey: ['painel-evento-zonas', atividadeId, tipo],
    queryFn: async () => {
      const { data } = await api.get<{ dados: EventoZonaPainel[] }>(`/acampamentos/${atividadeId}/zonas`, { params: { tipo } })
      return data.dados
    },
  })
}

export function useCriarZona(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { tipo: TipoZona; nome: string; capacidade: string; descricao: string; detalhes?: Record<string, string> }) => {
      const { data } = await api.post(`/acampamentos/${atividadeId}/zonas`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-evento-zonas', atividadeId] }),
  })
}

export function useRemoverZona(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/acampamentos/zonas/${id}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-evento-zonas', atividadeId] }),
  })
}

export function useZonaOcupantes(zonaId: number | null) {
  return useQuery({
    queryKey: ['painel-zona-ocupantes', zonaId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: ZonaOcupante[] }>(`/acampamentos/zonas/${zonaId}/ocupantes`)
      return data.dados
    },
    enabled: zonaId !== null,
  })
}

export function useAdicionarOcupanteZona(zonaId: number, atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (inscricao_id: number) => {
      const { data } = await api.post(`/acampamentos/zonas/${zonaId}/ocupantes`, { inscricao_id })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-zona-ocupantes', zonaId] })
      queryClient.invalidateQueries({ queryKey: ['painel-evento-zonas', atividadeId] })
    },
  })
}

export function useRemoverOcupanteZona(zonaId: number, atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/acampamentos/zonas/ocupantes/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-zona-ocupantes', zonaId] })
      queryClient.invalidateQueries({ queryKey: ['painel-evento-zonas', atividadeId] })
    },
  })
}
