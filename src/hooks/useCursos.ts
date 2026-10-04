import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CursoResumo, CursoDetalhe, CursoFormPayload, Aproveitamento } from '@/types/curso'

export function useCursos(pesquisa: string) {
  return useQuery({
    queryKey: ['painel-cursos', pesquisa],
    queryFn: async () => {
      const { data } = await api.get<{ dados: CursoResumo[] }>('/cursos', { params: { pesquisa } })
      return data.dados
    },
  })
}

export function useCurso(id: number | undefined) {
  return useQuery({
    queryKey: ['painel-curso', id],
    queryFn: async () => {
      const { data } = await api.get<{ dados: CursoDetalhe }>(`/cursos/${id}`)
      return data.dados
    },
    enabled: id !== undefined,
  })
}

export function useCriarCurso() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CursoFormPayload) => {
      const { data } = await api.post('/cursos', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-cursos'] }),
  })
}

export function useAtualizarCurso() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: CursoFormPayload }) => {
      const { data } = await api.put(`/cursos/${id}`, payload)
      return data
    },
    onSuccess: (_d, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['painel-cursos'] })
      queryClient.invalidateQueries({ queryKey: ['painel-curso', id] })
    },
  })
}

export function useAtribuirFormadorCurso(cursoId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { formador_id: number; papel: string }) => {
      const { data } = await api.post(`/cursos/${cursoId}/formadores`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-curso', cursoId] }),
  })
}

export function useRemoverFormadorCurso(cursoId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (formadorAtribuidoId: number) => {
      const { data } = await api.delete(`/cursos/formadores-atribuidos/${formadorAtribuidoId}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-curso', cursoId] }),
  })
}

export function useGuardarAvaliacao(cursoId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { utilizador_id: number; nota: string; aproveitamento: Aproveitamento; observacoes: string }) => {
      const { data } = await api.put(`/cursos/${cursoId}/avaliacoes`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-curso', cursoId] }),
  })
}
