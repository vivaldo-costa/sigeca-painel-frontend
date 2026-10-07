import { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { PaginacaoLista, usePaginacao } from '@/components/ui/PaginacaoLista'
import type { VigarariaPainel, AgrupamentoPainel, ParoquiaPainel } from '@/types/dashboard'

interface ItemRanking { nome: string; total: number; extra?: string }

const POR_PAGINA_RANKING = 10

/** Todas as listas (desde a mais popular até à menos), organizadas por páginas em vez de scroll. */
function ListaRanking({ itens, corBadge }: { itens: ItemRanking[]; corBadge: string }) {
  const [pronto, setPronto] = useState(false)
  const pag = usePaginacao(itens, POR_PAGINA_RANKING)
  useEffect(() => {
    const t = requestAnimationFrame(() => setPronto(true))
    return () => cancelAnimationFrame(t)
  }, [])

  if (itens.length === 0) {
    return <p className="py-6 text-center text-[13px] text-subtle">Sem dados para mostrar.</p>
  }
  const max = Math.max(...itens.map((i) => i.total), 1)

  return (
    <div className="space-y-3">
    <div className="space-y-2.5">
      {pag.visiveis.map((item, j) => {
        const i = pag.inicio + j
        return (
        <div key={i} className="flex items-center gap-3">
          <span className="w-6 shrink-0 text-right font-mono text-[11px] text-subtle">{i + 1}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[12.5px] font-medium text-text">
                {item.nome} {item.extra && <span className="text-[10.5px] text-subtle">({item.extra})</span>}
              </span>
              <span className="shrink-0 font-mono text-[12px] font-semibold text-text">{item.total}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg">
              <div
                className={`h-full rounded-full transition-[width] duration-700 ease-out ${corBadge}`}
                style={{ width: pronto ? `${(item.total / max) * 100}%` : '0%', transitionDelay: `${Math.min(j, 8) * 40}ms` }}
              />
            </div>
          </div>
        </div>
        )
      })}
    </div>
    <PaginacaoLista {...pag} porPagina={POR_PAGINA_RANKING} onMudar={pag.setPagina} />
    </div>
  )
}

const COLUNAS_RANKING = [
  { titulo: 'Posição', valor: (l: ItemRanking & { posicao: number }) => l.posicao },
  { titulo: 'Nome', valor: (l: ItemRanking) => l.nome },
  { titulo: 'Código', valor: (l: ItemRanking) => l.extra ?? '—' },
  { titulo: 'Total de Escuteiros', valor: (l: ItemRanking) => l.total },
]

export function VigarariasAgrupamentosCard({
  vigararias, agrupamentos,
}: { vigararias: VigarariaPainel[]; agrupamentos: AgrupamentoPainel[] }) {
  const agrupamentosItens: ItemRanking[] = agrupamentos.map((a) => ({ nome: a.nome, total: a.total, extra: a.ab_agrupamento ?? undefined }))

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex items-center justify-between gap-2">
          <h3 className="text-[13.5px] font-semibold text-text">Vigararias / Zonas</h3>
          <ExportarBotoes
            tamanho="sm"
            nomeFicheiro="ranking-vigararias"
            titulo="Ranking de Vigararias/Zonas por número de escuteiros"
            colunas={COLUNAS_RANKING}
            linhas={vigararias.map((v, i) => ({ ...v, posicao: i + 1 }))}
          />
        </CardHeader>
        <CardBody><ListaRanking itens={vigararias} corBadge="bg-c1" /></CardBody>
      </Card>
      <Card>
        <CardHeader className="flex items-center justify-between gap-2">
          <h3 className="text-[13.5px] font-semibold text-text">Agrupamentos</h3>
          <ExportarBotoes
            tamanho="sm"
            nomeFicheiro="ranking-agrupamentos"
            titulo="Ranking de Agrupamentos por número de escuteiros"
            colunas={COLUNAS_RANKING}
            linhas={agrupamentosItens.map((a, i) => ({ ...a, posicao: i + 1 }))}
          />
        </CardHeader>
        <CardBody>
          <ListaRanking itens={agrupamentosItens} corBadge="bg-c3" />
        </CardBody>
      </Card>
    </div>
  )
}

export function ParoquiasCard({ paroquias }: { paroquias: ParoquiaPainel[] }) {
  if (paroquias.length === 0) return null
  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2">
        <h3 className="text-[13.5px] font-semibold text-text">Paróquias</h3>
        <ExportarBotoes
          tamanho="sm"
          nomeFicheiro="ranking-paroquias"
          titulo="Ranking de Paróquias por número de escuteiros"
          colunas={COLUNAS_RANKING}
          linhas={paroquias.map((p, i) => ({ ...p, posicao: i + 1 }))}
        />
      </CardHeader>
      <CardBody><ListaRanking itens={paroquias} corBadge="bg-c6" /></CardBody>
    </Card>
  )
}
