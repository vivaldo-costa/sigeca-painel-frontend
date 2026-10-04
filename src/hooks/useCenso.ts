import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CensoPeriodo, CensoRespostaResumo, CensoRespostaFormPayload, CensoPeriodoFormPayload } from '@/types/censo'

export function useCensoPeriodos() {
  return useQuery({
    queryKey: ['painel-censo-periodos'],
    queryFn: async () => {
      const { data } = await api.get<{ dados: CensoPeriodo[] }>('/censo/periodos')
      return data.dados
    },
  })
}

export function useCriarCensoPeriodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CensoPeriodoFormPayload) => {
      const { data } = await api.post('/censo/periodos', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-censo-periodos'] }),
  })
}

export function useCensoRespostas(periodoId: number | undefined) {
  return useQuery({
    queryKey: ['painel-censo-respostas', periodoId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: CensoRespostaResumo[] }>(`/censo/periodos/${periodoId}/respostas`)
      return data.dados
    },
    enabled: periodoId !== undefined,
  })
}

export function useGuardarCensoResposta(periodoId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ agrupamentoId, payload }: { agrupamentoId: number; payload: CensoRespostaFormPayload }) => {
      const { data } = await api.put(`/censo/periodos/${periodoId}/respostas/${agrupamentoId}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-censo-respostas', periodoId] })
      queryClient.invalidateQueries({ queryKey: ['painel-censo-periodos'] })
    },
  })
}
