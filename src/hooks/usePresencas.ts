import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CredencialAtividade, PresencaRegistada, CredenciaisGeradasResultado } from '@/types/presenca'

export function useCredenciaisAtividade(atividadeId: number) {
  return useQuery({
    queryKey: ['painel-credenciais', atividadeId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: CredencialAtividade[] }>(`/presencas/${atividadeId}/credenciais`)
      return data.dados
    },
  })
}

export function usePresencasAtividade(atividadeId: number) {
  return useQuery({
    queryKey: ['painel-presencas', atividadeId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: PresencaRegistada[] }>(`/presencas/${atividadeId}`)
      return data.dados
    },
  })
}

export function useGerarCredenciais(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ dados: CredenciaisGeradasResultado; mensagem: string }>(`/presencas/${atividadeId}/gerar-credenciais`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-credenciais', atividadeId] }),
  })
}

export function useRegistarScan(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (token: string) => {
      const { data } = await api.post('/presencas/scan', { token })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-presencas', atividadeId] })
      queryClient.invalidateQueries({ queryKey: ['painel-credenciais', atividadeId] })
    },
  })
}
