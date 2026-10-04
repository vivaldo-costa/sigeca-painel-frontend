import type { EstadoUtilizador } from '@/types/utilizador'
import type { EstadoTransferencia } from '@/types/transferencia'

const CORES_UTILIZADOR: Record<EstadoUtilizador, string> = {
  ACTIVO: 'bg-badge-green-bg text-badge-green-text',
  VALIDATION: 'bg-badge-orange-bg text-badge-orange-text',
  INATIVO: 'bg-bg text-muted',
  TRANSFERIDO: 'bg-badge-blue-bg text-badge-blue-text',
  FALECIDO: 'bg-slate-100 text-slate-500',
  PARTIDA: 'bg-badge-violet-bg text-badge-violet-text',
}

const LABEL_UTILIZADOR: Record<EstadoUtilizador, string> = {
  ACTIVO: 'Activo',
  VALIDATION: 'Por validar',
  INATIVO: 'Inactivo',
  TRANSFERIDO: 'Transferido',
  FALECIDO: 'Falecido',
  PARTIDA: 'Partida',
}

export function BadgeEstadoUtilizador({ estado }: { estado: EstadoUtilizador }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CORES_UTILIZADOR[estado] ?? 'bg-bg text-muted'}`}>
      {LABEL_UTILIZADOR[estado] ?? estado}
    </span>
  )
}

const CORES_TRANSFERENCIA: Record<EstadoTransferencia, string> = {
  PENDENTE: 'bg-badge-orange-bg text-badge-orange-text',
  APROVADA: 'bg-badge-green-bg text-badge-green-text',
  REJEITADA: 'bg-badge-red-bg text-badge-red-text',
  CANCELADA: 'bg-bg text-muted',
}

const LABEL_TRANSFERENCIA: Record<EstadoTransferencia, string> = {
  PENDENTE: 'Pendente',
  APROVADA: 'Aprovada',
  REJEITADA: 'Rejeitada',
  CANCELADA: 'Cancelada',
}

export function BadgeEstadoTransferencia({ estado }: { estado: EstadoTransferencia }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CORES_TRANSFERENCIA[estado]}`}>
      {LABEL_TRANSFERENCIA[estado]}
    </span>
  )
}
