import { Calendar } from 'lucide-react'

function saudacao(): string {
  const hora = new Date().getHours()
  if (hora < 12) return 'Bom dia'
  if (hora < 19) return 'Boa tarde'
  return 'Boa noite'
}

export function DashboardHeader({ nome }: { nome: string }) {
  const primeiroNome = nome.split(' ')[0]
  const hoje = new Date()

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <p className="text-[12px] text-subtle">Dashboard</p>
        <h1 className="mt-1 text-2xl font-bold text-text">{saudacao()}, {primeiroNome}!</h1>
        <p className="mt-0.5 text-[13px] text-muted">Aqui está o resumo da gestão do SIGECA.</p>
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
