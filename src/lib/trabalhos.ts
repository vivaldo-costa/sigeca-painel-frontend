import { api } from './api'

export interface EstadoTrabalho<T = unknown> {
  id: number
  tipo: string
  estado: 'pendente' | 'em_progresso' | 'concluido' | 'falhou'
  mensagem: string | null
  resultado: T | null
  erro: string | null
}

/**
 * Espera que um trabalho em segundo plano termine, consultando o seu
 * estado periodicamente — em vez de deixar o pedido HTTP original em
 * aberto à espera (que é exactamente o que o processamento em segundo
 * plano do backend evita). Devolve o `resultado` em sucesso, ou lança
 * o `erro` gravado no trabalho em caso de falha.
 */
export async function aguardarTrabalho<T = unknown>(
  trabalhoId: number,
  onProgresso?: (mensagem: string | null) => void,
  intervaloMs = 1000,
): Promise<T> {
  for (;;) {
    const { data } = await api.get<{ dados: EstadoTrabalho<T> }>(`/trabalhos/${trabalhoId}`)
    const trabalho = data.dados

    if (trabalho.estado === 'concluido') return trabalho.resultado as T
    if (trabalho.estado === 'falhou') throw new Error(trabalho.erro ?? 'O trabalho falhou.')

    onProgresso?.(trabalho.mensagem)
    await new Promise((resolve) => setTimeout(resolve, intervaloMs))
  }
}
