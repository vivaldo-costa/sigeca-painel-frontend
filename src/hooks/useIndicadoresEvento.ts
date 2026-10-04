import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { IndicadoresEvento } from '@/types/eventoIndicadores'

export function useIndicadoresEvento(atividadeId: number) {
  return useQuery({
    queryKey: ['painel-evento-indicadores', atividadeId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: IndicadoresEvento }>(`/acampamentos/${atividadeId}/indicadores`)
      return data.dados
    },
  })
}
