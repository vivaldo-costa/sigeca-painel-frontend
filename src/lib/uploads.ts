import { API_BASE_URL } from './apiUrl'

/**
 * A API serve ficheiros enviados em /uploads/<subpasta>/<ficheiro>
 * (ver app.js: express.static + upload.middleware.js: criarUpload(subpasta)).
 * Nomes de subpasta alinhados com a estrutura real de /uploads: 'avatar'
 * (fotos de utilizador — não 'perfis'), 'comprovativos_pedidos' (pagamentos/
 * checkout e regularização de censo — não 'comprovativos'), 'eventos'
 * (Actividades) e 'formacoes' (Formações) — cada uma com a sua pasta
 * própria, em vez de partilharem uma só 'atividades'.
 */
export function uploadUrl(
  subpasta: 'avatar' | 'comprovativos_pedidos' | 'produtos' | 'documentos' | 'transferencias' | 'eventos' | 'formacoes' | 'votacoes' | 'noticias' | 'denuncias' | 'eventos-documentos' | 'comissoes-documentos' | 'candidatos-dirigente-documentos' | 'tutorias-evidencias' | 'aparencia' | 'cartao' | 'eventos-galeria' | 'comprovativos_inscricao' | 'eventos-pagamentos',
  ficheiro: string | null | undefined,
): string | null {
  if (!ficheiro) return null
  return `${API_BASE_URL}/uploads/${subpasta}/${ficheiro}`
}
