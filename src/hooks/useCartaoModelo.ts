import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CartaoModelo, CartaoEstatisticas } from '@/types/cartaoModelo'

export function useCartaoModelo() {
  return useQuery({
    queryKey: ['painel-cartao-modelo'],
    queryFn: async () => {
      const { data } = await api.get<{ dados: CartaoModelo }>('/cartao-modelo')
      return data.dados
    },
  })
}

export function useAtualizarCartaoModelo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<CartaoModelo>) => {
      const { data } = await api.put<{ dados: CartaoModelo }>('/cartao-modelo', payload)
      return data.dados
    },
    onSuccess: (dados) => queryClient.setQueryData(['painel-cartao-modelo'], dados),
  })
}

export function useAtualizarLogoCartao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ficheiro: File) => {
      const form = new FormData()
      form.append('ficheiro', ficheiro)
      const { data } = await api.post<{ dados: CartaoModelo }>('/cartao-modelo/logo', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      return data.dados
    },
    onSuccess: (dados) => queryClient.setQueryData(['painel-cartao-modelo'], dados),
  })
}

export function useAtualizarImagemFundoCartao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ficheiro: File) => {
      const form = new FormData()
      form.append('ficheiro', ficheiro)
      const { data } = await api.post<{ dados: CartaoModelo }>('/cartao-modelo/imagem-fundo', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      return data.dados
    },
    onSuccess: (dados) => queryClient.setQueryData(['painel-cartao-modelo'], dados),
  })
}

export function useCartaoEstatisticas() {
  return useQuery({
    queryKey: ['painel-cartao-estatisticas'],
    queryFn: async () => {
      const { data } = await api.get<{ dados: CartaoEstatisticas }>('/cartao-modelo/estatisticas')
      return data.dados
    },
  })
}
