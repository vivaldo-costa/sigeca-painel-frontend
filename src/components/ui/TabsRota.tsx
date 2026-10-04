import { NavLink } from 'react-router-dom'

interface AbaRota {
  label: string
  to: string
  end?: boolean
}

interface Props {
  abas: AbaRota[]
}

/** Barra de abas para secções com sub-páginas (ex.: Configurações → Geral/Aparência). Cada aba é uma rota própria — o estado activo vem do URL, não de useState. */
export function TabsRota({ abas }: Props) {
  return (
    <div className="mb-5 flex gap-1 border-b border-border">
      {abas.map((aba) => (
        <NavLink
          key={aba.to}
          to={aba.to}
          end={aba.end}
          className={({ isActive }) =>
            `border-b-2 px-3.5 py-2.5 text-[13px] font-medium transition ${
              isActive ? 'border-[#111827] text-text' : 'border-transparent text-muted hover:text-text'
            }`
          }
        >
          {aba.label}
        </NavLink>
      ))}
    </div>
  )
}
