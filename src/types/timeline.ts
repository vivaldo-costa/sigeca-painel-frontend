export interface TimelineEvento {
  tipo: 'transferencia' | 'categoria'
  estado_ou_origem: string | null
  de_nome: string | null
  para_nome: string | null
  cargo_anterior: string | null
  cargo_novo: string | null
  motivo: string | null
  data_evento: string
  responsavel_nome: string | null
}
