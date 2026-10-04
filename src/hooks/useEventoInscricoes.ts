import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { EventoDelegacao, EventoInscricaoResumo, EventoInscricaoDetalhe, DadosParticipante } from '@/types/eventoInscricao'

export function useEventoDelegacoes(atividadeId: number) {
  return useQuery({
    queryKey: ['painel-evento-delegacoes', atividadeId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: EventoDelegacao[] }>(`/acampamentos/${atividadeId}/delegacoes`)
      return data.dados
    },
  })
}

export function useCriarDelegacao(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ agrupamento_id, chefe_responsavel_id }: { agrupamento_id: number; chefe_responsavel_id: number }) => {
      const { data } = await api.post(`/acampamentos/${atividadeId}/delegacoes`, { agrupamento_id, chefe_responsavel_id })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-evento-delegacoes', atividadeId] }),
  })
}

export function useEventoInscricoes(delegacaoId: number | null) {
  return useQuery({
    queryKey: ['painel-evento-inscricoes', delegacaoId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: EventoInscricaoResumo[] }>(`/acampamentos/delegacoes/${delegacaoId}/inscricoes`)
      return data.dados
    },
    enabled: delegacaoId !== null,
  })
}

export function useAdicionarInscricao(delegacaoId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ utilizador_id, funcao }: { utilizador_id: number; funcao: string }) => {
      const { data } = await api.post(`/acampamentos/delegacoes/${delegacaoId}/inscricoes`, { utilizador_id, funcao })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-evento-inscricoes', delegacaoId] }),
  })
}

export function useEventoInscricao(id: number | null) {
  return useQuery({
    queryKey: ['painel-evento-inscricao', id],
    queryFn: async () => {
      const { data } = await api.get<{ dados: EventoInscricaoDetalhe }>(`/acampamentos/inscricoes/${id}`)
      return data.dados
    },
    enabled: id !== null,
  })
}

export function useMudarEstadoInscricao(delegacaoId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, estado, motivo }: { id: number; estado: string; motivo?: string }) => {
      const { data } = await api.patch(`/acampamentos/inscricoes/${id}/estado`, { estado, motivo })
      return data
    },
    onSuccess: (_d, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['painel-evento-inscricoes', delegacaoId] })
      queryClient.invalidateQueries({ queryKey: ['painel-evento-inscricao', id] })
    },
  })
}

export function useDadosParticipante(inscricaoId: number | null) {
  return useQuery({
    queryKey: ['painel-dados-participante', inscricaoId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: DadosParticipante }>(`/acampamentos/inscricoes/${inscricaoId}/dados-participante`)
      return data.dados
    },
    enabled: inscricaoId !== null,
    retry: false,
  })
}

export function useGuardarDadosParticipante(inscricaoId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: DadosParticipante) => {
      const { data } = await api.put(`/acampamentos/inscricoes/${inscricaoId}/dados-participante`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-dados-participante', inscricaoId] }),
  })
}
