import { Loader2, Database, Cpu, Mail, MessageSquare } from 'lucide-react'
import { useMonitorizacao } from '@/hooks/useLogs'
import { Card } from '@/components/ui/Card'

function formatarUptime(segundos: number): string {
  const h = Math.floor(segundos / 3600)
  const m = Math.floor((segundos % 3600) / 60)
  return `${h}h ${m}m`
}

export function MonitorizacaoPage() {
  const { data, isLoading } = useMonitorizacao()

  if (isLoading || !data) return <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase text-subtle"><Database className="size-3.5" /> Base de Dados</p>
          <p className={`mt-1 text-lg font-bold ${data.base_dados.estado === 'ok' ? 'text-badge-green-text' : 'text-badge-red-text'}`}>
            {data.base_dados.estado === 'ok' ? `${data.base_dados.latencia_ms} ms` : 'Erro'}
          </p>
        </Card>
        <Card className="p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase text-subtle"><Cpu className="size-3.5" /> Memória</p>
          <p className="mt-1 text-lg font-bold text-text">{data.servidor.memoria_usada_mb} MB</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-medium uppercase text-subtle">Tempo Activo</p>
          <p className="mt-1 text-lg font-bold text-text">{formatarUptime(data.servidor.uptime_segundos)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-medium uppercase text-subtle">Node.js</p>
          <p className="mt-1 text-lg font-bold text-text">{data.servidor.versao_node}</p>
        </Card>
      </div>

      {data.base_dados.estado === 'erro' && (
        <Card className="border border-red-200 bg-red-50 p-4">
          <p className="text-[12.5px] font-medium text-badge-red-text">Falha na ligação à base de dados: {data.base_dados.erro}</p>
        </Card>
      )}

      <Card className="p-4">
        <p className="mb-3 flex items-center gap-1.5 text-[12.5px] font-semibold text-muted"><Mail className="size-3.5" /> Fila de E-mails</p>
        <div className="flex flex-wrap gap-4">
          {Object.entries(data.fila_emails).length === 0 && <p className="text-[12px] text-subtle">Sem itens na fila.</p>}
          {Object.entries(data.fila_emails).map(([estado, total]) => (
            <div key={estado}><p className="text-[11px] uppercase text-subtle">{estado}</p><p className="text-[15px] font-bold text-text">{total}</p></div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <p className="mb-3 flex items-center gap-1.5 text-[12.5px] font-semibold text-muted"><MessageSquare className="size-3.5" /> Fila de SMS</p>
        <div className="flex flex-wrap gap-4">
          {Object.entries(data.fila_sms).length === 0 && <p className="text-[12px] text-subtle">Sem itens na fila.</p>}
          {Object.entries(data.fila_sms).map(([estado, total]) => (
            <div key={estado}><p className="text-[11px] uppercase text-subtle">{estado}</p><p className="text-[15px] font-bold text-text">{total}</p></div>
          ))}
        </div>
      </Card>
    </div>
  )
}
