import type { LucideIcon } from 'lucide-react'
import { Users, UsersRound, CalendarDays, GraduationCap, Receipt, ArrowUp, ArrowDown } from 'lucide-react'
import { useCountUp } from '@/hooks/useCountUp'
import type { Contadores, CrescimentoMensal } from '@/types/dashboard'

export function KpiRow({ contadores, crescimento }: { contadores: Contadores; crescimento: CrescimentoMensal }) {
  const itens: { label: string; valor: number; pct: number; icon: LucideIcon; gradiente: string }[] = [
    { label: 'Total de Escuteiros', valor: contadores.total_utilizadores, pct: crescimento.escuteiros, icon: Users, gradiente: 'from-[#3b6fd4] to-[#2952a3]' },
    { label: 'Agrupamentos', valor: contadores.total_agrupamentos, pct: crescimento.agrupamentos, icon: UsersRound, gradiente: 'from-emerald-500 to-emerald-700' },
    { label: 'Actividades', valor: contadores.total_eventos, pct: crescimento.actividades, icon: CalendarDays, gradiente: 'from-orange-400 to-orange-600' },
    { label: 'Formações', valor: contadores.total_formacoes, pct: crescimento.formacoes, icon: GraduationCap, gradiente: 'from-[#7655c8] to-[#5a3fa3]' },
    { label: 'Vendas (Kz)', valor: contadores.total_vendas, pct: crescimento.vendas, icon: Receipt, gradiente: 'from-pink-500 to-rose-600' },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {itens.map(({ label, valor, pct, icon: Icon, gradiente }, i) => (
        <KpiCard key={label} label={label} valor={valor} pct={pct} Icon={Icon} gradiente={gradiente} atraso={i * 60} />
      ))}
    </div>
  )
}

function KpiCard({ label, valor, pct, Icon, gradiente, atraso }: { label: string; valor: number; pct: number; Icon: LucideIcon; gradiente: string; atraso: number }) {
  const { valor: contado, ref } = useCountUp(valor)

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`animate-slide-up relative overflow-hidden rounded-2xl bg-gradient-to-br p-4 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-lg ${gradiente}`}
      style={{ animationDelay: `${atraso}ms` }}
    >
      <div className="pointer-events-none absolute -right-4 -top-4 size-20 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-6 -right-8 size-24 rounded-full bg-white/5" />

      <div className="relative flex items-start justify-between">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
          <Icon className="size-[18px] text-white" />
        </div>
      </div>
      <p className="relative mt-3 truncate text-[12px] font-medium text-white/80">{label}</p>
      <p className="relative font-mono text-xl font-bold text-white">{contado.toLocaleString('pt-PT')}</p>
      <p className="relative mt-1 flex items-center gap-1 text-[11px] font-semibold text-white">
        {pct >= 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
        {Math.abs(pct)}% <span className="font-normal text-white/70">vs mês anterior</span>
      </p>
    </div>
  )
}
