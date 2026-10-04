import { Link } from 'react-router-dom'
import { Zap, UserPlus, CalendarPlus, BadgeCheck, ShoppingBag, FileText, type LucideIcon } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'

const ACOES: { label: string; to: string; icon: LucideIcon; cor: string }[] = [
  { label: 'Registar Escuteiro', to: '/utilizadores/novo', icon: UserPlus, cor: 'text-badge-blue-text bg-badge-blue-bg' },
  { label: 'Criar Actividade', to: '/eventos', icon: CalendarPlus, cor: 'text-badge-green-text bg-badge-green-bg' },
  { label: 'Emitir Certificado', to: '/certificados', icon: BadgeCheck, cor: 'text-violet-600 bg-violet-100' },
  { label: 'Nova Venda (POS)', to: '/vendas/pos', icon: ShoppingBag, cor: 'text-badge-orange-text bg-badge-orange-bg' },
  { label: 'Novo Documento', to: '/documentos', icon: FileText, cor: 'text-pink-600 bg-pink-100' },
]

export function AcoesRapidasCard() {
  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <Zap className="size-4 text-muted" />
        <h3 className="text-[13.5px] font-semibold text-text">Ações Rápidas</h3>
      </CardHeader>
      <CardBody className="space-y-1.5">
        {ACOES.map((a) => (
          <Link
            key={a.label}
            to={a.to}
            className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2 text-[12.5px] font-medium text-text transition hover:bg-bg"
          >
            <span className={`grid size-7 shrink-0 place-items-center rounded-lg ${a.cor}`}>
              <a.icon className="size-3.5" />
            </span>
            {a.label}
          </Link>
        ))}
      </CardBody>
    </Card>
  )
}
