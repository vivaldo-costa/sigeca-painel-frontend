import { create } from 'zustand'
import { api, getApiErrorMessage } from '@/lib/api'
import { tokenStore } from '@/lib/tokenStore'
import type { LoginPayload, UtilizadorPainel, ModuloPermissao } from '@/types/auth'

interface AuthState {
  user: UtilizadorPainel | null
  permissoes: ModuloPermissao[]
  status: 'idle' | 'loading' | 'authenticated' | 'guest' | 'aguarda2fa'
  error: string | null
  captchaExigido: boolean
  preAuthToken: string | null
  login: (payload: LoginPayload) => Promise<boolean>
  verificarSegundoFactor: (codigo: string) => Promise<boolean>
  logout: () => void
  hydrate: () => Promise<void>
}

/**
 * Login partilhado com o Portal do Escuteiro (mesma API, mesmo JWT). Nao ha
 * endpoint de logout no backend — "sair" e so limpar os tokens locais.
 * O guard de ProtectedRoute e que impede perfis ESCUTEIRO/DIRIGENTE de
 * aceder ao Painel (a API em si nao tem esse conceito de "app" separada).
 *
 * `permissoes` vem directamente da BD (perfil_permissoes + modulos), tanto
 * no login como no /auth/me — é a fonte de verdade para o que cada perfil
 * vê/cria/edita/apaga em cada módulo do Painel (ver hooks/usePermissao.ts).
 *
 * Secção 9 do roteiro — 2FA: se a conta tiver o 2FA activo, o login não dá
 * tokens finais de imediato — devolve `requer2FA` + um `preAuthToken` de
 * vida curta, e é preciso chamar `verificarSegundoFactor()` com o código
 * da app de autenticação (ou um código de recuperação) para completar.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  permissoes: [],
  status: 'idle',
  error: null,
  captchaExigido: false,
  preAuthToken: null,

  async login(payload) {
    set({ status: 'loading', error: null })
    try {
      const { data } = await api.post('/auth/login', payload)

      if (data.requer2FA) {
        set({ status: 'aguarda2fa', preAuthToken: data.preAuthToken, error: null })
        return false
      }

      tokenStore.set(data.accessToken, data.refreshToken)
      set({ user: data.utilizador, permissoes: data.permissoes ?? [], status: 'authenticated', error: null, captchaExigido: false })
      return true
    } catch (err) {
      const detalhes = (err as { response?: { data?: { detalhes?: { captchaExigido?: boolean; proximoExigeCaptcha?: boolean } } } })?.response?.data?.detalhes
      set({
        status: 'guest',
        error: getApiErrorMessage(err, 'Número SIGECA/email ou palavra-passe inválidos.'),
        captchaExigido: !!(detalhes?.captchaExigido || detalhes?.proximoExigeCaptcha),
      })
      return false
    }
  },

  async verificarSegundoFactor(codigo) {
    const preAuthToken = get().preAuthToken
    set({ status: 'loading', error: null })
    try {
      const { data } = await api.post('/auth/2fa/verificar', { preAuthToken, codigo })
      tokenStore.set(data.accessToken, data.refreshToken)
      set({ user: data.utilizador, permissoes: data.permissoes ?? [], status: 'authenticated', error: null, preAuthToken: null })
      return true
    } catch (err) {
      set({ status: 'aguarda2fa', error: getApiErrorMessage(err, 'Código inválido.') })
      return false
    }
  },

  logout() {
    tokenStore.clear()
    set({ user: null, permissoes: [], status: 'guest', preAuthToken: null })
  },

  async hydrate() {
    if (!tokenStore.getAccess() && !tokenStore.getRefresh()) {
      set({ status: 'guest' })
      return
    }
    set({ status: 'loading' })
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data.utilizador, permissoes: data.permissoes ?? [], status: 'authenticated' })
    } catch {
      tokenStore.clear()
      set({ user: null, permissoes: [], status: 'guest' })
    }
  },
}))
