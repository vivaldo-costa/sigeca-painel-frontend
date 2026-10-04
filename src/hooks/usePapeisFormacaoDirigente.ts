import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PapelFormacaoPainel, PapelFormacaoDirigente } from '@/types/papelFormacaoDirigente'

export function usePapeisFormacao(filtros: { papel?: string; dioceseId?: number }) {
  return useQuery({
    queryKey: ['painel-papeis-formacao', filtros],
    queryFn: async () => {
      const { data } = await api.get<{ dados: PapelFormacaoPainel[] }>('/candidatos-dirigente/papeis/listar', { params: filtros })
      return data.dados
    },
  })
}

export function useAtribuirPapelFormacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { utilizador_id: number; papel: PapelFormacaoDirigente; diocese_id?: number; vigararia_id?: number; paroquia_id?: number }) => {
      const { data } = await api.post('/candidatos-dirigente/papeis/atribuir', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-papeis-formacao'] }),
  })
}

export function useRemoverPapelFormacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/candidatos-dirigente/papeis/${id}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-papeis-formacao'] }),
  })
}
