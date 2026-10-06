import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CertificadoPainel, EmitirCertificadoPayload } from '@/types/certificado'

export function useCertificados(pesquisa: string, tipo: string) {
  return useQuery({
    queryKey: ['painel-certificados', pesquisa, tipo],
    queryFn: async () => {
      const { data } = await api.get<{ dados: CertificadoPainel[] }>('/certificados', { params: { pesquisa, tipo } })
      return data.dados
    },
  })
}

export function useEmitirCertificado() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: EmitirCertificadoPayload) => {
      const { data } = await api.post('/certificados', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-certificados'] }),
  })
}

export function useRevogarCertificado() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, motivo }: { id: number; motivo: string }) => {
      const { data } = await api.patch(`/certificados/${id}/revogar`, { motivo })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-certificados'] }),
  })
}

// ── Modelos (templates) da certificação digital ────────────────────
export interface ModeloCertificado {
  tipo: 'certificado' | 'declaracao' | 'diploma'
  orientacao: 'landscape' | 'portrait'
  cor_primaria: string
  cor_texto: string
  cabecalho: string
  subcabecalho: string | null
  titulo_documento: string | null
  texto_introducao: string
  texto_corpo: string | null
  texto_rodape: string | null
  assinatura1_nome: string | null
  assinatura1_cargo: string | null
  assinatura2_nome: string | null
  assinatura2_cargo: string | null
  logotipo: string | null
  imagem_fundo: string | null
  mostrar_borda: number | boolean
  mostrar_qr: number | boolean
}

export function useModelosCertificado() {
  return useQuery({
    queryKey: ['certificado-modelos'],
    queryFn: async () => {
      const { data } = await api.get<{ dados: ModeloCertificado[] }>('/certificados/modelos')
      return data.dados
    },
  })
}

export function useGuardarModeloCertificado() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ tipo, form }: { tipo: string; form: FormData }) => {
      const { data } = await api.put(`/certificados/modelos/${tipo}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['certificado-modelos'] }),
  })
}

/** Pré-visualização em PDF com os valores do formulário (ainda não guardados). */
export async function preVisualizarModeloCertificado(tipo: string, valores: Partial<ModeloCertificado>) {
  const resposta = await api.post(`/certificados/modelos/${tipo}/preview`, valores, { responseType: 'blob' })
  const url = window.URL.createObjectURL(resposta.data)
  window.open(url, '_blank')
  setTimeout(() => window.URL.revokeObjectURL(url), 60_000)
}
