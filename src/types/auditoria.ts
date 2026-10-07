export type AccaoAuditoria =
  | 'login' | 'logout' | 'login_falhado'
  | 'criacao' | 'edicao' | 'eliminacao'
  | 'alteracao_permissao' | 'alteracao_perfil'
  | 'operacao_financeira' | 'credenciamento'
  | 'importacao' | 'restauracao'

export const LABEL_ACCAO: Record<AccaoAuditoria, string> = {
  login: 'Início de sessão',
  logout: 'Logout',
  login_falhado: 'Início de sessão falhado',
  criacao: 'Criação',
  edicao: 'Edição',
  eliminacao: 'Eliminação',
  alteracao_permissao: 'Alteração de Permissão',
  alteracao_perfil: 'Alteração de Perfil',
  operacao_financeira: 'Operação Financeira',
  credenciamento: 'Credenciamento',
  importacao: 'Importação',
  restauracao: 'Restauração',
}

export interface EntradaAuditoria {
  id: number
  utilizador_id: number | null
  utilizador_nome: string | null
  codigo_associado: string | null
  perfil_nome: string | null
  accao: AccaoAuditoria
  modulo: string | null
  entidade_tipo: string | null
  entidade_id: number | null
  antes: Record<string, unknown> | null
  depois: Record<string, unknown> | null
  ip: string | null
  sucesso: number
  erro: string | null
  created_at: string
}

export interface FiltrosAuditoria {
  pagina?: number
  porPagina?: number
  dataInicio?: string
  dataFim?: string
  utilizadorId?: number
  perfilNome?: string
  dioceseId?: number
  agrupamentoId?: number
  modulo?: string
  accao?: string
  sucesso?: string
}
