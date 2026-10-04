import { useAuthStore } from '@/store/auth'

export interface AcoesPermitidas {
  ver: boolean
  criar: boolean
  editar: boolean
  apagar: boolean
}

const SEM_ACESSO: AcoesPermitidas = { ver: false, criar: false, editar: false, apagar: false }
const ACESSO_TOTAL: AcoesPermitidas = { ver: true, criar: true, editar: true, apagar: true }

/**
 * O que o utilizador autenticado pode fazer no módulo `moduloChave`
 * (tem de bater certo com `modulos.chave` na BD — ex.: 'Dioceses',
 * 'Vigararias / Zonas', 'Escuteiros'). ADMIN tem sempre tudo, tal como no
 * backend (`permissao.middleware.js` também dá bypass total ao ADMIN).
 * Sem correspondência na matriz (ex.: um módulo sem linha seedada para
 * aquele perfil), o resultado é "sem acesso" — nunca assume permissão.
 */
export function usePermissao(moduloChave: string): AcoesPermitidas {
  const perfilNome = useAuthStore((s) => s.user?.perfil_nome)
  const permissoes = useAuthStore((s) => s.permissoes)

  if (perfilNome === 'ADMIN') return ACESSO_TOTAL

  const modulo = permissoes.find((p) => p.chave === moduloChave)
  if (!modulo) return SEM_ACESSO

  return {
    ver: !!modulo.pode_ver,
    criar: !!modulo.pode_criar,
    editar: !!modulo.pode_editar,
    apagar: !!modulo.pode_apagar,
  }
}
