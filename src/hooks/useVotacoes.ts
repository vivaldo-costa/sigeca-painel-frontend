import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { VotacaoPainel, VotacaoFormPayload } from '@/types/votacao'

export function useVotacoes() {
  return useQuery({
    queryKey: ['painel-votacoes'],
    queryFn: async () => {
      const { data } = await api.get<{ dados: VotacaoPainel[] }>('/votacoes')
      return data.dados
    },
  })
}

function paraFormData(payload: VotacaoFormPayload, imagem: File | null) {
  const form = new FormData()
  form.append('titulo', payload.titulo)
  form.append('descricao', payload.descricao)
  form.append('data_inicio', payload.data_inicio)
  form.append('data_fim', payload.data_fim)
  form.append('ativo', payload.ativo ? '1' : '0')
  if (imagem) form.append('imagem', imagem)
  if (payload.imagens_manter) form.append('imagens_manter', JSON.stringify(payload.imagens_manter))
  for (const f of payload.imagens_novas ?? []) form.append('imagens', f)
  return form
}

export function useCriarVotacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ payload, imagem }: { payload: VotacaoFormPayload; imagem: File | null }) => {
      const { data } = await api.post('/votacoes', paraFormData(payload, imagem), { headers: { 'Content-Type': 'multipart/form-data' } })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-votacoes'] }),
  })
}

export function useAtualizarVotacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload, imagem }: { id: number; payload: VotacaoFormPayload; imagem: File | null }) => {
      const { data } = await api.put(`/votacoes/${id}`, paraFormData(payload, imagem), { headers: { 'Content-Type': 'multipart/form-data' } })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-votacoes'] }),
  })
}

export function useRemoverVotacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/votacoes/${id}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-votacoes'] }),
  })
}
