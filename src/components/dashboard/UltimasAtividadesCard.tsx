import { Link } from 'react-router-dom'
import { CalendarDays, GraduationCap, ArrowRight } from 'lucide-react'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import type { AtividadeRecente } from '@/types/dashboard'

export function UltimasAtividadesCard({ atividades }: { atividades: AtividadeRecente[] }) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h3 className="text-[13.5px] font-semibold text-text">Últimas Actividades</h3>
        <div className="flex items-center gap-2">
          <ExportarBotoes tamanho="sm" nomeFicheiro="ultimas-actividades" titulo="Últimas Actividades"
            colunas={[
              { titulo: 'Tipo', valor: (a: AtividadeRecente) => (a.tipo === 'formacao' ? 'Formação' : 'Actividade') },
              { titulo: 'Título', valor: (a: AtividadeRecente) => a.titulo },
              { titulo: 'Local', valor: (a: AtividadeRecente) => a.local ?? '—' },
              { titulo: 'Início', valor: (a: AtividadeRecente) => (a.data_inicio ? new Date(a.data_inicio).toLocaleDateString('pt-PT') : '—') },
            ]}
            linhas={atividades} />
          <Link to="/eventos" className="flex items-center gap-1 text-[11.5px] font-medium text-muted hover:text-text">
            Ver todas <ArrowRight className="size-3" />
          </Link>
        </div>
      </CardHeader>
      <CardBody className="space-y-1">
        {atividades.length === 0 && <p className="py-6 text-center text-[13px] text-subtle">Nenhuma actividade recente.</p>}
        {atividades.map((a, i) => {
          const Icon = a.tipo === 'formacao' ? GraduationCap : CalendarDays
          return (
            <div key={`${a.tipo}-${a.id}`} className="flex animate-fade-in items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-bg" style={{ animationDelay: `${i * 40}ms` }}>
              <div className={`grid size-9 shrink-0 place-items-center rounded-lg ${a.tipo === 'formacao' ? 'bg-violet-100 text-violet-600' : 'bg-badge-blue-bg text-badge-blue-text'}`}>
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-medium text-text">{a.titulo}</p>
                <p className="truncate text-[11px] text-subtle">{a.local ?? 'Sem local definido'}</p>
              </div>
              <span className="shrink-0 text-[11px] text-subtle">{new Date(a.data_inicio).toLocaleDateString('pt-PT')}</span>
            </div>
          )
        })}
      </CardBody>
    </Card>
  )
}
