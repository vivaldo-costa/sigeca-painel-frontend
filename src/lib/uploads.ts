import { API_BASE_URL } from './apiUrl'

/**
 * A API serve em /uploads/<subpasta>/<ficheiro> SÓ as pastas PÚBLICAS
 * (imagens sem dados sensíveis, mostradas em <img> a qualquer pessoa) —
 * ver sigeca-api/src/utils/pastasUploads.js. Nomes de subpasta alinhados
 * com a estrutura real de /uploads: 'avatar' (fotos de utilizador — não
 * 'perfis'), 'eventos' (Actividades) e 'formacoes' (Formações) — cada uma
 * com a sua pasta própria, em vez de partilharem uma só 'atividades'.
 *
 * Ficheiros PRIVADOS (comprovativos, certificados, denúncias, documentos de
 * candidatos/eventos/turmas…) NÃO passam por aqui: a API responde 404 em
 * /uploads. Usa `abrirFicheiroProtegido` (lib/ficheiros.ts) ou o componente
 * <LinkFicheiroProtegido>, que pedem o ficheiro com o token.
 */
export type PastaPublica = 'avatar' | 'produtos' | 'eventos' | 'formacoes' | 'votacoes' | 'aparencia' | 'cartao' | 'eventos-galeria'

const PASTAS_PUBLICAS: ReadonlySet<string> = new Set<PastaPublica>(['avatar', 'produtos', 'eventos', 'formacoes', 'votacoes', 'aparencia', 'cartao', 'eventos-galeria'])

export function uploadUrl(subpasta: PastaPublica, ficheiro: string | null | undefined): string | null {
  if (!ficheiro || !PASTAS_PUBLICAS.has(subpasta)) return null
  return `${API_BASE_URL}/uploads/${subpasta}/${encodeURIComponent(ficheiro)}`
}
