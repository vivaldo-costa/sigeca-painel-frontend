import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { baixarFicheiroProtegido } from '@/lib/download'
import type { DocumentoModelo, EditarDocumentoModeloPayload, NovoDocumentoModeloPayload } from '@/types/documentoModelo'

export function useDocumentoModelos(todos = false) {
  return useQuery({
    queryKey: ['painel-documento-modelos', todos],
    queryFn: async () => {
      const { data } = await api.get<{ dados: DocumentoModelo[] }>('/documento-modelos', { params: todos ? { todos: '1' } : {} })
      return data.dados
    },
  })
}

export function useCriarDocumentoModelo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: NovoDocumentoModeloPayload) => {
      const form = new FormData()
      form.append('titulo', payload.titulo)
      if (payload.descricao) form.append('descricao', payload.descricao)
      if (payload.categoria) form.append('categoria', payload.categoria)
      if (payload.ordem !== undefined) form.append('ordem', String(payload.ordem))
      form.append('ficheiro', payload.ficheiro)
      const { data } = await api.post('/documento-modelos', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-documento-modelos'] }),
  })
}

export function useActualizarDocumentoModelo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: EditarDocumentoModeloPayload }) => {
      const { data } = await api.put(`/documento-modelos/${id}`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-documento-modelos'] }),
  })
}

export function useSubstituirFicheiroModelo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ficheiro }: { id: number; ficheiro: File }) => {
      const form = new FormData()
      form.append('ficheiro', ficheiro)
      const { data } = await api.put(`/documento-modelos/${id}/ficheiro`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-documento-modelos'] }),
  })
}

export function useRemoverDocumentoModelo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/documento-modelos/${id}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-documento-modelos'] }),
  })
}

export async function baixarDocumentoModelo(modelo: DocumentoModelo) {
  await baixarFicheiroProtegido(`/documento-modelos/${modelo.id}/baixar`, modelo.nome_ficheiro)
}
