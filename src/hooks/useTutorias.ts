import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { TutoriaResumo, TutoriaDetalhe, DecisaoTutoria } from '@/types/tutoria'

export function useTutorias(filtros: { dioceseId?: number; tutorId?: number; prazo?: string }) {
  return useQuery({
    queryKey: ['painel-tutorias', filtros],
    queryFn: async () => {
      const { data } = await api.get<{ dados: TutoriaResumo[] }>('/tutorias', { params: filtros })
      return data.dados
    },
  })
}

export function useTutoria(id: number | undefined) {
  return useQuery({
    queryKey: ['painel-tutoria', id],
    queryFn: async () => {
      const { data } = await api.get<{ dados: TutoriaDetalhe }>(`/tutorias/${id}`)
      return data.dados
    },
    enabled: id !== undefined,
  })
}

function invalidarTutoria(queryClient: ReturnType<typeof useQueryClient>, id: number) {
  queryClient.invalidateQueries({ queryKey: ['painel-tutoria', id] })
  queryClient.invalidateQueries({ queryKey: ['painel-tutorias'] })
  queryClient.invalidateQueries({ queryKey: ['painel-candidatos-dirigente'] })
}

export function useAtribuirTutor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { candidato_id: number; tutor_id: number; data_inicio: string }) => {
      const { data } = await api.post<{ dados: TutoriaDetalhe }>('/tutorias', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-tutorias'] }),
  })
}

export function useAtualizarAcompanhamento(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { matriz_diagnostica: string; ppde: string }) => {
      const { data } = await api.put(`/tutorias/${id}/acompanhamento`, payload)
      return data
    },
    onSuccess: () => invalidarTutoria(queryClient, id),
  })
}

export function useAdicionarDocumentoTutoria(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ficheiro: File) => {
      const form = new FormData()
      form.append('ficheiro', ficheiro)
      const { data } = await api.post(`/tutorias/${id}/documentos`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      return data
    },
    onSuccess: () => invalidarTutoria(queryClient, id),
  })
}

export function useSubmeterRelatorioTutoria(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { checklist: Record<string, boolean>; relatorio_texto: string }) => {
      const { data } = await api.post(`/tutorias/${id}/relatorio`, payload)
      return data
    },
    onSuccess: () => invalidarTutoria(queryClient, id),
  })
}

export function useDecidirRelatorioTutoria(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { decisao: DecisaoTutoria; motivo?: string }) => {
      const { data } = await api.post(`/tutorias/${id}/validacao`, payload)
      return data
    },
    onSuccess: () => invalidarTutoria(queryClient, id),
  })
}
