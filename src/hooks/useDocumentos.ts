import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { baixarFicheiroProtegido } from '@/lib/download'
import type {
  DocumentoOficial, FiltrosDocumentos, NovoDocumentoPayload, UtilizadorAtividades,
} from '@/types/documento'

export function useDocumentos(filtros: FiltrosDocumentos) {
  return useQuery({
    queryKey: ['painel-documentos', filtros],
    queryFn: async () => {
      const { data } = await api.get<{ dados: DocumentoOficial[] }>('/documentos', { params: filtros })
      return data.dados
    },
  })
}

/** Pesquisa por Nº SIGECA e devolve as actividades em que o utilizador está inscrito. */
export function useAtividadesDoUtilizador(codigo: string | null) {
  return useQuery({
    queryKey: ['painel-documentos-utilizador', codigo],
    queryFn: async () => {
      const { data } = await api.get<{ dados: UtilizadorAtividades }>(`/documentos/utilizador/${codigo}`)
      return data.dados
    },
    enabled: !!codigo,
    retry: false,
  })
}

export function useCriarDocumento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: NovoDocumentoPayload) => {
      const { data } = await api.post<{ dados: DocumentoOficial }>('/documentos', payload)
      return data.dados
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-documentos'] }),
  })
}

export function useCancelarDocumento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch(`/documentos/${id}/cancelar`, {})
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-documentos'] }),
  })
}

export async function baixarDocumentoPdf(doc: DocumentoOficial) {
  await baixarFicheiroProtegido(`/documentos/${doc.id}/pdf`, `declaracao-${doc.codigo_associado}.pdf`)
}
