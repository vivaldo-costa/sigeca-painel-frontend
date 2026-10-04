import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  Transferencia, FiltrosTransferencias, SolicitarTransferenciaPayload, EstadoTransferencia,
} from '@/types/transferencia'
import type { Paginacao } from '@/types/utilizador'

interface ListaResposta {
  dados: Transferencia[]
  paginacao: Paginacao
}

export function useTransferencias(filtros: FiltrosTransferencias) {
  return useQuery({
    queryKey: ['painel-transferencias', filtros],
    queryFn: async () => {
      const { data } = await api.get<ListaResposta>('/transferencias', { params: filtros })
      return data
    },
    placeholderData: (anterior) => anterior,
  })
}

export function useTransferencia(id: number | undefined) {
  return useQuery({
    queryKey: ['painel-transferencia', id],
    queryFn: async () => {
      const { data } = await api.get<{ dados: Transferencia }>(`/transferencias/${id}`)
      return data.dados
    },
    enabled: id !== undefined,
  })
}

function invalidarTudo(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['painel-transferencias'] })
  queryClient.invalidateQueries({ queryKey: ['painel-utilizadores'] })
  queryClient.invalidateQueries({ queryKey: ['painel-utilizador'] })
  queryClient.invalidateQueries({ queryKey: ['painel-utilizador-historico'] })
}

export function useSolicitarTransferencia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: SolicitarTransferenciaPayload) => {
      const form = new FormData()
      form.append('escuteiro_id', String(payload.escuteiro_id))
      form.append('agrupamento_destino_id', String(payload.agrupamento_destino_id))
      form.append('motivo', payload.motivo)
      if (payload.documento) form.append('documento', payload.documento)

      const { data } = await api.post('/transferencias', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: () => invalidarTudo(queryClient),
  })
}

export function useDecidirTransferencia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, estado, notas_destino }: { id: number; estado: EstadoTransferencia; notas_destino?: string }) => {
      const { data } = await api.patch(`/transferencias/${id}/decisao`, { estado, notas_destino })
      return data
    },
    onSuccess: () => invalidarTudo(queryClient),
  })
}

export function useCancelarTransferencia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch(`/transferencias/${id}/cancelar`, {})
      return data
    },
    onSuccess: () => invalidarTudo(queryClient),
  })
}
