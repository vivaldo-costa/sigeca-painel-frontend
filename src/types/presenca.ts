export interface CredencialAtividade {
  id: number
  utilizador_id: number
  nome: string
  codigo_associado: string
  foto: string | null
  token: string
  total_presencas: number
}

export interface PresencaRegistada {
  id: number
  metodo: 'qr' | 'manual'
  created_at: string
  nome: string
  codigo_associado: string
  registado_por_nome: string | null
}

export interface CredenciaisGeradasResultado {
  total_inscritos: number
  credenciais_criadas: number
}
