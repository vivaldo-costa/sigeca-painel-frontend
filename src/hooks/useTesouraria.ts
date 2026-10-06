import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  MovimentoTesouraria, NivelTesouraria, NovoMovimentoPayload, NovoSaldoInicialPayload,
  RelatorioSeccaoTesouraria, RubricaTesouraria, SaldoTesouraria,
} from '@/types/tesouraria'

interface Conta { nivel: NivelTesouraria; estruturaId: number | null; dataInicio?: string; dataFim?: string }

function queryParams({ nivel, estruturaId, dataInicio, dataFim }: Conta) {
  return {
    nivel,
    ...(estruturaId === null ? {} : { estruturaId }),
    ...(dataInicio ? { dataInicio } : {}),
    ...(dataFim ? { dataFim } : {}),
  }
}

export function useRubricasTesouraria() {
  return useQuery({
    queryKey: ['painel-tesouraria-rubricas'],
    queryFn: async () => {
      const { data } = await api.get<{ dados: RubricaTesouraria[] }>('/tesouraria/rubricas')
      return data.dados
    },
  })
}

export function useSaldoTesouraria(conta: Conta | null) {
  return useQuery({
    queryKey: ['painel-tesouraria-saldo', conta],
    queryFn: async () => {
      const { data } = await api.get<{ dados: SaldoTesouraria }>('/tesouraria/saldo', { params: queryParams(conta!) })
      return data.dados
    },
    enabled: !!conta,
  })
}

export function useMovimentosTesouraria(conta: Conta | null) {
  return useQuery({
    queryKey: ['painel-tesouraria-movimentos', conta],
    queryFn: async () => {
      const { data } = await api.get<{ dados: MovimentoTesouraria[] }>('/tesouraria/movimentos', { params: queryParams(conta!) })
      return data.dados
    },
    enabled: !!conta,
  })
}

export function useRelatorioSeccoesTesouraria(conta: Conta | null) {
  return useQuery({
    queryKey: ['painel-tesouraria-relatorio-seccoes', conta],
    queryFn: async () => {
      const { data } = await api.get<{ dados: RelatorioSeccaoTesouraria[] }>('/tesouraria/relatorio-seccoes', { params: queryParams(conta!) })
      return data.dados
    },
    enabled: !!conta,
  })
}

function useInvalidarConta() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['painel-tesouraria-saldo'] })
    queryClient.invalidateQueries({ queryKey: ['painel-tesouraria-movimentos'] })
    queryClient.invalidateQueries({ queryKey: ['painel-tesouraria-relatorio-seccoes'] })
  }
}

export function useRegistarSaldoInicial() {
  const invalidar = useInvalidarConta()
  return useMutation({
    mutationFn: async (payload: NovoSaldoInicialPayload) => {
      const { data } = await api.post('/tesouraria/saldo-inicial', payload)
      return data
    },
    onSuccess: invalidar,
  })
}

export function useLancarEntrada() {
  const invalidar = useInvalidarConta()
  return useMutation({
    mutationFn: async (payload: NovoMovimentoPayload) => {
      const { data } = await api.post('/tesouraria/entradas', payload)
      return data
    },
    onSuccess: invalidar,
  })
}

export function useLancarSaida() {
  const invalidar = useInvalidarConta()
  return useMutation({
    mutationFn: async (payload: NovoMovimentoPayload) => {
      const { data } = await api.post('/tesouraria/saidas', payload)
      return data
    },
    onSuccess: invalidar,
  })
}

export function useRemoverMovimentoTesouraria() {
  const invalidar = useInvalidarConta()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/tesouraria/movimentos/${id}`)
      return data
    },
    onSuccess: invalidar,
  })
}

export function exportarMapaTesourariaUrl(conta: Conta, estruturaNome?: string) {
  const params = new URLSearchParams({ nivel: conta.nivel })
  if (conta.estruturaId !== null) params.set('estruturaId', String(conta.estruturaId))
  if (estruturaNome) params.set('estruturaNome', estruturaNome)
  if (conta.dataInicio) params.set('dataInicio', conta.dataInicio)
  if (conta.dataFim) params.set('dataFim', conta.dataFim)
  return `/tesouraria/exportar?${params.toString()}`
}
