import { useState } from 'react'
import { Plus, Trash2, ShieldAlert } from 'lucide-react'
import { useEventoEmentas, useCriarEmenta, useRemoverEmenta, useDietasEspeciais } from '@/hooks/useEventoAlimentacao'
import { Card } from '@/components/ui/Card'
import { REFEICOES, type Refeicao } from '@/types/eventoAlimentacao'

export function AbaAlimentacao({ atividadeId }: { atividadeId: number }) {
  const { data } = useEventoEmentas(atividadeId)
  const criar = useCriarEmenta(atividadeId)
  const remover = useRemoverEmenta(atividadeId)
  const { data: dietas, isError: semAcessoDietas } = useDietasEspeciais(atividadeId)

  const [nova, setNova] = useState({ data: '', refeicao: 'almoco' as Refeicao, descricao: '', custo_estimado: '' })

  return (
    <div className="space-y-4">
      {data && (
        <Card className="p-4">
          <p className="text-[12.5px] text-muted">
            <span className="font-semibold text-text">{data.total_confirmados}</span> participante{data.total_confirmados !== 1 && 's'} confirmado{data.total_confirmados !== 1 && 's'} — as quantidades de refeição recalculam-se automaticamente a partir daqui, não são guardadas à parte.
          </p>
        </Card>
      )}

      <Card className="p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Nova ementa</p>
        <div className="flex flex-wrap gap-2">
          <input type="date" value={nova.data} onChange={(e) => setNova((f) => ({ ...f, data: e.target.value }))} className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <select value={nova.refeicao} onChange={(e) => setNova((f) => ({ ...f, refeicao: e.target.value as Refeicao }))} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12px] outline-none focus:border-[#111827]">
            {REFEICOES.map((r) => <option key={r.valor} value={r.valor}>{r.label}</option>)}
          </select>
          <input value={nova.descricao} onChange={(e) => setNova((f) => ({ ...f, descricao: e.target.value }))} placeholder="Descrição" className="min-w-[160px] flex-1 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <input type="number" value={nova.custo_estimado} onChange={(e) => setNova((f) => ({ ...f, custo_estimado: e.target.value }))} placeholder="Custo (Kz)" className="w-28 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <button
            onClick={() => { criar.mutate(nova); setNova({ data: '', refeicao: 'almoco', descricao: '', custo_estimado: '' }) }}
            disabled={!nova.data || !nova.descricao || criar.isPending}
            className="flex items-center gap-1 rounded-lg bg-[#111827] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3.5 py-2.5 font-medium">Data</th>
              <th className="px-3.5 py-2.5 font-medium">Refeição</th>
              <th className="px-3.5 py-2.5 font-medium">Descrição</th>
              <th className="px-3.5 py-2.5 font-medium">Custo estimado</th>
              <th className="px-3.5 py-2.5 text-center font-medium">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.ementas.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-subtle">Nenhuma ementa criada.</td></tr>}
            {data?.ementas.map((e) => (
              <tr key={e.id} className="hover:bg-bg">
                <td className="px-3.5 py-2.5 text-text">{new Date(e.data).toLocaleDateString('pt-PT')}</td>
                <td className="px-3.5 py-2.5 text-muted">{REFEICOES.find((r) => r.valor === e.refeicao)?.label}</td>
                <td className="px-3.5 py-2.5 text-muted">{e.descricao}</td>
                <td className="px-3.5 py-2.5 text-muted">{e.custo_estimado ? `${e.custo_estimado.toLocaleString('pt-PT')} Kz` : '—'}</td>
                <td className="px-3.5 py-2.5 text-center">
                  <button onClick={() => remover.mutate(e.id)} className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50">
                    <Trash2 className="size-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Dietas especiais</p>
        {semAcessoDietas && (
          <p className="rounded-lg bg-bg px-3 py-2 text-[12px] text-subtle">
            Não tens um papel autorizado (equipa de saúde, secretaria, direcção) para ver esta informação — deriva dos dados médicos dos participantes.
          </p>
        )}
        {!semAcessoDietas && (
          <div className="space-y-1.5">
            {dietas?.map((d, i) => (
              <div key={i} className="rounded-lg bg-bg px-3 py-2 text-[12.5px]">
                <p className="font-medium text-text">{d.nome} <span className="font-mono text-[11px] text-subtle">{d.codigo_associado}</span></p>
                <p className="mt-0.5 flex items-start gap-1.5 text-muted">
                  <ShieldAlert className="mt-0.5 size-3 shrink-0 text-amber-500" />
                  {[d.restricoes_alimentares, d.alergias].filter(Boolean).join(' · ')}
                </p>
              </div>
            ))}
            {dietas?.length === 0 && <p className="text-[12px] text-subtle">Nenhuma dieta especial registada entre os participantes confirmados.</p>}
          </div>
        )}
      </Card>
    </div>
  )
}
