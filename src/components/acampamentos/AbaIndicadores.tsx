import { useEffect, useState } from 'react'
import { Download, FileSpreadsheet, ShieldAlert, Loader2 } from 'lucide-react'
import { useIndicadoresEvento } from '@/hooks/useIndicadoresEvento'
import { Card } from '@/components/ui/Card'
import { baixarFicheiroProtegido } from '@/lib/download'
import { getApiErrorMessage } from '@/lib/api'
import { notificar } from '@/lib/notificar'
import { formatarAgrupamento } from '@/lib/formatadores'

export function AbaIndicadores({ atividadeId }: { atividadeId: number }) {
  const { data, isLoading, isError } = useIndicadoresEvento(atividadeId)
  const [pronto, setPronto] = useState(false)
  useEffect(() => {
    const t = requestAnimationFrame(() => setPronto(true))
    return () => cancelAnimationFrame(t)
  }, [])

  async function baixarComErro(url: string, nomeFicheiro: string) {
    try {
      await baixarFicheiroProtegido(url, nomeFicheiro)
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível descarregar o ficheiro.'))
    }
  }

  if (isError) {
    return (
      <Card className="flex items-center gap-3 p-6">
        <ShieldAlert className="size-5 shrink-0 text-amber-500" />
        <p className="text-[13px] text-muted">Não tens um papel autorizado (direcção, coordenação) para ver os indicadores deste evento.</p>
      </Card>
    )
  }

  if (isLoading || !data) return <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap gap-2 p-4">
        <button
          onClick={() => baixarComErro(`/acampamentos/${atividadeId}/relatorio-geral.pdf`, `relatorio-geral-${data.titulo}.pdf`)}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-[12.5px] font-semibold text-text hover:bg-bg"
        >
          <Download className="size-3.5" /> Relatório Geral (PDF)
        </button>
        <button
          onClick={() => baixarComErro(`/acampamentos/${atividadeId}/relatorio-participantes.xlsx`, `participantes-financas-${data.titulo}.xlsx`)}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-[12.5px] font-semibold text-text hover:bg-bg"
        >
          <FileSpreadsheet className="size-3.5" /> Participantes + Finanças (Excel)
        </button>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Indicador label="Taxa de ocupação" valor={data.taxa_ocupacao !== null ? `${data.taxa_ocupacao}%` : 'N/D'} />
        <Indicador label="Taxa de confirmação" valor={`${data.taxa_confirmacao}%`} />
        <Indicador label="Taxa de desistência" valor={`${data.taxa_desistencia}%`} />
        <Indicador label="Taxa de presença" valor={`${data.taxa_presenca}%`} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Indicador label="Confirmados" valor={String(data.confirmados)} />
        <Indicador label="Desistências" valor={String(data.desistencias)} />
        <Indicador label="Lista de espera" valor={String(data.lista_espera)} />
        <Indicador label="Presentes" valor={String(data.presentes)} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Indicador label="Receita total" valor={`${data.receita_total.toLocaleString('pt-PT')} Kz`} />
        <Indicador label="Despesa total" valor={`${data.despesa_total.toLocaleString('pt-PT')} Kz`} />
        <Indicador label="Saldo" valor={`${data.saldo.toLocaleString('pt-PT')} Kz`} destaque={data.saldo < 0 ? 'negativo' : 'positivo'} />
        <Indicador label="Custo / participante" valor={`${data.custo_por_participante.toLocaleString('pt-PT')} Kz`} />
      </div>

      <Card className="p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Participação por agrupamento</p>
        <div className="space-y-1.5">
          {data.participacao_por_agrupamento.map((p, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-[12.5px]">
              <span>{formatarAgrupamento({ nome: p.agrupamento_nome, ab_agrupamento: p.ab_agrupamento })}</span>
              <span className="font-semibold text-text">{p.total_confirmados}</span>
            </div>
          ))}
          {data.participacao_por_agrupamento.length === 0 && <p className="text-[12px] text-subtle">Sem confirmados ainda.</p>}
        </div>
      </Card>

      <Card className="p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Cumprimento de tarefas por comissão</p>
        <div className="space-y-2">
          {data.cumprimento_tarefas_por_comissao.map((c, i) => {
            const pct = c.total_tarefas ? Math.round((c.tarefas_concluidas / c.total_tarefas) * 100) : 0
            return (
              <div key={i}>
                <div className="mb-1 flex items-center justify-between text-[12.5px]">
                  <span className="text-text">{c.comissao_nome}</span>
                  <span className="text-muted">{c.tarefas_concluidas} / {c.total_tarefas}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-[width] duration-700 ease-out"
                    style={{ width: pronto ? `${pct}%` : '0%', transitionDelay: `${Math.min(i, 8) * 40}ms` }}
                  />
                </div>
              </div>
            )
          })}
          {data.cumprimento_tarefas_por_comissao.length === 0 && <p className="text-[12px] text-subtle">Sem comissões criadas.</p>}
        </div>
      </Card>
    </div>
  )
}

function Indicador({ label, valor, destaque }: { label: string; valor: string; destaque?: 'positivo' | 'negativo' }) {
  return (
    <Card className="p-4">
      <p className="text-[11px] font-medium uppercase text-subtle">{label}</p>
      <p className={`mt-1 text-lg font-bold ${destaque === 'negativo' ? 'text-badge-red-text' : destaque === 'positivo' ? 'text-emerald-600' : 'text-text'}`}>{valor}</p>
    </Card>
  )
}
