import { CalendarDays } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function MiniCalendarioCard() {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = hoje.getMonth()
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay()
  const totalDias = new Date(ano, mes + 1, 0).getDate()

  const celulas: (number | null)[] = [
    ...Array.from({ length: primeiroDiaSemana }, () => null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ]

  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <CalendarDays className="size-4 text-muted" />
        <h3 className="text-[13.5px] font-semibold text-text">
          {hoje.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase())}
        </h3>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-7 gap-1 text-center">
          {DIAS_SEMANA.map((d) => (
            <span key={d} className="text-[10px] font-semibold uppercase text-subtle">{d}</span>
          ))}
          {celulas.map((dia, i) => (
            <span
              key={i}
              className={`grid aspect-square place-items-center rounded-lg text-[11.5px] ${
                dia === hoje.getDate() ? 'bg-[#111827] font-bold text-white' : dia ? 'text-text hover:bg-bg' : ''
              }`}
            >
              {dia ?? ''}
            </span>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}
