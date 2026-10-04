import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { aguardarTrabalho } from '@/lib/trabalhos'
import type { AnaliseLegado, ResultadoImportacaoLegado } from '@/types/migracaoLegado'

export function useAnalisarLegado() {
  return useMutation({
    mutationFn: async (ficheiro: File) => {
      const form = new FormData()
      form.append('ficheiro', ficheiro)
      const { data } = await api.post<{ dados: { trabalho_id: number } }>('/migracao-legado/analisar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      return aguardarTrabalho<AnaliseLegado>(data.dados.trabalho_id)
    },
  })
}

export function useImportarLegado() {
  return useMutation({
    mutationFn: async (payload: { sessao: string; tabelas: string[]; substituirExistentes: boolean }) => {
      const { data } = await api.post<{ dados: { trabalho_id: number } }>('/migracao-legado/importar', payload)
      return aguardarTrabalho<ResultadoImportacaoLegado>(data.dados.trabalho_id)
    },
  })
}
