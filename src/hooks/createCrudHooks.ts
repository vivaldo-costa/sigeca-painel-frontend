import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

/**
 * Gera o conjunto padrao de hooks (listar/obter/criar/actualizar/eliminar)
 * para um recurso REST em /api/v1/<resource>. Os 5 modulos de estrutura
 * (dioceses, vigararias, paroquias, agrupamentos, seccoes) tem todos a
 * mesma forma de CRUD — so os campos mudam — por isso ganha-se bastante em
 * reutilizar esta fabrica em vez de repetir hooks por modulo.
 *
 * ⚠️ Backend ainda não implementado: nenhum destes 5 recursos existe nas
 * rotas da API Node por agora (routes/index.js so tem auth, utilizadores,
 * dashboard, perfil, carrinho). Ficam prontos a usar assim que a "Fase 2"
 * do roteiro da API (estrutura territorial) for construida — o envelope
 * { sucesso, dados, mensagem } ja esta alinhado com o resto da API.
 */
export function createCrudHooks<T extends { id: number }>(resource: string) {
  const key = ['painel', resource]

  function useList() {
    return useQuery({
      queryKey: key,
      queryFn: async () => {
        const { data } = await api.get<{ dados: T[] }>(`/${resource}`)
        return data.dados
      },
    })
  }

  function useOne(id: number | undefined) {
    return useQuery({
      queryKey: [...key, id],
      queryFn: async () => {
        const { data } = await api.get<{ dados: T }>(`/${resource}/${id}`)
        return data.dados
      },
      enabled: id !== undefined,
    })
  }

  function useCreate() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: async (payload: Partial<T>) => {
        const { data } = await api.post(`/${resource}`, payload)
        return data
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
    })
  }

  function useUpdate() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: async ({ id, payload }: { id: number; payload: Partial<T> }) => {
        const { data } = await api.put(`/${resource}/${id}`, payload)
        return data
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
    })
  }

  function useDelete() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: async (id: number) => {
        const { data } = await api.delete(`/${resource}/${id}`)
        return data
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
    })
  }

  return { useList, useOne, useCreate, useUpdate, useDelete }
}
