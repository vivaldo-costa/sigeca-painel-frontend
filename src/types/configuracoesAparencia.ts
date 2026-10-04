export type TemaSigeca = 'claro' | 'escuro' | 'automatico'

export interface ConfiguracoesAparencia {
  id: number
  logo_principal_path: string | null
  logo_cabecalho_path: string | null
  logo_pdf_path: string | null
  logo_login_path: string | null
  favicon_path: string | null
  logo_mobile_path: string | null
  simbolo_path: string | null
  cor_primaria: string
  cor_secundaria: string
  cor_destaque: string
  cor_estado_sucesso: string
  cor_estado_erro: string
  cor_estado_aviso: string
  cor_estado_info: string
  tema: TemaSigeca
  atualizado_por: number | null
  updated_at: string
}

export const TIPOS_LOGO: { chave: 'logo_principal' | 'logo_cabecalho' | 'logo_pdf' | 'logo_login' | 'favicon' | 'logo_mobile' | 'simbolo'; label: string }[] = [
  { chave: 'logo_principal', label: 'Logo Principal' },
  { chave: 'logo_cabecalho', label: 'Logo do Cabeçalho' },
  { chave: 'logo_pdf', label: 'Logo para PDF' },
  { chave: 'logo_login', label: 'Logo do Login' },
  { chave: 'favicon', label: 'Favicon' },
  { chave: 'logo_mobile', label: 'Logo Mobile' },
  { chave: 'simbolo', label: 'Símbolo / Reduzido' },
]
