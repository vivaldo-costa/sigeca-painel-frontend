import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface MaterialFormacao {
  id: number
  catalogo_formacao_id: number
  titulo: string
  ficheiro: string
  ordem: number
  created_at: string
  criado_por_nome: string | null
}

export function useMateriaisFormacao(catalogoId: number | null) {
  return useQuery({
    queryKey: ['painel-materiais-formacao', catalogoId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: MaterialFormacao[] }>(`/catalogo-formacoes/${catalogoId}/materiais`)
      return data.dados
    },
    enabled: catalogoId !== null,
  })
}

export function useAdicionarMaterialFormacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ catalogoId, titulo, ficheiro }: { catalogoId: number; titulo: string; ficheiro: File }) => {
      const form = new FormData()
      form.append('titulo', titulo)
      form.append('ficheiro', ficheiro)
      const { data } = await api.post<{ dados: MaterialFormacao[] }>(`/catalogo-formacoes/${catalogoId}/materiais`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: (_data, { catalogoId }) => {
      queryClient.invalidateQueries({ queryKey: ['painel-materiais-formacao', catalogoId] })
    },
  })
}

export function useRemoverMaterialFormacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ catalogoId, materialId }: { catalogoId: number; materialId: number }) => {
      const { data } = await api.delete<{ dados: MaterialFormacao[] }>(`/catalogo-formacoes/${catalogoId}/materiais/${materialId}`)
      return data
    },
    onSuccess: (_data, { catalogoId }) => {
      queryClient.invalidateQueries({ queryKey: ['painel-materiais-formacao', catalogoId] })
    },
  })
}
