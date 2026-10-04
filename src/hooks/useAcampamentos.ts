import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { EventoResumo, EventoDetalhe, EventoFormPayload } from '@/types/acampamento'

export function useAcampamentos(pesquisa: string, estadoEvento: string) {
  return useQuery({
    queryKey: ['painel-acampamentos', pesquisa, estadoEvento],
    queryFn: async () => {
      const { data } = await api.get<{ dados: EventoResumo[] }>('/acampamentos', { params: { pesquisa, estado_evento: estadoEvento } })
      return data.dados
    },
  })
}

export function useAcampamento(id: number | undefined) {
  return useQuery({
    queryKey: ['painel-acampamento', id],
    queryFn: async () => {
      const { data } = await api.get<{ dados: EventoDetalhe }>(`/acampamentos/${id}`)
      return data.dados
    },
    enabled: id !== undefined,
  })
}

export function useCriarAcampamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: EventoFormPayload) => {
      const { data } = await api.post('/acampamentos', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-acampamentos'] }),
  })
}

export function useAtualizarAcampamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: EventoFormPayload }) => {
      const { data } = await api.put(`/acampamentos/${id}`, payload)
      return data
    },
    onSuccess: (_d, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['painel-acampamentos'] })
      queryClient.invalidateQueries({ queryKey: ['painel-acampamento', id] })
    },
  })
}

export function useMudarEstadoEvento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, estado_evento }: { id: number; estado_evento: string }) => {
      const { data } = await api.patch(`/acampamentos/${id}/estado`, { estado_evento })
      return data
    },
    onSuccess: (_d, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['painel-acampamentos'] })
      queryClient.invalidateQueries({ queryKey: ['painel-acampamento', id] })
    },
  })
}

export function useAdicionarDocumentoEvento(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ ficheiro, tipo }: { ficheiro: File; tipo: string }) => {
      const form = new FormData()
      form.append('ficheiro', ficheiro)
      form.append('tipo', tipo)
      const { data } = await api.post(`/acampamentos/${atividadeId}/documentos`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-acampamento', atividadeId] }),
  })
}

export function useRemoverDocumentoEvento(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (documentoId: number) => {
      const { data } = await api.delete(`/acampamentos/documentos/${documentoId}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-acampamento', atividadeId] }),
  })
}
