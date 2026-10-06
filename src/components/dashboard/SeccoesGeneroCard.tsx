import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Pie, PieChart } from 'recharts'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import type { SeccaoDist, ParSeccao } from '@/types/dashboard'

const CORES = ['#3b6fd4', '#0f8f6c', '#7655c8', '#c47a1e', '#b84040', '#2e8fa3', '#5a6e8c', '#7a6031']

interface Props {
  seccoes: SeccaoDist[]
  seccoesPar: SeccaoDist[]
  paresSeccao: ParSeccao[]
  genero: { masculino: number; feminino: number }
}

/**
 * Combina cada par de secções equivalentes (ex.: Exploradores Juniores ≡
 * Flotilha) numa única barra somada, tal como a v10 do dashboard.php.
 */
function combinarSeccoes(seccoes: SeccaoDist[], seccoesPar: SeccaoDist[], pares: ParSeccao[]) {
  const porNome = new Map(seccoesPar.map((s) => [s.seccao, s]))
  const combinadas: { nome: string; total: number }[] = [...seccoes.map((s) => ({ nome: s.seccao, total: s.total }))]
  const usados = new Set<string>()

  pares.forEach((p) => {
    const a = porNome.get(p.seccao_a)
    const b = porNome.get(p.seccao_b)
    if (a || b) {
      combinadas.push({ nome: `${p.seccao_a} / ${p.seccao_b}`, total: (a?.total ?? 0) + (b?.total ?? 0) })
      usados.add(p.seccao_a)
      usados.add(p.seccao_b)
    }
  })

  seccoesPar.forEach((s) => {
    if (!usados.has(s.seccao)) combinadas.push({ nome: s.seccao, total: s.total })
  })

  return combinadas
}

export function SeccoesGeneroCard({ seccoes, seccoesPar, paresSeccao, genero }: Props) {
  const dados = combinarSeccoes(seccoes, seccoesPar, paresSeccao)
  const totalGenero = genero.masculino + genero.feminino
  const dadosGenero = [
    { nome: 'Masculino', valor: genero.masculino },
    { nome: 'Feminino', valor: genero.feminino },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="flex items-center justify-between gap-2">
          <h3 className="text-[13.5px] font-semibold text-text">Distribuição por Secção</h3>
          <ExportarBotoes tamanho="sm" nomeFicheiro="distribuicao-por-seccao" titulo="Distribuição de Escuteiros por Secção"
            colunas={[{ titulo: 'Secção', valor: (d: { nome: string; total: number }) => d.nome }, { titulo: 'Total', valor: (d: { nome: string; total: number }) => d.total }]}
            linhas={dados} />
        </CardHeader>
        <CardBody className="h-[280px] p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dados} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="nome"
                width={150}
                tick={{ fontSize: 11, fill: '#374151' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#e8eaed' }} />
              <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={16}>
                {dados.map((_, i) => (
                  <Cell key={i} fill={CORES[i % CORES.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between gap-2">
          <h3 className="text-[13.5px] font-semibold text-text">Género</h3>
          <ExportarBotoes tamanho="sm" nomeFicheiro="distribuicao-por-genero" titulo="Distribuição de Escuteiros por Género"
            colunas={[
              { titulo: 'Género', valor: (d: { nome: string; valor: number }) => d.nome },
              { titulo: 'Total', valor: (d: { nome: string; valor: number }) => d.valor },
              { titulo: '%', valor: (d: { nome: string; valor: number }) => (totalGenero ? `${((d.valor / totalGenero) * 100).toFixed(1)}%` : '0%') },
            ]}
            linhas={dadosGenero} />
        </CardHeader>
        <CardBody className="flex h-[280px] flex-col items-center justify-center p-3">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={dadosGenero} dataKey="valor" nameKey="nome" innerRadius={55} outerRadius={80} paddingAngle={2}>
                <Cell fill="#3b6fd4" />
                <Cell fill="#b84040" />
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#e8eaed' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex gap-5 text-[12px]">
            <Legenda cor="#3b6fd4" label="Masculino" valor={genero.masculino} total={totalGenero} />
            <Legenda cor="#b84040" label="Feminino" valor={genero.feminino} total={totalGenero} />
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

function Legenda({ cor, label, valor, total }: { cor: string; label: string; valor: number; total: number }) {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0
  return (
    <div className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-full" style={{ background: cor }} />
      <span className="text-muted">{label}</span>
      <span className="font-mono font-semibold text-text">{valor} ({pct}%)</span>
    </div>
  )
}
