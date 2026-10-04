export type TipoDocumentoEvento = 'regulamento' | 'programa' | 'lista_material' | 'comprovativo' | 'anexo'

export const LABEL_TIPO_DOCUMENTO_EVENTO: Record<TipoDocumentoEvento, string> = {
  regulamento: 'Regulamento',
  programa: 'Programa',
  lista_material: 'Lista de Material',
  comprovativo: 'Comprovativo',
  anexo: 'Anexo',
}

export interface DocumentoEvento {
  id: number
  tipo: TipoDocumentoEvento
  descricao: string | null
  data_documento: string | null
  nome_ficheiro: string
  path: string
  enviado_por_nome: string | null
  created_at: string
}
