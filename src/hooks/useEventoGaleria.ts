import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { FotoGaleriaAtividade } from '@/types/atividade'

export function useGaleriaAtividade(atividadeId: number | null) {
  return useQuery({
    queryKey: ['painel-galeria-atividade', atividadeId],
    queryFn: async () => {
      const { data } = await api.get<{ dados: FotoGaleriaAtividade[] }>(`/galeria-atividades/${atividadeId}`)
      return data.dados
    },
    enabled: atividadeId !== null,
  })
}

export function useAdicionarFotosGaleria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ficheiros }: { id: number; ficheiros: File[] }) => {
      const form = new FormData()
      ficheiros.forEach((f) => form.append('fotos', f))
      const { data } = await api.post<{ dados: FotoGaleriaAtividade[] }>(`/galeria-atividades/${id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['painel-galeria-atividade', id] })
    },
  })
}

export function useRemoverFotoGaleria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, imagemId }: { id: number; imagemId: number }) => {
      const { data } = await api.delete<{ dados: FotoGaleriaAtividade[] }>(`/galeria-atividades/${id}/${imagemId}`)
      return data
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['painel-galeria-atividade', id] })
    },
  })
}
