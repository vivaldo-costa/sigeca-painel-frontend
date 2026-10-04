import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { EntradaLog, EstadoMonitorizacao } from '@/types/logs'

export function useLogs(filtros: { ficheiro?: string; nivel?: string; pesquisa?: string; limite?: number }) {
  return useQuery({
    queryKey: ['painel-logs', filtros],
    queryFn: async () => {
      const { data } = await api.get<{ dados: EntradaLog[] }>('/logs', { params: filtros })
      return data.dados
    },
  })
}

export function useMonitorizacao() {
  return useQuery({
    queryKey: ['painel-monitorizacao'],
    queryFn: async () => {
      const { data } = await api.get<{ dados: EstadoMonitorizacao }>('/monitorizacao')
      return data.dados
    },
    refetchInterval: 15000,
  })
}
