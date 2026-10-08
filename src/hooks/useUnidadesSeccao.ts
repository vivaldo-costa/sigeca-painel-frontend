import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { TipoUnidadeSeccao, UnidadeSeccao } from '@/types/unidadeSeccao'

/**
 * Catálogo global de Bandos/Patrulhas/Equipas — partilhado entre todos os
 * Agrupamentos (ver `unidades_seccao` na API). `tipo` em falta devolve os
 * três tipos juntos.
 */
export function useUnidadesSeccao(tipo?: TipoUnidadeSeccao) {
  return useQuery({
    queryKey: ['unidades-seccao', tipo ?? 'todos'],
    queryFn: async () => {
      const { data } = await api.get<{ dados: UnidadeSeccao[] }>('/unidades-seccao', {
        params: tipo ? { tipo } : undefined,
      })
      return data.dados
    },
  })
}

export function useCriarUnidadeSeccao() {
  const queryClient = useQueryClient()
  return useMutation({
    // Deixa o 409 (nome já existe) propagar-se tal e qual — quem chama
    // trata-o com `extrairUnidadeExistente()` em vez de um erro genérico.
    mutationFn: async (payload: { tipo: TipoUnidadeSeccao; nome: string }) => {
      const { data } = await api.post<{ dados: UnidadeSeccao; mensagem?: string }>('/unidades-seccao', payload)
      return data.dados
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['unidades-seccao'] }),
  })
}

export function useRenomearUnidadeSeccao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, nome }: { id: number; nome: string }) => {
      const { data } = await api.put<{ dados: UnidadeSeccao }>(`/unidades-seccao/${id}`, { nome })
      return data.dados
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['unidades-seccao'] }),
  })
}

export function useEliminarUnidadeSeccao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/unidades-seccao/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['unidades-seccao'] }),
  })
}

/**
 * Extrai a unidade já existente devolvida pelo 409 ao tentar criar um nome
 * duplicado (`detalhes.unidade_existente`), para o chamador a poder
 * seleccionar automaticamente em vez de mostrar só um erro genérico.
 */
export function extrairUnidadeExistente(err: unknown): UnidadeSeccao | null {
  if (!axios.isAxiosError(err)) return null
  const detalhes = err.response?.data?.detalhes as { unidade_existente?: UnidadeSeccao } | undefined
  return detalhes?.unidade_existente ?? null
}

export interface MembroUnidadeSeccao {
  id: number
  nome: string
  codigo_associado: string
  estado: string
  cargo_funcao?: string | null
  seccao_nome: string | null
  agrupamento_nome: string | null
  ab_agrupamento: string | null
}

export interface UnidadeComMembros {
  id: number
  tipo: TipoUnidadeSeccao
  nome: string
  membros: MembroUnidadeSeccao[]
}

/**
 * Todas as unidades (de um tipo, ou só as indicadas em `ids`) com os seus
 * membros, num só pedido — usado pelo "Imprimir todos". Chamada pontual
 * (no clique), por isso não é uma query em cache.
 */
export async function obterUnidadesComMembros(params: { tipo?: TipoUnidadeSeccao; ids?: number[] }) {
  const { data } = await api.get<{ dados: UnidadeComMembros[] }>('/unidades-seccao/com-membros', {
    params: { tipo: params.tipo || undefined, ids: params.ids?.join(',') },
  })
  return data.dados
}

/** Membros de um Bando/Patrulha/Equipa (só os da área do perfil). */
export function useMembrosUnidadeSeccao(id: number | null) {
  return useQuery({
    queryKey: ['unidades-seccao-membros', id],
    queryFn: async () => (await api.get<{ dados: MembroUnidadeSeccao[] }>(`/unidades-seccao/${id}/membros`)).data.dados,
    enabled: id !== null,
  })
}

export function useAdicionarMembrosUnidade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, utilizadorIds }: { id: number; utilizadorIds: number[] }) =>
      (await api.post<{ mensagem: string }>(`/unidades-seccao/${id}/membros`, { utilizador_ids: utilizadorIds })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades-seccao-membros'] })
      queryClient.invalidateQueries({ queryKey: ['unidades-seccao'] })
      queryClient.invalidateQueries({ queryKey: ['painel-utilizadores'] })
    },
  })
}

export function useRetirarMembroUnidade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, utilizadorId }: { id: number; utilizadorId: number }) =>
      (await api.delete(`/unidades-seccao/${id}/membros/${utilizadorId}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades-seccao-membros'] })
      queryClient.invalidateQueries({ queryKey: ['unidades-seccao'] })
    },
  })
}
