export interface TimelineEvento {
  tipo: 'transferencia' | 'categoria'
  /** Só nos registos de secção/cargo — permite remover a entrada. */
  registo_id?: number
  estado_ou_origem: string | null
  de_nome: string | null
  para_nome: string | null
  cargo_anterior: string | null
  cargo_novo: string | null
  motivo: string | null
  data_evento: string
  responsavel_nome: string | null
}
