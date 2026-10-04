import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, getApiErrorMessage } from '@/lib/api'
import { notificar } from '@/lib/notificar'
import type { PagamentoCensoPainel, PagamentoCensoDetalhe, EstadoPagamentoCenso } from '@/types/pagamentoCenso'

export function usePagamentosCenso(periodoCensoId?: number, estado?: EstadoPagamentoCenso | '') {
  return useQuery({
    queryKey: ['painel-pagamentos-censo', periodoCensoId, estado],
    queryFn: async () => {
      const { data } = await api.get<{ dados: PagamentoCensoPainel[] }>('/regularizacao-censo', { params: { periodoCensoId, estado } })
      return data.dados
    },
  })
}

export function usePagamentoCensoDetalhe(id: number | null) {
  return useQuery({
    queryKey: ['painel-pagamento-censo', id],
    queryFn: async () => {
      const { data } = await api.get<{ dados: PagamentoCensoDetalhe }>(`/regularizacao-censo/${id}`)
      return data.dados
    },
    enabled: id !== null,
  })
}

export function useSubmeterPagamentoCenso() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (form: FormData) => {
      const { data } = await api.post('/regularizacao-censo', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-pagamentos-censo'] }),
  })
}

export function useValidarPagamentoCenso() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch(`/regularizacao-censo/${id}/validar`, {})
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-pagamentos-censo'] })
      queryClient.invalidateQueries({ queryKey: ['painel-pagamento-censo'] })
    },
    onError: (err) => notificar.erro(getApiErrorMessage(err, 'Não foi possível validar o pagamento.')),
  })
}

export function useRejeitarPagamentoCenso() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, motivo }: { id: number; motivo: string }) => {
      const { data } = await api.patch(`/regularizacao-censo/${id}/rejeitar`, { motivo })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-pagamentos-censo'] })
      queryClient.invalidateQueries({ queryKey: ['painel-pagamento-censo'] })
    },
  })
}
