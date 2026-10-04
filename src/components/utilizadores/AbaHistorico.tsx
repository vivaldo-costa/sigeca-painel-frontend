import { ArrowRight, Calendar, Loader2 } from 'lucide-react'
import { useHistoricoUtilizador } from '@/hooks/useUtilizadores'

export function AbaHistorico({ utilizadorId }: { utilizadorId: number }) {
  const { data: eventos, isLoading, isError } = useHistoricoUtilizador(utilizadorId)

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="size-5 animate-spin text-subtle" /></div>
  }
  if (isError) {
    return <p className="py-12 text-center text-sm text-subtle">Não foi possível carregar o histórico.</p>
  }
  if (!eventos || eventos.length === 0) {
    return <p className="py-12 text-center text-sm text-subtle">Sem registos no histórico deste escuteiro.</p>
  }

  return (
    <div className="space-y-3">
      {eventos.map((ev, i) => (
        <div key={i} className="rounded-[var(--radius-pn)] border border-border bg-surface p-4">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-subtle">
              {ev.tipo === 'transferencia' ? 'Transferência' : 'Mudança de Secção/Cargo'}
            </span>
            {ev.estado_ou_origem && (
              <span className="rounded-full bg-bg px-2.5 py-0.5 text-[11px] font-semibold text-muted">{ev.estado_ou_origem}</span>
            )}
          </div>
          {(ev.de_nome || ev.para_nome) && (
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-text">
              {ev.de_nome ?? '—'} <ArrowRight className="size-3 text-subtle" /> {ev.para_nome ?? '—'}
            </p>
          )}
          {ev.cargo_novo && ev.cargo_novo !== ev.cargo_anterior && (
            <p className="mt-1 text-[12.5px] text-muted">Cargo: {ev.cargo_anterior ?? '—'} → {ev.cargo_novo}</p>
          )}
          {ev.motivo && <p className="mt-1 text-[12.5px] text-muted">{ev.motivo}</p>}
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-subtle">
            <Calendar className="size-3" /> {new Date(ev.data_evento).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
            {ev.responsavel_nome && <> · Registado por {ev.responsavel_nome}</>}
          </p>
        </div>
      ))}
    </div>
  )
}
