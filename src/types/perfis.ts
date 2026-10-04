export interface PerfilAcesso {
  id: number
  nome: string
  descricao: string | null
  protegido: boolean | number
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
}
