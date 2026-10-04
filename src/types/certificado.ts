export type TipoCertificado = 'certificado' | 'declaracao' | 'diploma'

export interface CertificadoPainel {
  id: number
  numero_unico: string
  tipo: TipoCertificado
  titulo: string
  utilizador_id: number
  utilizador_nome: string
  codigo_associado: string
  referencia_tipo: string | null
  referencia_id: number | null
  pdf_path: string | null
  codigo_verificacao: string
  emitido_por: number | null
  emitido_por_nome: string | null
  validade: string | null
  ativo: number
  motivo_revogacao: string | null
  created_at: string
}

export interface EmitirCertificadoPayload {
  tipo: TipoCertificado
  titulo: string
  utilizador_id: number | ''
  validade: string
}
