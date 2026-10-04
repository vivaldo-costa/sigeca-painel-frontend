import type { EstadoDenuncia } from '@/types/denuncia'

const CORES: Record<EstadoDenuncia, string> = {
  nova: 'bg-badge-orange-bg text-badge-orange-text',
  em_analise: 'bg-badge-blue-bg text-badge-blue-text',
  resolvida: 'bg-badge-green-bg text-badge-green-text',
  encerrada: 'bg-bg text-muted',
}

const LABEL: Record<EstadoDenuncia, string> = {
  nova: 'Nova', em_analise: 'Em análise', resolvida: 'Resolvida', encerrada: 'Encerrada',
}

export function BadgeEstadoDenuncia({ estado }: { estado: EstadoDenuncia }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CORES[estado]}`}>
      {LABEL[estado]}
    </span>
  )
}
