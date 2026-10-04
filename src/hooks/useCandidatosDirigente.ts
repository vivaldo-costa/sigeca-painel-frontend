import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CandidatoResumo, CandidatoDetalhe, EtapaValidacao, DecisaoValidacao } from '@/types/candidatoDirigente'

export function useCandidatosDirigente(filtros: { dioceseId?: number; estado?: string; pesquisa?: string }) {
  return useQuery({
    queryKey: ['painel-candidatos-dirigente', filtros],
    queryFn: async () => {
      const { data } = await api.get<{ dados: CandidatoResumo[] }>('/candidatos-dirigente', { params: filtros })
      return data.dados
    },
  })
}

export function useCandidatoDirigente(id: number | undefined) {
  return useQuery({
    queryKey: ['painel-candidato-dirigente', id],
    queryFn: async () => {
      const { data } = await api.get<{ dados: CandidatoDetalhe }>(`/candidatos-dirigente/${id}`)
      return data.dados
    },
    enabled: id !== undefined,
  })
}

export function useRegistarCandidato() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      utilizador_id: number; agrupamento_id: number; diocese_id: number; vigararia_id?: number; paroquia_id?: number;
      formacao_pretendida_id: number; parecer_direccao_agrupamento: boolean;
    }) => {
      const { data } = await api.post<{ dados: CandidatoDetalhe }>('/candidatos-dirigente', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-candidatos-dirigente'] }),
  })
}

export function useAceitarTermoEtica(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/candidatos-dirigente/${id}/termo-etica`, {})
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-candidato-dirigente', id] }),
  })
}

export function useAdicionarDocumentoCandidato(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ ficheiro, tipo }: { ficheiro: File; tipo: string }) => {
      const form = new FormData()
      form.append('ficheiro', ficheiro)
      form.append('tipo', tipo)
      const { data } = await api.post(`/candidatos-dirigente/${id}/documentos`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-candidato-dirigente', id] }),
  })
}

export function useRegistarDecisao(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { etapa: EtapaValidacao; decisao: DecisaoValidacao; checklist?: Record<string, boolean>; observacoes?: string; motivo?: string }) => {
      const { data } = await api.post<{ dados: CandidatoDetalhe; mensagem: string }>(`/candidatos-dirigente/${id}/validacoes`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-candidato-dirigente', id] })
      queryClient.invalidateQueries({ queryKey: ['painel-candidatos-dirigente'] })
    },
  })
}

export function useResubmeterCandidato(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/candidatos-dirigente/${id}/resubmeter`, {})
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-candidato-dirigente', id] })
      queryClient.invalidateQueries({ queryKey: ['painel-candidatos-dirigente'] })
    },
  })
}

export function useEmitirCertificado(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ dados: CandidatoDetalhe; mensagem: string }>(`/candidatos-dirigente/${id}/certificado`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-candidato-dirigente', id] })
      queryClient.invalidateQueries({ queryKey: ['painel-candidatos-dirigente'] })
    },
  })
}

export function useRegistarPromessa(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { data_promessa: string; local: string; responsavel_id: number; observacoes?: string; ficheiro?: File }) => {
      const form = new FormData()
      form.append('data_promessa', payload.data_promessa)
      form.append('local', payload.local)
      form.append('responsavel_id', String(payload.responsavel_id))
      if (payload.observacoes) form.append('observacoes', payload.observacoes)
      if (payload.ficheiro) form.append('ficheiro', payload.ficheiro)
      const { data } = await api.post(`/candidatos-dirigente/${id}/promessa`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-candidato-dirigente', id] })
      queryClient.invalidateQueries({ queryKey: ['painel-candidatos-dirigente'] })
    },
  })
}
