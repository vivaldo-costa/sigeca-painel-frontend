const CHAVE_ACCESS = 'sigeca_access_token'
const CHAVE_REFRESH = 'sigeca_refresh_token'

/**
 * A API do SIGECA usa JWT (Bearer token), não sessão por cookie: um
 * accessToken de curta duração (8h) + um refreshToken (30d). Guardamos os
 * dois em localStorage — não há endpoint de logout no backend (não existe
 * sessão a invalidar do lado do servidor), por isso "sair" é só limpar
 * estes tokens no browser.
 */
export const tokenStore = {
  getAccess: () => localStorage.getItem(CHAVE_ACCESS),
  getRefresh: () => localStorage.getItem(CHAVE_REFRESH),
  set(accessToken: string, refreshToken?: string) {
    localStorage.setItem(CHAVE_ACCESS, accessToken)
    if (refreshToken) localStorage.setItem(CHAVE_REFRESH, refreshToken)
  },
  clear() {
    localStorage.removeItem(CHAVE_ACCESS)
    localStorage.removeItem(CHAVE_REFRESH)
  },
}
