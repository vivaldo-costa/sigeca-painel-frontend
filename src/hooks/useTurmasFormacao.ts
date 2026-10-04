import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { TurmaResumo, TurmaDetalhe, PapelFormador, TipoDocumentoTurma, DecisaoAutorizacao } from '@/types/turmaFormacao'

export function useTurmasFormacao(filtros: { dioceseId?: number; estado?: string; formacaoId?: number }) {
  return useQuery({
    queryKey: ['painel-turmas-formacao', filtros],
    queryFn: async () => {
      const { data } = await api.get<{ dados: TurmaResumo[] }>('/turmas-formacao', { params: filtros })
      return data.dados
    },
  })
}

export function useTurmaFormacao(id: number | undefined) {
  return useQuery({
    queryKey: ['painel-turma-formacao', id],
    queryFn: async () => {
      const { data } = await api.get<{ dados: TurmaDetalhe }>(`/turmas-formacao/${id}`)
      return data.dados
    },
    enabled: id !== undefined,
  })
}

export function useCriarTurma() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      formacao_id: number; diocese_id: number; data_prevista?: string; data_inicio?: string; data_fim?: string;
      local?: string; horario?: string; numero_previsto_participantes?: number; observacoes?: string;
    }) => {
      const { data } = await api.post<{ dados: TurmaDetalhe }>('/turmas-formacao', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-turmas-formacao'] }),
  })
}

function invalidarTurma(queryClient: ReturnType<typeof useQueryClient>, id: number) {
  queryClient.invalidateQueries({ queryKey: ['painel-turma-formacao', id] })
  queryClient.invalidateQueries({ queryKey: ['painel-turmas-formacao'] })
  queryClient.invalidateQueries({ queryKey: ['painel-candidatos-dirigente'] })
}

export function useAdicionarParticipante(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (candidato_id: number) => {
      const { data } = await api.post(`/turmas-formacao/${id}/participantes`, { candidato_id })
      return data
    },
    onSuccess: () => invalidarTurma(queryClient, id),
  })
}

export function useRemoverParticipante(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (candidatoId: number) => {
      const { data } = await api.delete(`/turmas-formacao/${id}/participantes/${candidatoId}`)
      return data
    },
    onSuccess: () => invalidarTurma(queryClient, id),
  })
}

export function useAdicionarFormador(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { formador_id: number; papel: PapelFormador }) => {
      const { data } = await api.post(`/turmas-formacao/${id}/formadores`, payload)
      return data
    },
    onSuccess: () => invalidarTurma(queryClient, id),
  })
}

export function useRemoverFormador(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (formadorId: number) => {
      const { data } = await api.delete(`/turmas-formacao/${id}/formadores/${formadorId}`)
      return data
    },
    onSuccess: () => invalidarTurma(queryClient, id),
  })
}

export function useAdicionarDocumentoTurma(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ ficheiro, tipo }: { ficheiro: File; tipo: TipoDocumentoTurma }) => {
      const form = new FormData()
      form.append('ficheiro', ficheiro)
      form.append('tipo', tipo)
      const { data } = await api.post(`/turmas-formacao/${id}/documentos`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-turma-formacao', id] }),
  })
}

export function useSubmeterTurma(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/turmas-formacao/${id}/submeter`, {})
      return data
    },
    onSuccess: () => invalidarTurma(queryClient, id),
  })
}

export function useDecidirAutorizacao(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { decisao: DecisaoAutorizacao; motivo?: string }) => {
      const { data } = await api.post<{ dados: TurmaDetalhe; mensagem: string }>(`/turmas-formacao/${id}/autorizacao`, payload)
      return data
    },
    onSuccess: () => invalidarTurma(queryClient, id),
  })
}

export function useIniciarPreparacao(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/turmas-formacao/${id}/preparacao`, {})
      return data
    },
    onSuccess: () => invalidarTurma(queryClient, id),
  })
}

export function useIniciarRealizacao(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/turmas-formacao/${id}/realizacao`, {})
      return data
    },
    onSuccess: () => invalidarTurma(queryClient, id),
  })
}

export function useMarcarRealizada(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { resumo: string; participantes_concluintes?: number; observacoes?: string }) => {
      const { data } = await api.post(`/turmas-formacao/${id}/marcar-realizada`, payload)
      return data
    },
    onSuccess: () => invalidarTurma(queryClient, id),
  })
}

export function useEncerrarTurma(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/turmas-formacao/${id}/encerrar`, {})
      return data
    },
    onSuccess: () => invalidarTurma(queryClient, id),
  })
}
