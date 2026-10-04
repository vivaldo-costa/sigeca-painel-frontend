import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { EmailTemplate, EmailTemplatePayload } from '@/types/emailTemplate'

export function useEmailTemplates() {
  return useQuery({
    queryKey: ['painel-email-templates'],
    queryFn: async () => {
      const { data } = await api.get<{ dados: EmailTemplate[] }>('/email-templates')
      return data.dados
    },
  })
}

export function useEmailTemplate(id: number | undefined) {
  return useQuery({
    queryKey: ['painel-email-template', id],
    queryFn: async () => {
      const { data } = await api.get<{ dados: EmailTemplate }>(`/email-templates/${id}`)
      return data.dados
    },
    enabled: id !== undefined,
  })
}

export function useAtualizarEmailTemplate(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: EmailTemplatePayload) => {
      const { data } = await api.put<{ dados: EmailTemplate }>(`/email-templates/${id}`, payload)
      return data.dados
    },
    onSuccess: (dados) => {
      queryClient.setQueryData(['painel-email-template', id], dados)
      queryClient.invalidateQueries({ queryKey: ['painel-email-templates'] })
    },
  })
}
