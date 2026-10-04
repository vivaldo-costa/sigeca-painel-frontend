import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import type { PontoEvolucao } from '@/types/dashboard'

function formatarMes(mes: string) {
  const [ano, m] = mes.split('-')
  const data = new Date(Number(ano), Number(m) - 1, 1)
  return data.toLocaleDateString('pt-PT', { month: 'short' }).replace('.', '')
}

export function EvolucaoEscuteirosCard({ pontos }: { pontos: PontoEvolucao[] }) {
  const dados = pontos.map((p) => ({ ...p, label: formatarMes(p.mes) }))
  const ultimo = dados[dados.length - 1]
  const penultimo = dados[dados.length - 2]
  const variacao = penultimo && penultimo.total > 0
    ? Number((((ultimo.total - penultimo.total) / penultimo.total) * 100).toFixed(1))
    : 0

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h3 className="text-[13.5px] font-semibold text-text">Evolução de Escuteiros</h3>
        <span className="text-[11px] text-subtle">Últimos 12 meses</span>
      </CardHeader>
      <CardBody className="h-[300px] p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dados} margin={{ top: 20, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#e8eaed' }}
              formatter={(v) => [Number(v).toLocaleString('pt-PT'), 'Total']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.mes ?? ''}
            />
            <Line type="monotone" dataKey="total" stroke="#3b6fd4" strokeWidth={2.5} dot={{ r: 3, fill: '#3b6fd4' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardBody>
      {ultimo && (
        <div className="border-t border-border px-4 py-2.5 text-[12px] text-muted">
          <span className="font-semibold text-text">{ultimo.total.toLocaleString('pt-PT')}</span> escuteiros em {formatarMes(ultimo.mes)}
          {penultimo && (
            <span className={variacao >= 0 ? 'ml-2 text-emerald-600' : 'ml-2 text-badge-red-text'}>
              {variacao >= 0 ? '▲' : '▼'} {Math.abs(variacao)}%
            </span>
          )}
        </div>
      )}
    </Card>
  )
}
