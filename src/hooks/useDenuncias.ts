import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { DenunciaPainel, DenunciaDetalhe, EstadoDenuncia } from '@/types/denuncia'

export function useDenunciasGestao(estado?: EstadoDenuncia | '') {
  return useQuery({
    queryKey: ['painel-denuncias', estado],
    queryFn: async () => {
      const { data } = await api.get<{ dados: DenunciaPainel[] }>('/denuncias', { params: estado ? { estado } : {} })
      return data.dados
    },
  })
}

export function useDenunciaDetalhe(id: number | undefined) {
  return useQuery({
    queryKey: ['painel-denuncia', id],
    queryFn: async () => {
      const { data } = await api.get<{ dados: DenunciaDetalhe }>(`/denuncias/${id}`)
      return data.dados
    },
    enabled: id !== undefined,
  })
}

export function useContagemDenuncias() {
  return useQuery({
    queryKey: ['painel-denuncias-contagem'],
    queryFn: async () => {
      const { data } = await api.get<{ dados: Record<EstadoDenuncia, number> }>('/denuncias/estado/contagem')
      return data.dados
    },
  })
}

export function useMudarEstadoDenuncia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, estado, nota }: { id: number; estado: EstadoDenuncia; nota?: string }) => {
      const { data } = await api.patch(`/denuncias/${id}/estado`, { estado, nota })
      return data
    },
    onSuccess: (_d, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['painel-denuncias'] })
      queryClient.invalidateQueries({ queryKey: ['painel-denuncia', id] })
      queryClient.invalidateQueries({ queryKey: ['painel-denuncias-contagem'] })
    },
  })
}
