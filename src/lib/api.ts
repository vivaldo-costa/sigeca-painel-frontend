import axios from 'axios'
import { tokenStore } from './tokenStore'
import { API_BASE_URL } from './apiUrl'

/**
 * Cliente HTTP para a SIGECA API (Node.js + Express + JWT) — a mesma API
 * usada pelo Portal do Escuteiro (login partilhado). Sem prefixo /painel:
 * a API real usa uma unica base plana /api/v1 para tudo.
 *
 * Auth por Bearer token (nao cookie de sessao), envelope de resposta em
 * portugues ({ sucesso, dados, mensagem }), e refresh automatico de token
 * expirado — ver sigeca-portal/src/lib/api.ts para a mesma logica comentada
 * em detalhe.
 */
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

export interface ApiEnvelope<T> {
  sucesso: boolean
  dados?: T
  mensagem?: string
  detalhes?: unknown
}

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshEmCurso: Promise<string | null> | null = null

async function tentarRefresh(): Promise<string | null> {
  const refreshToken = tokenStore.getRefresh()
  if (!refreshToken) return null

  if (!refreshEmCurso) {
    refreshEmCurso = axios
      .post(`${API_BASE_URL}/api/v1/auth/refresh`, { refreshToken })
      .then((res) => {
        const novoAccess = res.data.accessToken as string
        tokenStore.set(novoAccess)
        return novoAccess
      })
      .catch(() => {
        tokenStore.clear()
        return null
      })
      .finally(() => {
        refreshEmCurso = null
      })
  }
  return refreshEmCurso
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const novoToken = await tentarRefresh()
      if (novoToken) {
        original.headers.Authorization = `Bearer ${novoToken}`
        return api(original)
      }
      const current = window.location.pathname
      if (current !== '/login') {
        window.location.href = `/login?redirect=${encodeURIComponent(current)}`
      }
    }
    return Promise.reject(error)
  }
)

export function getApiErrorMessage(error: unknown, fallback = 'Ocorreu um erro. Tenta novamente.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiEnvelope<unknown> | undefined
    if (data?.mensagem) return data.mensagem
  }
  return fallback
}
