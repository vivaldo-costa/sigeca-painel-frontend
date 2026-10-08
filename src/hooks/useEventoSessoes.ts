import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type TipoSessao = 'painel' | 'oficina'

export interface SessaoEvento {
  id: number
  atividade_id: number
  tipo: TipoSessao
  painel_id: number | null
  painel_titulo: string | null
  titulo: string
  descricao: string | null
  /** Quem dá a sessão (texto livre). */
  orador: string | null
  /** Dirigente responsável (utilizador do sistema). */
  responsavel_id: number | null
  responsavel_nome: string | null
  responsavel_codigo: string | null
  /** Texto livre antigo — só se mostra quando não há responsavel_id. */
  responsavel: string | null
  data: string | null
  hora_inicio: string | null
  hora_fim: string | null
  local: string | null
  vagas: number | null
  total_participantes: number
}

export interface SessoesEvento {
  limite_paineis: number | null
  limite_oficinas: number | null
  sessoes: SessaoEvento[]
}

export interface InscritoSessao {
  inscricao_id: number
  estado: string
  utilizador_id: number
  nome: string
  codigo_associado: string
  agrupamento_nome: string | null
  ab_agrupamento: string | null
  seccao_nome: string | null
  total_paineis: number
  total_oficinas: number
}

export interface ParticipanteSessao {
  id: number
  inscricao_id: number
  nome: string
  codigo_associado: string
  agrupamento_nome: string | null
  ab_agrupamento: string | null
}

export type SessaoPayload = Partial<Pick<SessaoEvento, 'titulo' | 'descricao' | 'orador' | 'responsavel' | 'responsavel_id' | 'data' | 'hora_inicio' | 'hora_fim' | 'local' | 'painel_id'>> & {
  tipo?: TipoSessao
  vagas?: number | string | null
}

const chave = (atividadeId: number) => ['painel-evento-sessoes', atividadeId]

export function useSessoesEvento(atividadeId: number) {
  return useQuery({
    queryKey: chave(atividadeId),
    queryFn: async () => (await api.get<{ dados: SessoesEvento }>(`/acampamentos/${atividadeId}/sessoes`)).data.dados,
  })
}

export function useInscritosSessoes(atividadeId: number, ativo = true) {
  return useQuery({
    queryKey: [...chave(atividadeId), 'inscritos'],
    queryFn: async () => (await api.get<{ dados: InscritoSessao[] }>(`/acampamentos/${atividadeId}/sessoes/inscritos`)).data.dados,
    enabled: ativo,
  })
}

export function useParticipantesSessao(sessaoId: number | null) {
  return useQuery({
    queryKey: ['painel-evento-sessao-participantes', sessaoId],
    queryFn: async () => (await api.get<{ dados: ParticipanteSessao[] }>(`/acampamentos/sessoes/${sessaoId}/participantes`)).data.dados,
    enabled: sessaoId !== null,
  })
}

function useInvalidar(atividadeId: number) {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: chave(atividadeId) })
    qc.invalidateQueries({ queryKey: ['painel-evento-sessao-participantes'] })
  }
}

export function useGuardarSessao(atividadeId: number) {
  const invalidar = useInvalidar(atividadeId)
  return useMutation({
    mutationFn: async ({ id, payload }: { id?: number; payload: SessaoPayload }) =>
      (id ? api.put(`/acampamentos/sessoes/${id}`, payload) : api.post(`/acampamentos/${atividadeId}/sessoes`, payload)).then((r) => r.data),
    onSuccess: invalidar,
  })
}

export function useRemoverSessao(atividadeId: number) {
  const invalidar = useInvalidar(atividadeId)
  return useMutation({
    mutationFn: async (id: number) => (await api.delete(`/acampamentos/sessoes/${id}`)).data,
    onSuccess: invalidar,
  })
}

export function useDefinirLimitesSessoes(atividadeId: number) {
  const invalidar = useInvalidar(atividadeId)
  return useMutation({
    mutationFn: async (payload: { limite_paineis: number | null; limite_oficinas: number | null }) =>
      (await api.put(`/acampamentos/${atividadeId}/sessoes/limites`, payload)).data,
    onSuccess: invalidar,
  })
}

export function useAdicionarParticipantes(atividadeId: number) {
  const invalidar = useInvalidar(atividadeId)
  return useMutation({
    mutationFn: async ({ sessaoId, inscricaoIds }: { sessaoId: number; inscricaoIds: number[] }) =>
      (await api.post<{ mensagem: string }>(`/acampamentos/sessoes/${sessaoId}/participantes`, { inscricao_ids: inscricaoIds })).data,
    onSuccess: invalidar,
  })
}

export function useRetirarParticipante(atividadeId: number) {
  const invalidar = useInvalidar(atividadeId)
  return useMutation({
    mutationFn: async ({ sessaoId, inscricaoId }: { sessaoId: number; inscricaoId: number }) =>
      (await api.delete(`/acampamentos/sessoes/${sessaoId}/participantes/${inscricaoId}`)).data,
    onSuccess: invalidar,
  })
}
