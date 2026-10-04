export interface CartaoModelo {
  id: number
  titulo: string
  subtitulo: string
  cor_texto: string
  logo_path: string | null
  imagem_fundo_path: string | null
  texto_verso: string
  email_contacto: string | null
  website: string | null
  endereco: string | null
  mostrar_diocese: 0 | 1
  mostrar_vigararia: 0 | 1
  mostrar_categoria: 0 | 1
  mostrar_agrupamento: 0 | 1
  mostrar_grupo_sanguineo: 0 | 1
  mostrar_ano_escutista: 0 | 1
  atualizado_por: number | null
  updated_at: string
}

export interface CartaoEstatisticas {
  total_utilizadores: number
  gerados: number
  nao_gerados: number
  validos: number
  expirados: number
}
