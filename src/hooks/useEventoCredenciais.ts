import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { EventoCredencial, RegistoQr, TipoAcaoQr } from '@/types/eventoCampo'

export function useEventoCredenciais(atividadeId: number) {
  return useQuery({
    queryKey: ['painel-evento-credenciais', atividadeId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: EventoCredencial[] }>(`/acampamentos/${atividadeId}/credenciais`)
      return data.dados
    },
  })
}

export function useGerarCredenciaisEvento(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ dados: { total_inscritos: number; credenciais_criadas: number }; mensagem: string }>(`/acampamentos/${atividadeId}/credenciais/gerar`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-evento-credenciais', atividadeId] }),
  })
}

export function useEventoRegistosQr(atividadeId: number, tipoAcao?: string) {
  return useQuery({
    queryKey: ['painel-evento-registos-qr', atividadeId, tipoAcao],
    queryFn: async () => {
      const { data } = await api.get<{ dados: RegistoQr[] }>(`/acampamentos/${atividadeId}/registos-qr`, { params: { tipo_acao: tipoAcao } })
      return data.dados
    },
  })
}

export function useRegistarAcaoQr(atividadeId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { token: string; tipo_acao: TipoAcaoQr; zona_id?: number; detalhes?: Record<string, string> }) => {
      const { data } = await api.post<{ dados: { credencial: { nome: string } }; mensagem: string }>('/acampamentos/registos-qr/scan', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel-evento-registos-qr', atividadeId] })
      queryClient.invalidateQueries({ queryKey: ['painel-evento-credenciais', atividadeId] })
    },
  })
}
