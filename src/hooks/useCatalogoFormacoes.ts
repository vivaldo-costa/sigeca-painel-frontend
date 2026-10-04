import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ItemCatalogo, ItemCatalogoFormPayload } from '@/types/catalogoFormacao'

export function useCatalogoFormacoes(categoria: string) {
  return useQuery({
    queryKey: ['painel-catalogo-formacoes', categoria],
    queryFn: async () => {
      const { data } = await api.get<{ dados: ItemCatalogo[] }>('/catalogo-formacoes', { params: { categoria } })
      return data.dados
    },
  })
}

export function useCriarItemCatalogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ItemCatalogoFormPayload) => {
      const { data } = await api.post('/catalogo-formacoes', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-catalogo-formacoes'] }),
  })
}

export function useAtualizarItemCatalogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: ItemCatalogoFormPayload }) => {
      const { data } = await api.put(`/catalogo-formacoes/${id}`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-catalogo-formacoes'] }),
  })
}

export function useRemoverItemCatalogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/catalogo-formacoes/${id}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-catalogo-formacoes'] }),
  })
}
