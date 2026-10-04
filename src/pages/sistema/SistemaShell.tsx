import { Outlet } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { TabsRota } from '@/components/ui/TabsRota'

export function SistemaShell() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-7">
      <h1 className="mb-5 flex items-center gap-2.5 text-xl font-bold text-text">
        <Activity className="size-5 text-muted" /> Sistema
      </h1>
      <TabsRota
        abas={[
          { label: 'Monitorização', to: '/sistema', end: true },
          { label: 'Logs', to: '/sistema/logs' },
        ]}
      />
      <Outlet />
    </div>
  )
}
