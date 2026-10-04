import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { aguardarTrabalho } from '@/lib/trabalhos'
import type { FiltrosUtilizadores } from '@/types/utilizador'

type AlvoMassa = { ids: number[]; filtros?: never } | { ids?: never; filtros: Partial<FiltrosUtilizadores> }

export function useAlterarEstadoMassa() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: AlvoMassa & { acao: 'activar' | 'desativar' | 'alterar_estado'; novoEstado?: string }) => {
      const { data } = await api.post<{ dados: { afectados: number }; mensagem: string }>('/utilizadores/massa/estado', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-utilizadores'] }),
  })
}

export function useEliminarMassa() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: AlvoMassa) => {
      const { data } = await api.post<{ dados: { afectados: number }; mensagem: string }>('/utilizadores/massa/eliminar', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-utilizadores'] }),
  })
}

export function useExportarMassa() {
  return useMutation({
    mutationFn: async (payload: AlvoMassa) => {
      const { data } = await api.post<{ dados: { trabalho_id: number } }>('/utilizadores/massa/exportar', payload)
      return aguardarTrabalho<Record<string, unknown>[]>(data.dados.trabalho_id)
    },
  })
}
