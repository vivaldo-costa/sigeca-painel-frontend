import { API_BASE_URL } from '@/lib/apiUrl'
import { notificar } from '@/lib/notificar'

/**
 * Link externo de um produto, para partilhar nas redes sociais. Aponta
 * para a página de partilha da API (que mostra foto/nome/preço na
 * pré-visualização do Facebook/WhatsApp/Instagram) e reencaminha para o
 * produto no Portal.
 */
export function linkExternoProduto(produtoId: number): string {
  const base = (API_BASE_URL || window.location.origin).replace(/\/+$/, '')
  return `${base}/partilhar/produto/${produtoId}`
}

export async function copiarLinkProduto(produtoId: number) {
  const link = linkExternoProduto(produtoId)
  try {
    await navigator.clipboard.writeText(link)
    notificar.sucesso('Link do produto copiado — já podes colar nas redes sociais.')
  } catch {
    window.prompt('Copia o link do produto:', link)
  }
}
