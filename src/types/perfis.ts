/** Visibilidade dos dados para quem tem o perfil. */
export type AmbitoPerfil = 'global' | 'diocese' | 'vigararia' | 'paroquia' | 'agrupamento' | 'seccao'
export const AMBITO_LABEL: Record<AmbitoPerfil, string> = {
  global: 'Nacional (vê tudo)',
  diocese: 'Diocese',
  vigararia: 'Vigararia',
  paroquia: 'Paróquia',
  agrupamento: 'Agrupamento',
  seccao: 'Secção',
}

export interface PerfilAcesso {
  id: number
  nome: string
  descricao: string | null
  protegido: boolean | number
  ambito: AmbitoPerfil
  created_at: string
  total_utilizadores: number
}

export interface Modulo {
  id: number
  chave: string
  label: string
  icone: string | null
  grupo: string
  ordem: number
}

export interface PermissaoModulo {
  modulo_id: number
  pode_ver: number
  pode_criar: number
  pode_editar: number
  pode_apagar: number
}

export interface PermissoesPerfil {
  modulos: Modulo[]
  permissoes: PermissaoModulo[]
}

export interface AcoesModulo {
  ver: boolean
  criar: boolean
  editar: boolean
  apagar: boolean
}

export type MapaPermissoes = Record<number, AcoesModulo>

export interface PerfilFormPayload {
  nome: string
  descricao: string
  ambito?: AmbitoPerfil
}
