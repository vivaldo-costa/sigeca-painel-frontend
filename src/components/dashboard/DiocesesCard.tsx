import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import type { DiocesePainel } from '@/types/dashboard'

export function DiocesesCard({ dioceses }: { dioceses: DiocesePainel[] }) {
  if (dioceses.length === 0) return null

  return (
    <Card>
      <CardHeader><h3 className="text-[13.5px] font-semibold text-text">Escuteiros por Diocese</h3></CardHeader>
      <CardBody className="h-[300px] p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dioceses} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" vertical={false} />
            <XAxis dataKey="diocese" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#e8eaed' }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="masculino" stackId="g" name="Masculino" fill="#3b6fd4" radius={[0, 0, 0, 0]} />
            <Bar dataKey="feminino" stackId="g" name="Feminino" fill="#b84040" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  )
}
