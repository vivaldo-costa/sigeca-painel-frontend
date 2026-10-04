import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ConfiguracoesGerais, ConfiguracoesGeraisPayload } from '@/types/configuracoesGerais'

export function useConfiguracoesGerais() {
  return useQuery({
    queryKey: ['painel-configuracoes-gerais'],
    queryFn: async () => {
      const { data } = await api.get<{ dados: ConfiguracoesGerais }>('/configuracoes-gerais')
      return data.dados
    },
  })
}

export function useAtualizarConfiguracoesGerais() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ConfiguracoesGeraisPayload) => {
      const { data } = await api.put<{ dados: ConfiguracoesGerais; mensagem: string }>('/configuracoes-gerais', payload)
      return data
    },
    onSuccess: (data) => queryClient.setQueryData(['painel-configuracoes-gerais'], data.dados),
  })
}
