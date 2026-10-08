import { useState, type ReactNode } from 'react'
import { abrirFicheiroProtegido, abrirUrlProtegido, type PastaPrivada } from '@/lib/ficheiros'
import { notificar } from '@/lib/notificar'
import { cn } from '@/lib/cn'

/**
 * Substitui `<a href={uploadUrl(pastaPrivada, …)}>` — os ficheiros privados
 * já não são servidos em /uploads. Ao clicar, pede o ficheiro à API com o
 * token (GET /ficheiros/:pasta/:nome) e abre-o (PDF/imagem) ou descarrega-o.
 * Com `url` (em vez de pasta/nome) faz o mesmo para uma rota dedicada da API
 * (ex.: `/certificados/:id/pdf`) — um `<a href>` simples não leva o token.
 */
export function LinkFicheiroProtegido({
  pasta, nome, url, nomeFicheiro, className, children,
}: {
  pasta?: PastaPrivada
  nome?: string | null
  url?: string
  nomeFicheiro?: string | null
  className?: string
  children: ReactNode
}) {
  const [aAbrir, setAAbrir] = useState(false)
  if (!url && (!pasta || !nome)) return null

  async function abrir(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (aAbrir) return
    setAAbrir(true)
    try {
      if (url) await abrirUrlProtegido(url, nomeFicheiro || undefined)
      else if (pasta && nome) await abrirFicheiroProtegido(pasta, nome, nomeFicheiro || undefined)
    } catch (err) {
      notificar.erro(err instanceof Error ? err.message : 'Não foi possível abrir o ficheiro.')
    } finally {
      setAAbrir(false)
    }
  }

  return (
    <button type="button" onClick={abrir} disabled={aAbrir} className={cn('text-left disabled:opacity-60', className)}>
      {children}
    </button>
  )
}
