import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PerfilAcesso, PermissoesPerfil, MapaPermissoes, PerfilFormPayload } from '@/types/perfis'

export function usePerfisAcesso(ativo = true) {
  return useQuery({
    enabled: ativo,
    queryKey: ['painel-perfis'],
    queryFn: async () => {
      const { data } = await api.get<{ dados: PerfilAcesso[] }>('/perfis')
      return data.dados
    },
  })
}

export function usePermissoesPerfil(perfilId: number | undefined) {
  return useQuery({
    queryKey: ['painel-perfis-permissoes', perfilId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: PermissoesPerfil }>(`/perfis/${perfilId}/permissoes`)
      return data.dados
    },
    enabled: perfilId !== undefined,
  })
}

export function useCriarPerfil() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: PerfilFormPayload) => {
      const { data } = await api.post('/perfis', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-perfis'] }),
  })
}

export function useAtualizarPerfilAcesso() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: PerfilFormPayload }) => {
      const { data } = await api.put(`/perfis/${id}`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-perfis'] }),
  })
}

export function useRemoverPerfilAcesso() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/perfis/${id}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-perfis'] }),
  })
}

export function useGuardarPermissoes() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ perfilId, permissoes }: { perfilId: number; permissoes: MapaPermissoes }) => {
      const { data } = await api.put(`/perfis/${perfilId}/permissoes`, { permissoes })
      return data
    },
    onSuccess: (_d, { perfilId }) => {
      queryClient.invalidateQueries({ queryKey: ['painel-perfis-permissoes', perfilId] })
    },
  })
}
