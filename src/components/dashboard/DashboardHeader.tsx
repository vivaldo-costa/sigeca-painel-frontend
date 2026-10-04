import { Calendar } from 'lucide-react'

const CITACOES = [
  'Mais Escuteiros, melhores cidadãos.',
  'Servir hoje, por um mundo melhor amanhã.',
  'Gestão eficiente, escutismo forte.',
]

function saudacao(): string {
  const hora = new Date().getHours()
  if (hora < 12) return 'Bom dia'
  if (hora < 19) return 'Boa tarde'
  return 'Boa noite'
}

export function DashboardHeader({ nome }: { nome: string }) {
  const citacao = CITACOES[new Date().getDate() % CITACOES.length]
  const primeiroNome = nome.split(' ')[0]
  const hoje = new Date()

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1.4fr_auto]">
      <div>
        <p className="text-[12px] text-subtle">Dashboard</p>
        <h1 className="mt-1 text-2xl font-bold text-text">{saudacao()}, {primeiroNome}!</h1>
        <p className="mt-0.5 text-[13px] text-muted">Aqui está o resumo da gestão do SIGECA.</p>
      </div>

      <div className="relative flex items-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-600 px-6 py-5">
        <p className="text-[15px] font-medium italic leading-snug text-white">“{citacao}”</p>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-bg text-muted">
          <Calendar className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold text-text">
            {hoje.toLocaleDateString('pt-PT', { weekday: 'long' }).replace(/^\w/, (c) => c.toUpperCase())}
          </p>
          <p className="text-[11.5px] text-subtle">{hoje.toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  )
}
