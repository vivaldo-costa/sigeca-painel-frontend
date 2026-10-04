import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { uploadUrl } from '@/lib/uploads'
import type { ConfiguracoesAparencia } from '@/types/configuracoesAparencia'

/**
 * Aplica a Aparência configurada (secção 3.2 do roteiro) à aplicação
 * inteira, não só à própria página de Configurações — sem isto, a
 * página guardava dados que nunca mudavam nada visível. Corre mesmo
 * antes de autenticar (a página de login também precisa do logo/cores) —
 * por isso o endpoint é público.
 */
export function useAparenciaGlobal() {
  const { data } = useQuery({
    queryKey: ['aparencia-global'],
    queryFn: async () => {
      const { data } = await api.get<{ dados: ConfiguracoesAparencia }>('/configuracoes-aparencia')
      return data.dados
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  useEffect(() => {
    if (!data) return

    const raiz = document.documentElement
    raiz.style.setProperty('--cor-primaria', data.cor_primaria)
    raiz.style.setProperty('--cor-secundaria', data.cor_secundaria)
    raiz.style.setProperty('--cor-destaque', data.cor_destaque)
    raiz.style.setProperty('--cor-estado-sucesso', data.cor_estado_sucesso)
    raiz.style.setProperty('--cor-estado-erro', data.cor_estado_erro)
    raiz.style.setProperty('--cor-estado-aviso', data.cor_estado_aviso)
    raiz.style.setProperty('--cor-estado-info', data.cor_estado_info)

    const urlFavicon = uploadUrl('aparencia', data.favicon_path)
    if (urlFavicon) {
      const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
      if (link) link.href = urlFavicon
    }
  }, [data])

  return data
}
