import { useState, type ReactNode } from 'react'

interface Props {
  titulo: string
  icone: string // classe Font Awesome, ex.: "fa-solid fa-id-card"
  abertoPorDefeito?: boolean
  resumo?: string
  children: ReactNode
}

/**
 * Secção recolhível — usada para encurtar formulários longos por
 * divulgação progressiva (o mesmo padrão visto nas referências do
 * Pinterest para formulários de registo com muitos campos): cada bloco
 * de assunto começa fechado, com um resumo curto, e só expande quem
 * quiser preencher aquela parte.
 */
export function Accordion({ titulo, icone, abertoPorDefeito = false, resumo, children }: Props) {
  const [aberto, setAberto] = useState(abertoPorDefeito)

  return (
    <div className="overflow-hidden rounded-[var(--radius-pn)] border border-border">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        className="flex w-full items-center gap-3 bg-bg px-4 py-3 text-left transition hover:bg-border/40"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-[13px] text-muted shadow-sm">
          <i className={icone} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-semibold text-text">{titulo}</span>
          {resumo && <span className="block truncate text-[11.5px] text-subtle">{resumo}</span>}
        </span>
        <i className={`fa-solid fa-chevron-down shrink-0 text-[11px] text-subtle transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>
      {aberto && <div className="space-y-4 border-t border-border bg-white p-4">{children}</div>}
    </div>
  )
}
