import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CertificadoPainel, EmitirCertificadoPayload } from '@/types/certificado'

export function useCertificados(pesquisa: string, tipo: string) {
  return useQuery({
    queryKey: ['painel-certificados', pesquisa, tipo],
    queryFn: async () => {
      const { data } = await api.get<{ dados: CertificadoPainel[] }>('/certificados', { params: { pesquisa, tipo } })
      return data.dados
    },
  })
}

export function useEmitirCertificado() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: EmitirCertificadoPayload) => {
      const { data } = await api.post('/certificados', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-certificados'] }),
  })
}

export function useRevogarCertificado() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, motivo }: { id: number; motivo: string }) => {
      const { data } = await api.patch(`/certificados/${id}/revogar`, { motivo })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-certificados'] }),
  })
}
