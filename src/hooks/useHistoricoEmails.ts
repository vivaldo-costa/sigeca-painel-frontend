import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { EntradaHistoricoEmail, FiltrosHistoricoEmail } from '@/types/historicoEmail'
import type { Paginacao } from '@/types/utilizador'

export function useHistoricoEmails(filtros: FiltrosHistoricoEmail) {
  return useQuery({
    queryKey: ['painel-historico-emails', filtros],
    queryFn: async () => {
      const { data } = await api.get<{ dados: EntradaHistoricoEmail[]; paginacao: Paginacao }>('/fila-emails', { params: filtros })
      return data
    },
  })
}
