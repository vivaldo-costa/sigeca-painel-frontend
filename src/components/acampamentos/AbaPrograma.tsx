import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useEventoPrograma, useCriarItemPrograma, useRemoverItemPrograma } from '@/hooks/useEventoPrograma'
import { Card } from '@/components/ui/Card'

export function AbaPrograma({ atividadeId }: { atividadeId: number }) {
  const { data: programa, isLoading } = useEventoPrograma(atividadeId)
  const criar = useCriarItemPrograma(atividadeId)
  const remover = useRemoverItemPrograma(atividadeId)

  const [novo, setNovo] = useState({ data: '', hora_inicio: '', hora_fim: '', titulo: '', local: '', ramo: '', capacidade: '', materiais: '' })

  const porDia = programa?.reduce<Record<string, typeof programa>>((acc, item) => {
    acc[item.data] = [...(acc[item.data] ?? []), item]
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Nova actividade no programa</p>
        <div className="flex flex-wrap gap-2">
          <input type="date" value={novo.data} onChange={(e) => setNovo((f) => ({ ...f, data: e.target.value }))} className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <input type="time" value={novo.hora_inicio} onChange={(e) => setNovo((f) => ({ ...f, hora_inicio: e.target.value }))} className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <input type="time" value={novo.hora_fim} onChange={(e) => setNovo((f) => ({ ...f, hora_fim: e.target.value }))} placeholder="Fim" className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <input value={novo.titulo} onChange={(e) => setNovo((f) => ({ ...f, titulo: e.target.value }))} placeholder="Título" className="min-w-[160px] flex-1 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <input value={novo.local} onChange={(e) => setNovo((f) => ({ ...f, local: e.target.value }))} placeholder="Local" className="w-32 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <input value={novo.ramo} onChange={(e) => setNovo((f) => ({ ...f, ramo: e.target.value }))} placeholder="Ramo (vazio = todos)" className="w-40 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <button
            onClick={() => { criar.mutate(novo); setNovo({ data: '', hora_inicio: '', hora_fim: '', titulo: '', local: '', ramo: '', capacidade: '', materiais: '' }) }}
            disabled={!novo.data || !novo.hora_inicio || !novo.titulo || criar.isPending}
            className="flex items-center gap-1 rounded-lg bg-[#111827] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </Card>

      {isLoading && <p className="text-center text-sm text-subtle">A carregar...</p>}
      {porDia && Object.entries(porDia).map(([dia, itens]) => (
        <Card key={dia} className="p-4">
          <p className="mb-2 text-[12.5px] font-bold text-text">{new Date(dia).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <div className="space-y-1.5">
            {itens?.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-[12.5px]">
                <div>
                  <span className="font-mono text-[11px] text-subtle">{item.hora_inicio.slice(0, 5)}{item.hora_fim && `–${item.hora_fim.slice(0, 5)}`}</span>
                  {' '}<span className="font-medium text-text">{item.titulo}</span>
                  {item.ramo && <span className="ml-1.5 rounded-full bg-badge-blue-bg px-2 py-0.5 text-[10px] font-semibold text-badge-blue-text">{item.ramo}</span>}
                  {item.local && <span className="ml-1.5 text-subtle">· {item.local}</span>}
                </div>
                <button onClick={() => remover.mutate(item.id)} className="text-red-400 hover:text-red-600"><Trash2 className="size-3.5" /></button>
              </div>
            ))}
          </div>
        </Card>
      ))}
      {programa?.length === 0 && <p className="py-8 text-center text-sm text-subtle">Nenhuma actividade no programa ainda.</p>}
    </div>
  )
}
