export type NivelLog = 'info' | 'warn' | 'error' | 'debug'

export interface EntradaLog {
  id: number
  timestamp: string | null
  nivel: NivelLog
  mensagem: string
}

export const COR_NIVEL_LOG: Record<NivelLog, string> = {
  error: 'bg-badge-red-bg text-badge-red-text',
  warn: 'bg-badge-orange-bg text-badge-orange-text',
  info: 'bg-badge-blue-bg text-badge-blue-text',
  debug: 'bg-bg text-subtle',
}

export interface EstadoMonitorizacao {
  servidor: {
    uptime_segundos: number
    memoria_usada_mb: number
    memoria_total_mb: number
    versao_node: string
    carga_sistema: string | null
  }
  base_dados: { estado: 'ok' | 'erro'; latencia_ms?: number; erro?: string }
  fila_emails: Record<string, number>
  fila_sms: Record<string, number>
}
