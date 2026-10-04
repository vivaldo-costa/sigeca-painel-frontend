import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { EventoRubrica, EventoDespesa, EventoReceita, ResumoFinancasEvento, EventoEstorno } from '@/types/eventoFinancas'

export function useResumoFinancasEvento(atividadeId: number) {
  return useQuery({
    queryKey: ['painel-evento-financas-resumo', atividadeId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: ResumoFinancasEvento }>(`/acampamentos/financas/${atividadeId}/resumo`)
      return data.dados
    },
  })
}

export function useEventoRubricas(atividadeId: number) {
  return useQuery({
    queryKey: ['painel-evento-rubricas', atividadeId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: EventoRubrica[] }>(`/acampamentos/financas/${atividadeId}/rubricas`)
      return data.dados
    },
  })
}

export function useCriarRubrica(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ nome, valor_previsto }: { nome: string; valor_previsto: string }) => {
      const { data } = await api.post(`/acampamentos/financas/${atividadeId}/rubricas`, { nome, valor_previsto })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-evento-rubricas', atividadeId] }),
  })
}

export function useEventoDespesas(atividadeId: number) {
  return useQuery({
    queryKey: ['painel-evento-despesas', atividadeId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: EventoDespesa[] }>(`/acampamentos/financas/${atividadeId}/despesas`)
      return data.dados
    },
  })
}

export function useCriarDespesa(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { rubrica_id: number | ''; descricao: string; valor: string; fornecedor: string; estado: string }) => {
      const { data } = await api.post(`/acampamentos/financas/${atividadeId}/despesas`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-evento-despesas', atividadeId] })
      queryClient.invalidateQueries({ queryKey: ['painel-evento-financas-resumo', atividadeId] })
      queryClient.invalidateQueries({ queryKey: ['painel-evento-rubricas', atividadeId] })
    },
  })
}

export function useAtualizarDespesa(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number; descricao: string; valor: string; fornecedor: string; estado: string; justificacao?: string }) => {
      const { data } = await api.put(`/acampamentos/financas/despesas/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-evento-despesas', atividadeId] })
      queryClient.invalidateQueries({ queryKey: ['painel-evento-financas-resumo', atividadeId] })
      queryClient.invalidateQueries({ queryKey: ['painel-evento-rubricas', atividadeId] })
    },
  })
}

export function useEventoReceitas(atividadeId: number) {
  return useQuery({
    queryKey: ['painel-evento-receitas', atividadeId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: EventoReceita[] }>(`/acampamentos/financas/${atividadeId}/receitas`)
      return data.dados
    },
  })
}

export function useCriarReceita(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { delegacao_id: number | ''; descricao: string; valor: string }) => {
      const { data } = await api.post(`/acampamentos/financas/${atividadeId}/receitas`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-evento-receitas', atividadeId] })
      queryClient.invalidateQueries({ queryKey: ['painel-evento-financas-resumo', atividadeId] })
    },
  })
}

export function useValidarReceita(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch(`/acampamentos/financas/receitas/${id}/validar`, {})
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-evento-receitas', atividadeId] })
      queryClient.invalidateQueries({ queryKey: ['painel-evento-financas-resumo', atividadeId] })
    },
  })
}

export function useEstornosReceita(receitaId: number | null) {
  return useQuery({
    queryKey: ['painel-evento-estornos', receitaId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: EventoEstorno[] }>(`/acampamentos/financas/receitas/${receitaId}/estornos`)
      return data.dados
    },
    enabled: receitaId !== null,
  })
}

export function useCriarEstorno(atividadeId: number, receitaId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { valor: string; motivo: string }) => {
      const { data } = await api.post(`/acampamentos/financas/receitas/${receitaId}/estornos`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-evento-estornos', receitaId] })
      queryClient.invalidateQueries({ queryKey: ['painel-evento-receitas', atividadeId] })
      queryClient.invalidateQueries({ queryKey: ['painel-evento-financas-resumo', atividadeId] })
    },
  })
}
