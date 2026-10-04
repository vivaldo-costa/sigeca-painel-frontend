import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  AtividadePainel, InscritoAtividade, FiltrosAtividades, AtividadeFormPayload, EstadoInscricao,
} from '@/types/atividade'

/**
 * Actividades e Formações são o mesmo módulo no backend (tabela `atividades`
 * partilhada, distinguida por `tipo`) — em vez de duplicar hooks, esta
 * fábrica gera o conjunto todo a partir do caminho base ('/atividades' ou
 * '/formacoes'), que já resolve para o `tipo` certo no servidor.
 */
export function criarHooksAtividade(basePath: '/atividades' | '/formacoes') {
  const chaveLista = basePath === '/atividades' ? 'painel-atividades' : 'painel-formacoes'

  function useLista(filtros: FiltrosAtividades) {
    return useQuery({
      queryKey: [chaveLista, filtros],
      queryFn: async () => {
        const { data } = await api.get<{ dados: AtividadePainel[] }>(basePath, { params: filtros })
        return data.dados
      },
    })
  }

  function useInscritos(id: number | undefined) {
    return useQuery({
      queryKey: [chaveLista, id, 'inscritos'],
      queryFn: async () => {
        const { data } = await api.get<{ dados: InscritoAtividade[] }>(`${basePath}/${id}/inscritos`)
        return data.dados
      },
      enabled: id !== undefined,
    })
  }

  function paraFormData(payload: AtividadeFormPayload, imagem: File | null) {
    const form = new FormData()
    Object.entries(payload).forEach(([chave, valor]) => {
      if (chave === 'ativo') form.append('ativo', valor ? '1' : '0')
      else form.append(chave, String(valor ?? ''))
    })
    if (imagem) form.append('imagem', imagem)
    return form
  }

  function useCriar() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: async ({ payload, imagem }: { payload: AtividadeFormPayload; imagem: File | null }) => {
        const { data } = await api.post(basePath, paraFormData(payload, imagem), {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        return data
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [chaveLista] }),
    })
  }

  function useAtualizar() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: async ({ id, payload, imagem }: { id: number; payload: AtividadeFormPayload; imagem: File | null }) => {
        const { data } = await api.put(`${basePath}/${id}`, paraFormData(payload, imagem), {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        return data
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [chaveLista] }),
    })
  }

  function useRemover() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: async (id: number) => {
        const { data } = await api.delete(`${basePath}/${id}`)
        return data
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [chaveLista] }),
    })
  }

  function useAtualizarInscricao() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: async ({ inscricaoId, estado }: { inscricaoId: number; estado: EstadoInscricao }) => {
        const { data } = await api.patch(`${basePath}/inscricoes/${inscricaoId}`, { estado })
        return data
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [chaveLista] }),
    })
  }

  return { useLista, useInscritos, useCriar, useAtualizar, useRemover, useAtualizarInscricao }
}
