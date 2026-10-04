import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { EstadoTotp, ActivacaoTotp, ConfirmacaoTotp } from '@/types/totp'

export function useEstadoTotp() {
  return useQuery({
    queryKey: ['painel-2fa-estado'],
    queryFn: async () => {
      const { data } = await api.get<{ dados: EstadoTotp }>('/perfil/2fa')
      return data.dados
    },
  })
}

export function useIniciarTotp() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ dados: ActivacaoTotp }>('/perfil/2fa/iniciar')
      return data.dados
    },
  })
}

export function useConfirmarTotp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (codigo: string) => {
      const { data } = await api.post<{ dados: ConfirmacaoTotp }>('/perfil/2fa/confirmar', { codigo })
      return data.dados
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-2fa-estado'] }),
  })
}

export function useDesactivarTotp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (password: string) => {
      const { data } = await api.post('/perfil/2fa/desactivar', { password })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-2fa-estado'] }),
  })
}
