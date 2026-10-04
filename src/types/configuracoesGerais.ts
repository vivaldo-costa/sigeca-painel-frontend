export interface ConfiguracoesGerais {
  id: number
  nome_instituicao: string
  sigla: string
  endereco: string | null
  telefone: string | null
  email: string | null
  website: string | null
  facebook: string | null
  instagram: string | null
  youtube: string | null
  rodape: string | null
  idioma: string
  formato_data: string
  fuso_horario: string
  atualizado_por: number | null
  updated_at: string
}

export type ConfiguracoesGeraisPayload = Partial<Omit<ConfiguracoesGerais, 'id' | 'atualizado_por' | 'updated_at'>>
