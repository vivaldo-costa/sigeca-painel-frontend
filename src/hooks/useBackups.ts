import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { aguardarTrabalho } from '@/lib/trabalhos'
import type { Backup, ResultadoImportacao } from '@/types/backup'

export function useBackups() {
  return useQuery({
    queryKey: ['painel-backups'],
    queryFn: async () => {
      const { data } = await api.get<{ dados: Backup[] }>('/backups')
      return data.dados
    },
  })
}

export function useCriarBackup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ dados: { trabalho_id: number } }>('/backups')
      return aguardarTrabalho<Backup>(data.dados.trabalho_id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-backups'] }),
  })
}

export function useRemoverBackup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (nome: string) => {
      const { data } = await api.delete(`/backups/${nome}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-backups'] }),
  })
}

export function useImportarBackup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ficheiro: File) => {
      const form = new FormData()
      form.append('ficheiro', ficheiro)
      const { data } = await api.post<{ dados: { trabalho_id: number } }>('/backups/importar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      const resultado = await aguardarTrabalho<ResultadoImportacao>(data.dados.trabalho_id)
      return { dados: resultado, mensagem: `Importação concluída. Cópia de segurança do estado anterior: ${resultado.salvaguarda}.` }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel-backups'] }),
  })
}

export function useDownloadBackup() {
  return useMutation({
    mutationFn: async (nome: string) => {
      const resposta = await api.get(`/backups/${nome}/download`, { responseType: 'blob' })
      const url = URL.createObjectURL(resposta.data as Blob)
      const link = document.createElement('a')
      link.href = url
      link.download = nome
      link.click()
      URL.revokeObjectURL(url)
    },
  })
}
