export interface DocumentoModelo {
  id: number
  titulo: string
  descricao: string | null
  categoria: string
  nome_ficheiro: string
  extensao: string
  tamanho_bytes: number | null
  ordem: number
  activo: boolean | number
  created_at: string
  updated_at: string
  enviado_por_nome: string | null
}

export interface NovoDocumentoModeloPayload {
  titulo: string
  descricao?: string
  categoria?: string
  ordem?: number
  ficheiro: File
}

export interface EditarDocumentoModeloPayload {
  titulo?: string
  descricao?: string
  categoria?: string
  ordem?: number
  activo?: boolean
}
