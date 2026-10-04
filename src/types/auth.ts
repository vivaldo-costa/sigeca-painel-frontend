/**
 * Perfis reais (tabela `perfis` da BD) — sem SUPER_ADMIN nem GESTOR, que eu
 * tinha assumido antes de ver o schema. TECNICO tem "visibilidade de todo
 * o sistema" (ver perfis.descricao) — tratado como sem âmbito restrito,
 * tal como ADMIN, na Dashboard do Painel.
 */
export type Perfil = 'ADMIN' | 'ESCUTEIRO' | 'DIRIGENTE' | 'CONSULTOR' | 'TECNICO'

/**
 * Campos garantidos em qualquer resposta autenticada (GET /auth/me devolve
 * so estes, vindos do payload do JWT). Os restantes so vem no POST
 * /auth/login (linha completa de `utilizadores`, sem senha).
 */
export interface UtilizadorPainel {
  id: number
  codigo_associado: string
  nome: string
  perfil_id: number
  perfil_nome: Perfil
  foto?: string | null
  email?: string | null
  diocese_id?: number | null
}

export interface ModuloPermissao {
  chave: string
  pode_ver: number
  pode_criar: number
  pode_editar: number
  pode_apagar: number
}

export interface LoginPayload {
  /** Nº SIGECA (codigo_associado) OU email — a API aceita os dois no mesmo campo. */
  identificador: string
  senha: string
  captchaToken?: string
  captchaResposta?: string
}
