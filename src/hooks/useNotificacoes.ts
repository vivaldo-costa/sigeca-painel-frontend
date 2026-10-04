import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { NotificacaoPainel, NotificacaoVisivel, NotificacaoFormPayload, LocalExibicao } from '@/types/notificacao'

export function useNotificacoesGestao() {
  return useQuery({
    queryKey: ['painel-notificacoes'],
    queryFn: async () => {
      const { data } = await api.get<{ dados: NotificacaoPainel[] }>('/notificacoes')
      return data.dados
    },
  })
}

export function useCriarNotificacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: NotificacaoFormPayload) => {
      const { data } = await api.post('/notificacoes', { ...payload, global: payload.global ? '1' : '0' })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-notificacoes'] })
      queryClient.invalidateQueries({ queryKey: ['notificacoes-visiveis'] })
    },
  })
}

export function useAtualizarNotificacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: NotificacaoFormPayload }) => {
      const { data } = await api.put(`/notificacoes/${id}`, { ...payload, global: payload.global ? '1' : '0' })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-notificacoes'] })
      queryClient.invalidateQueries({ queryKey: ['notificacoes-visiveis'] })
    },
  })
}

export function useRemoverNotificacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/notificacoes/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-notificacoes'] })
      queryClient.invalidateQueries({ queryKey: ['notificacoes-visiveis'] })
    },
  })
}

/** O que o utilizador autenticado deve ver agora, num destino ('portal'|'painel') e local. */
export function useNotificacoesVisiveis(destino: 'portal' | 'painel', local: LocalExibicao) {
  return useQuery({
    queryKey: ['notificacoes-visiveis', destino, local],
    queryFn: async () => {
      const { data } = await api.get<{ dados: NotificacaoVisivel[] }>('/notificacoes/visiveis', { params: { destino, local } })
      return data.dados
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  })
}

export function useMarcarNotificacaoLida() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch(`/notificacoes/${id}/lida`, {})
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificacoes-visiveis'] }),
  })
}
