import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { DashboardPainelData, FiltrosDashboard, OpcaoFiltro } from '@/types/dashboard'

/**
 * GET /api/v1/painel/dashboard — dashboard agregado do Painel de Gestão.
 * Implementado no backend (models/services/painelDashboard.*), separado de
 * GET /api/v1/dashboard (essa é a do Portal do Escuteiro, dados de um único
 * utilizador). O backend aplica âmbito automático por perfil: ADMIN/TECNICO
 * veem tudo, os restantes ficam limitados à sua diocese.
 */
export function useDashboardPainel(filtros: FiltrosDashboard) {
  return useQuery({
    queryKey: ['painel-dashboard', filtros],
    queryFn: async () => {
      const { data } = await api.get<{ dados: DashboardPainelData }>('/painel/dashboard', { params: filtros })
      return data.dados
    },
  })
}

/** GET /api/v1/filtros/:nivel — listas { id, nome } para os selects em cascata da FiltrosBar. */
export function useOpcoesFiltro(nivel: 'dioceses' | 'vigararias' | 'paroquias' | 'agrupamentos' | 'seccoes', pai?: number) {
  return useQuery({
    queryKey: ['painel-filtro-opcoes', nivel, pai],
    queryFn: async () => {
      const { data } = await api.get<{ dados: OpcaoFiltro[] }>(`/filtros/${nivel}`, { params: { pai } })
      return data.dados
    },
  })
}
