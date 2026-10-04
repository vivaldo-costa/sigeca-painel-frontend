import { Construction } from 'lucide-react'

export function EmConstrucaoPage({ titulo }: { titulo: string }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-white shadow-[var(--shadow-pn)]">
        <Construction className="size-7 text-subtle" />
      </div>
      <h1 className="text-lg font-bold text-text">{titulo}</h1>
      <p className="mt-1.5 max-w-sm text-sm text-muted">
        Este módulo ainda não foi migrado para o novo Painel. Continua disponível na versão actual em PHP.
      </p>
    </div>
  )
}
