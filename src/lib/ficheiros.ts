import axios from 'axios'
import { api } from './api'

/**
 * Pastas PRIVADAS de uploads/ (comprovativos, certificados, denúncias,
 * documentos…). A API NÃO as serve em /uploads — só por
 * GET /api/v1/ficheiros/:pasta/:nome, com o Bearer token e se o perfil
 * tiver acesso ao registo (dono, ou permissão do módulo + âmbito).
 * Ver sigeca-api/src/utils/pastasUploads.js.
 */
export type PastaPrivada =
  | 'candidatos-dirigente-documentos'
  | 'certificados'
  | 'comissoes-documentos'
  | 'comprovativos_inscricao'
  | 'comprovativos_pedidos'
  | 'denuncias'
  | 'documento-modelos'
  | 'documentos'
  | 'eventos-documentos'
  | 'eventos-pagamentos'
  | 'formacao-materiais'
  | 'promessas-evidencias'
  | 'recibos'
  | 'relatorios'
  | 'transferencias'
  | 'turmas-declaracoes'
  | 'turmas-documentos'
  | 'turmas-relatorios'
  | 'tutorias-evidencias'

const TIPOS_NO_BROWSER = /^(application\/pdf|image\/(png|jpe?g|webp|gif))/i

/** Caminho (relativo ao cliente `api`) de um ficheiro privado. */
export function caminhoFicheiroProtegido(pasta: PastaPrivada, nome: string): string {
  return `/ficheiros/${encodeURIComponent(pasta)}/${encodeURIComponent(nome)}`
}

/** Mensagem de erro da API mesmo quando a resposta veio como Blob (responseType: 'blob'). */
async function mensagemDeErro(error: unknown, fallback: string): Promise<string> {
  if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
    try {
      const json = JSON.parse(await error.response.data.text()) as { mensagem?: string }
      if (json.mensagem) return json.mensagem
    } catch { /* resposta sem JSON */ }
  }
  if (axios.isAxiosError(error) && error.response?.status === 403) return 'Não tens acesso a este ficheiro.'
  if (axios.isAxiosError(error) && error.response?.status === 404) return 'Ficheiro não encontrado.'
  return fallback
}

/**
 * Pede um ficheiro protegido com o token (nunca no URL) e abre-o: PDF e
 * imagens numa nova aba (leitor do browser), o resto é descarregado.
 * Para PDF/imagens (pela extensão de `nomeFicheiro`) a aba é aberta logo no
 * clique, antes do pedido, para os bloqueadores de pop-ups não a travarem.
 * Lança Error com mensagem pronta a mostrar.
 */
export async function abrirUrlProtegido(url: string, nomeFicheiro?: string) {
  const nome = nomeFicheiro || decodeURIComponent(url.split('?')[0].split('/').pop() || '') || 'ficheiro'
  const janela = /\.(pdf|png|jpe?g|webp|gif)$/i.test(nome) ? window.open('', '_blank') : null
  try {
    const resposta = await api.get<Blob>(url, { responseType: 'blob' })
    const blob = resposta.data
    const blobUrl = window.URL.createObjectURL(blob)
    if (TIPOS_NO_BROWSER.test(blob.type) && janela) {
      janela.location.href = blobUrl
    } else {
      janela?.close()
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = nome
      document.body.appendChild(link)
      link.click()
      link.remove()
    }
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000)
  } catch (error) {
    janela?.close()
    throw new Error(await mensagemDeErro(error, 'Não foi possível abrir o ficheiro.'))
  }
}

/** `nomeFicheiro` (nome original) só é usado se tiver a mesma extensão do ficheiro guardado. */
export function abrirFicheiroProtegido(pasta: PastaPrivada, nome: string, nomeFicheiro?: string) {
  const ext = nome.includes('.') ? nome.slice(nome.lastIndexOf('.')).toLowerCase() : ''
  const preferido = nomeFicheiro && ext && nomeFicheiro.toLowerCase().endsWith(ext) ? nomeFicheiro : nome
  return abrirUrlProtegido(caminhoFicheiroProtegido(pasta, nome), preferido)
}
