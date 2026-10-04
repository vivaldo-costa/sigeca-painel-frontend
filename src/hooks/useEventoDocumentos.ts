import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { DocumentoEvento, TipoDocumentoEvento } from '@/types/eventoDocumento'

export function useEventoDocumentos(atividadeId: number) {
  return useQuery({
    queryKey: ['painel-evento-documentos', atividadeId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: DocumentoEvento[] }>(`/acampamentos/${atividadeId}/documentos`)
      return data.dados
    },
  })
}

export function useCriarEventoDocumento(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { tipo: TipoDocumentoEvento; descricao?: string; data_documento?: string; ficheiro: File }) => {
      const form = new FormData()
      form.append('tipo', payload.tipo)
      if (payload.descricao) form.append('descricao', payload.descricao)
      if (payload.data_documento) form.append('data_documento', payload.data_documento)
      form.append('ficheiro', payload.ficheiro)
      const { data } = await api.post(`/acampamentos/${atividadeId}/documentos`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-evento-documentos', atividadeId] }),
  })
}

export function useRemoverEventoDocumento(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/acampamentos/${atividadeId}/documentos/${id}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-evento-documentos', atividadeId] }),
  })
}
