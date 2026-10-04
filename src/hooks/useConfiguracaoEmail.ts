import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ConfiguracaoEmail, ConfiguracaoEmailPayload } from '@/types/configuracaoEmail'

export function useConfiguracaoEmail() {
  return useQuery({
    queryKey: ['painel-configuracao-email'],
    queryFn: async () => {
      const { data } = await api.get<{ dados: ConfiguracaoEmail }>('/configuracoes-email')
      return data.dados
    },
  })
}

export function useAtualizarConfiguracaoEmail() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ConfiguracaoEmailPayload) => {
      const { data } = await api.put<{ dados: ConfiguracaoEmail }>('/configuracoes-email', payload)
      return data.dados
    },
    onSuccess: (dados) => queryClient.setQueryData(['painel-configuracao-email'], dados),
  })
}

export function useEnviarEmailTeste() {
  return useMutation({
    mutationFn: async (destinatario: string) => {
      const { data } = await api.post<{ mensagem: string }>('/configuracoes-email/teste', { destinatario })
      return data
    },
  })
}
