import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { EntradaAuditoria, FiltrosAuditoria } from '@/types/auditoria'

interface RespostaAuditoria {
  dados: EntradaAuditoria[]
  total: number
  pagina: number
  porPagina: number
}

export function useAuditoria(filtros: FiltrosAuditoria) {
  return useQuery({
    queryKey: ['painel-auditoria', filtros],
    queryFn: async () => {
      const { data } = await api.get<RespostaAuditoria>('/auditoria', { params: filtros })
      return data
    },
  })
}
