import { Outlet } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { TabsRota } from '@/components/ui/TabsRota'

export function ConfiguracaoEmailShell() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-7">
      <h1 className="mb-5 flex items-center gap-2.5 text-xl font-bold text-text">
        <Mail className="size-5 text-muted" /> Configuração de E-mail
      </h1>
      <TabsRota
        abas={[
          { label: 'Configuração', to: '/configuracoes/email', end: true },
          { label: 'Histórico', to: '/configuracoes/email/historico' },
          { label: 'Templates', to: '/configuracoes/email/templates' },
        ]}
      />
      <Outlet />
    </div>
  )
}
