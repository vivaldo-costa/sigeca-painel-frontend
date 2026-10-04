import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ProdutoPainel, Categoria, FiltrosProdutos, ProdutoFormPayload } from '@/types/produto'

export function useProdutos(filtros: FiltrosProdutos) {
  return useQuery({
    queryKey: ['painel-produtos', filtros],
    queryFn: async () => {
      const { data } = await api.get<{ dados: ProdutoPainel[] }>('/produtos', { params: filtros })
      return data.dados
    },
  })
}

/** Produto único, com galeria de imagens incluída (`imagens`) — usado no modal de edição. */
export function useProduto(id: number | null) {
  return useQuery({
    queryKey: ['painel-produto', id],
    queryFn: async () => {
      const { data } = await api.get<{ dados: ProdutoPainel }>(`/produtos/${id}`)
      return data.dados
    },
    enabled: id !== null,
  })
}

export function useCategorias() {
  return useQuery({
    queryKey: ['painel-categorias'],
    queryFn: async () => {
      const { data } = await api.get<{ dados: Categoria[] }>('/produtos/categorias')
      return data.dados
    },
  })
}

export function useCriarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { nome: string; descricao: string }) => {
      const { data } = await api.post('/produtos/categorias', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-categorias'] }),
  })
}

function paraFormData(payload: ProdutoFormPayload, imagem: File | null) {
  const form = new FormData()
  form.append('nome', payload.nome)
  form.append('descricao', payload.descricao)
  form.append('descricao_curta', payload.descricao_curta)
  form.append('preco', payload.preco)
  form.append('preco_antigo', payload.preco_antigo)
  form.append('stock', payload.stock)
  form.append('ativo', payload.ativo ? '1' : '0')
  form.append('etiqueta', payload.etiqueta)
  form.append('categoria_id', String(payload.categoria_id))
  form.append('variacoes', JSON.stringify(payload.variacoes.filter((v) => v.tamanho || v.cor)))
  if (imagem) form.append('imagem', imagem)
  return form
}

export function useCriarProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ payload, imagem }: { payload: ProdutoFormPayload; imagem: File | null }) => {
      const { data } = await api.post('/produtos', paraFormData(payload, imagem), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-produtos'] }),
  })
}

export function useAtualizarProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload, imagem }: { id: number; payload: ProdutoFormPayload; imagem: File | null }) => {
      const { data } = await api.put(`/produtos/${id}`, paraFormData(payload, imagem), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-produtos'] }),
  })
}

export function useRemoverProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/produtos/${id}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-produtos'] }),
  })
}

function invalidarProduto(queryClient: ReturnType<typeof useQueryClient>, id: number) {
  queryClient.invalidateQueries({ queryKey: ['painel-produto', id] })
  queryClient.invalidateQueries({ queryKey: ['painel-produtos'] })
}

/** Galeria de fotos do produto (além da capa) — máximo de 8 fotos ao todo, validado no servidor. */
export function useAdicionarImagensProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ficheiros }: { id: number; ficheiros: File[] }) => {
      const form = new FormData()
      ficheiros.forEach((f) => form.append('imagens', f))
      const { data } = await api.post<{ dados: ProdutoPainel }>(`/produtos/${id}/imagens`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: (_data, { id }) => invalidarProduto(queryClient, id),
  })
}

export function useRemoverImagemProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, imagemId }: { id: number; imagemId: number }) => {
      const { data } = await api.delete<{ dados: ProdutoPainel }>(`/produtos/${id}/imagens/${imagemId}`)
      return data
    },
    onSuccess: (_data, { id }) => invalidarProduto(queryClient, id),
  })
}

export function useReordenarImagensProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ids }: { id: number; ids: number[] }) => {
      const { data } = await api.put<{ dados: ProdutoPainel }>(`/produtos/${id}/imagens/ordem`, { ids })
      return data
    },
    onSuccess: (_data, { id }) => invalidarProduto(queryClient, id),
  })
}
