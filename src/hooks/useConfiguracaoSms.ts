import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ConfiguracaoSms, ConfiguracaoSmsPayload } from '@/types/configuracaoSms'

export function useConfiguracaoSms() {
  return useQuery({
    queryKey: ['painel-configuracao-sms'],
    queryFn: async () => {
      const { data } = await api.get<{ dados: ConfiguracaoSms }>('/configuracoes-sms')
      return data.dados
    },
  })
}

export function useAtualizarConfiguracaoSms() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ConfiguracaoSmsPayload) => {
      const { data } = await api.put<{ dados: ConfiguracaoSms }>('/configuracoes-sms', payload)
      return data.dados
    },
    onSuccess: (dados) => queryClient.setQueryData(['painel-configuracao-sms'], dados),
  })
}

export function useEnviarSmsTeste() {
  return useMutation({
    mutationFn: async (destinatario: string) => {
      const { data } = await api.post<{ mensagem: string }>('/configuracoes-sms/teste', { destinatario })
      return data
    },
  })
}
