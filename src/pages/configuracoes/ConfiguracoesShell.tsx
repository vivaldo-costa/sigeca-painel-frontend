import { Outlet } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { TabsRota } from '@/components/ui/TabsRota'

export function ConfiguracoesShell() {
  return (
    <div className="mx-auto max-w-[700px] px-4 py-6 sm:px-6 sm:py-7">
      <h1 className="mb-5 flex items-center gap-2.5 text-xl font-bold text-text">
        <Settings className="size-5 text-muted" /> Configurações
      </h1>
      <TabsRota
        abas={[
          { label: 'Geral', to: '/configuracoes', end: true },
          { label: 'Aparência', to: '/configuracoes/aparencia' },
        ]}
      />
      <Outlet />
    </div>
  )
}
