import { useEffect, useState } from 'react'
import { MapPinned } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import type { DiocesePainel } from '@/types/dashboard'

/**
 * O design de referência mostra um mapa geográfico de Angola. Optei por
 * uma lista ordenada em vez de desenhar um mapa SVG do país — arriscava
 * ficar impreciso e é um esforço grande para o valor que acrescenta face a
 * esta lista, que usa os mesmos dados reais (top dioceses por total de
 * escuteiros).
 */
export function TopDiocesesCard({ dioceses }: { dioceses: DiocesePainel[] }) {
  const top5 = [...dioceses].sort((a, b) => b.total - a.total).slice(0, 5)
  const maiorTotal = top5[0]?.total ?? 1

  // As barras começam a 0% e só crescem até ao valor real num instante
  // depois de montadas — sem isto, a transição CSS nunca dispara (o
  // React já pintava a largura final logo na primeira renderização).
  const [prontoParaAnimar, setProntoParaAnimar] = useState(false)
  useEffect(() => {
    const t = requestAnimationFrame(() => setProntoParaAnimar(true))
    return () => cancelAnimationFrame(t)
  }, [])

  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <MapPinned className="size-4 text-muted" />
        <h3 className="text-[13.5px] font-semibold text-text">Top 5 Dioceses</h3>
      </CardHeader>
      <CardBody className="space-y-3">
        {top5.length === 0 && <p className="py-6 text-center text-[13px] text-subtle">Sem dados.</p>}
        {top5.map((d, i) => (
          <div key={d.diocese} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="mb-1 flex items-center justify-between text-[12.5px]">
              <span className="flex items-center gap-2 font-medium text-text">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-bg text-[10.5px] font-bold text-muted">{i + 1}</span>
                {d.diocese}
              </span>
              <span className="font-mono font-semibold text-text">{d.total.toLocaleString('pt-PT')}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-bg">
              <div
                className="h-full rounded-full bg-badge-blue-text transition-[width] duration-700 ease-out"
                style={{ width: prontoParaAnimar ? `${(d.total / maiorTotal) * 100}%` : '0%', transitionDelay: `${i * 60}ms` }}
              />
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  )
}
