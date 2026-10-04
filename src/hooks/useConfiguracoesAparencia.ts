import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ConfiguracoesAparencia } from '@/types/configuracoesAparencia'

export function useConfiguracoesAparencia() {
  return useQuery({
    queryKey: ['painel-configuracoes-aparencia'],
    queryFn: async () => {
      const { data } = await api.get<{ dados: ConfiguracoesAparencia }>('/configuracoes-aparencia')
      return data.dados
    },
  })
}

export function useAtualizarCoresTema() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<ConfiguracoesAparencia>) => {
      const { data } = await api.put<{ dados: ConfiguracoesAparencia }>('/configuracoes-aparencia', payload)
      return data.dados
    },
    onSuccess: (dados) => queryClient.setQueryData(['painel-configuracoes-aparencia'], dados),
  })
}

export function useAtualizarLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ tipo, ficheiro }: { tipo: string; ficheiro: File }) => {
      const form = new FormData()
      form.append('ficheiro', ficheiro)
      const { data } = await api.post<{ dados: ConfiguracoesAparencia }>(`/configuracoes-aparencia/logo/${tipo}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      return data.dados
    },
    onSuccess: (dados) => queryClient.setQueryData(['painel-configuracoes-aparencia'], dados),
  })
}
