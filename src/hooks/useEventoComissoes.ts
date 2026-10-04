import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { EventoComissaoPainel, ComissaoMembro, ComissaoTarefa, ComissaoDocumento, EstadoTarefa } from '@/types/eventoComissao'

export function useEventoComissoes(atividadeId: number) {
  return useQuery({
    queryKey: ['painel-evento-comissoes', atividadeId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: EventoComissaoPainel[] }>(`/acampamentos/${atividadeId}/comissoes`)
      return data.dados
    },
  })
}

export function useCriarComissao(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { nome: string; coordenador_id: number | ''; orcamento: string }) => {
      const { data } = await api.post(`/acampamentos/${atividadeId}/comissoes`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-evento-comissoes', atividadeId] }),
  })
}

export function useComissaoMembros(comissaoId: number | null) {
  return useQuery({
    queryKey: ['painel-comissao-membros', comissaoId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: ComissaoMembro[] }>(`/acampamentos/comissoes/${comissaoId}/membros`)
      return data.dados
    },
    enabled: comissaoId !== null,
  })
}

export function useAdicionarMembroComissao(comissaoId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { utilizador_id: number; funcao: string }) => {
      const { data } = await api.post(`/acampamentos/comissoes/${comissaoId}/membros`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-comissao-membros', comissaoId] }),
  })
}

export function useRemoverMembroComissao(comissaoId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/acampamentos/comissoes/membros/${id}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-comissao-membros', comissaoId] }),
  })
}

export function useComissaoTarefas(comissaoId: number | null) {
  return useQuery({
    queryKey: ['painel-comissao-tarefas', comissaoId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: ComissaoTarefa[] }>(`/acampamentos/comissoes/${comissaoId}/tarefas`)
      return data.dados
    },
    enabled: comissaoId !== null,
  })
}

export function useCriarTarefaComissao(comissaoId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { titulo: string; descricao: string; prazo: string }) => {
      const { data } = await api.post(`/acampamentos/comissoes/${comissaoId}/tarefas`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-comissao-tarefas', comissaoId] }),
  })
}

export function useMudarEstadoTarefa(comissaoId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, estado }: { id: number; estado: EstadoTarefa }) => {
      const { data } = await api.patch(`/acampamentos/comissoes/tarefas/${id}/estado`, { estado })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-comissao-tarefas', comissaoId] }),
  })
}

export function useComissaoDocumentos(comissaoId: number | null) {
  return useQuery({
    queryKey: ['painel-comissao-documentos', comissaoId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: ComissaoDocumento[] }>(`/acampamentos/comissoes/${comissaoId}/documentos`)
      return data.dados
    },
    enabled: comissaoId !== null,
  })
}

export function useAdicionarDocumentoComissao(comissaoId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ficheiro: File) => {
      const form = new FormData()
      form.append('ficheiro', ficheiro)
      const { data } = await api.post(`/acampamentos/comissoes/${comissaoId}/documentos`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-comissao-documentos', comissaoId] }),
  })
}
