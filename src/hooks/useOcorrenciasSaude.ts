import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { OcorrenciaSaude, GravidadeOcorrencia, EstadoOcorrencia } from '@/types/eventoCampo'

export function useOcorrenciasSaude(atividadeId: number) {
  return useQuery({
    queryKey: ['painel-evento-ocorrencias', atividadeId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: OcorrenciaSaude[] }>(`/acampamentos/${atividadeId}/ocorrencias-saude`)
      return data.dados
    },
  })
}

export function useCriarOcorrenciaSaude(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { inscricao_id: number; tipo: string; descricao: string; gravidade: GravidadeOcorrencia }) => {
      const { data } = await api.post(`/acampamentos/${atividadeId}/ocorrencias-saude`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-evento-ocorrencias', atividadeId] }),
  })
}

export function useMudarEstadoOcorrencia(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, estado, encaminhamento }: { id: number; estado: EstadoOcorrencia; encaminhamento?: string }) => {
      const { data } = await api.patch(`/acampamentos/${atividadeId}/ocorrencias-saude/${id}/estado`, { estado, encaminhamento })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-evento-ocorrencias', atividadeId] }),
  })
}
