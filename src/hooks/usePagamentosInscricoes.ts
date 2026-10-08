import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

/** Módulo a partir do qual se gere — define a permissão e o tipo de actividade no servidor. */
export type BasePagamentosInscricoes = '/acampamentos' | '/atividades' | '/formacoes'

export type EstadoPagamentoInscricao = 'pendente' | 'confirmado' | 'rejeitado'

/** Comprovativo anexado pelo membro (portal) à sua inscrição — tabela inscricao_pagamentos. */
export interface PagamentoInscricao {
  id: number
  estado: EstadoPagamentoInscricao
  metodo_pagamento: string
  tipo_pagamento: 'completo' | 'prestacao'
  numero_prestacao: number | null
  transacao: string | null
  comprovativo_path: string | null
  comprovativo_nome: string | null
  motivo_rejeicao: string | null
  created_at: string
  confirmado_em: string | null
  confirmado_por_nome: string | null
  inscricao_id: number
  inscricao_estado: string
  atividade_id: number
  atividade_titulo: string
  atividade_valor: string
  num_prestacoes: number
  utilizador_id: number
  utilizador_nome: string
  codigo_associado: string
}

const chave = (base: BasePagamentosInscricoes, atividadeId: number) => ['painel-pagamentos-inscricoes', base, atividadeId]

export function usePagamentosInscricoes(base: BasePagamentosInscricoes, atividadeId: number) {
  return useQuery({
    queryKey: chave(base, atividadeId),
    queryFn: async () => (await api.get<{ dados: PagamentoInscricao[] }>(`${base}/${atividadeId}/pagamentos-inscricoes`)).data.dados,
  })
}

export function useDecidirPagamentoInscricao(base: BasePagamentosInscricoes, atividadeId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, accao, motivo }: { id: number; accao: 'validar' | 'rejeitar'; motivo?: string }) =>
      (await api.patch<{ mensagem: string }>(`${base}/pagamentos-inscricoes/${id}/${accao}`, accao === 'rejeitar' ? { motivo } : {})).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chave(base, atividadeId) })
      // o estado da inscrição muda (pago/confirmada) — a lista de inscritos também
      qc.invalidateQueries({ queryKey: ['painel-atividades'] })
      qc.invalidateQueries({ queryKey: ['painel-formacoes'] })
    },
  })
}
