import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { DashboardFormacaoDirigente, FiltrosDashboardFormacao } from '@/types/dashboardFormacaoDirigente'

export function useDashboardFormacaoDirigente(filtros: FiltrosDashboardFormacao) {
  return useQuery({
    queryKey: ['painel-dashboard-formacao-dirigentes', filtros],
    queryFn: async () => {
      const { data } = await api.get<{ dados: DashboardFormacaoDirigente }>('/dashboard-formacao-dirigentes', { params: filtros })
      return data.dados
    },
  })
}
