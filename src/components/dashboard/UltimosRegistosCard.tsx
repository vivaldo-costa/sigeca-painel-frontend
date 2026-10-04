import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { uploadUrl } from '@/lib/uploads'
import { formatarAgrupamento } from '@/lib/formatadores'
import type { UltimoUtilizador } from '@/types/dashboard'

export function UltimosRegistosCard({ utilizadores }: { utilizadores: UltimoUtilizador[] }) {
  return (
    <Card>
      <CardHeader><h3 className="text-[13.5px] font-semibold text-text">Últimos Registos</h3></CardHeader>
      <CardBody className="space-y-1">
        {utilizadores.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-subtle">Sem registos recentes.</p>
        ) : (
          utilizadores.map((u, i) => (
            <div key={i} className="flex animate-fade-in items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-bg" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-bg text-[11px] font-semibold text-muted">
                {u.foto ? (
                  <img src={uploadUrl('avatar', u.foto)!} className="size-full object-cover" alt={u.nome} />
                ) : (
                  u.nome[0]?.toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-medium text-text">{u.nome}</p>
                <p className="truncate text-[11px] text-subtle">
                  {[u.agrupamento ? formatarAgrupamento({ nome: u.agrupamento, ab_agrupamento: u.ab_agrupamento }) : null, u.seccao_nome].filter(Boolean).join(' · ') || '—'}
                </p>
              </div>
              <span className="shrink-0 font-mono text-[10.5px] text-subtle">{u.codigo_associado}</span>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  )
}
