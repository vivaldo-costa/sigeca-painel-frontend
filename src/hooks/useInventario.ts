import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ItemInventario, MovimentoInventario, NivelInventario, NovoItemPayload } from '@/types/inventario'

interface Conta { nivel: NivelInventario; estruturaId: number | null }

function queryParams({ nivel, estruturaId }: Conta) {
  return estruturaId === null ? { nivel } : { nivel, estruturaId }
}

export function useItensInventario(conta: Conta | null) {
  return useQuery({
    queryKey: ['painel-inventario-itens', conta],
    queryFn: async () => {
      const { data } = await api.get<{ dados: ItemInventario[] }>('/inventario', { params: queryParams(conta!) })
      return data.dados
    },
    enabled: !!conta,
  })
}

interface FiltroDatas { dataInicio?: string; dataFim?: string }

export function useMovimentosInventarioItem(itemId: number | null, filtro?: FiltroDatas) {
  return useQuery({
    queryKey: ['painel-inventario-movimentos', itemId, filtro],
    queryFn: async () => {
      const { data } = await api.get<{ dados: MovimentoInventario[] }>(`/inventario/${itemId}/movimentos`, {
        params: { dataInicio: filtro?.dataInicio || undefined, dataFim: filtro?.dataFim || undefined },
      })
      return data.dados
    },
    enabled: itemId !== null,
  })
}

function useInvalidarItens() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['painel-inventario-itens'] })
    queryClient.invalidateQueries({ queryKey: ['painel-inventario-movimentos'] })
  }
}

export function useCriarItemInventario() {
  const invalidar = useInvalidarItens()
  return useMutation({
    mutationFn: async (payload: NovoItemPayload) => {
      const { data } = await api.post('/inventario', payload)
      return data
    },
    onSuccess: invalidar,
  })
}

export function useRemoverItemInventario() {
  const invalidar = useInvalidarItens()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/inventario/${id}`)
      return data
    },
    onSuccess: invalidar,
  })
}

export function useEntradaInventario() {
  const invalidar = useInvalidarItens()
  return useMutation({
    mutationFn: async ({ id, quantidade, motivo }: { id: number; quantidade: number; motivo?: string }) => {
      const { data } = await api.post(`/inventario/${id}/entradas`, { quantidade, motivo })
      return data
    },
    onSuccess: invalidar,
  })
}

export function useSaidaInventario() {
  const invalidar = useInvalidarItens()
  return useMutation({
    mutationFn: async ({ id, quantidade, motivo }: { id: number; quantidade: number; motivo?: string }) => {
      const { data } = await api.post(`/inventario/${id}/saidas`, { quantidade, motivo })
      return data
    },
    onSuccess: invalidar,
  })
}

export function useBaixaInventario() {
  const invalidar = useInvalidarItens()
  return useMutation({
    mutationFn: async ({ id, quantidade, motivo, estado }: { id: number; quantidade: number; motivo: string; estado?: 'danificado' | 'inutilizado' }) => {
      const { data } = await api.post(`/inventario/${id}/baixa`, { quantidade, motivo, estado })
      return data
    },
    onSuccess: invalidar,
  })
}

export function useTransferirInventario() {
  const invalidar = useInvalidarItens()
  return useMutation({
    mutationFn: async ({ id, quantidade, nivel_destino, estrutura_destino_id, motivo }: {
      id: number; quantidade: number; nivel_destino: NivelInventario; estrutura_destino_id?: number; motivo?: string
    }) => {
      const { data } = await api.post(`/inventario/${id}/transferencia`, { quantidade, nivel_destino, estrutura_destino_id, motivo })
      return data
    },
    onSuccess: invalidar,
  })
}
