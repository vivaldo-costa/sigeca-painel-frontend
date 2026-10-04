/**
 * Em desenvolvimento, o Painel corre no mesmo host que o Vite (localhost),
 * e o proxy em vite.config.ts encaminha /api e /uploads para api.aeca.ao —
 * por isso um caminho relativo chega.
 *
 * Em produção, o Painel (painel.aeca.ao) e a API (api.aeca.ao) ficam em
 * domínios diferentes, então é preciso a URL absoluta — definida em
 * VITE_API_URL no momento do build (.env.production).
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''
