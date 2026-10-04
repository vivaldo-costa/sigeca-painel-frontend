import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useEventoInventario, useCriarItemInventario, useAtualizarItemInventario, useRemoverItemInventario } from '@/hooks/useEventoInventario'
import { Card } from '@/components/ui/Card'
import { ESTADOS_INVENTARIO, LABEL_ESTADO_INVENTARIO, type EstadoInventario } from '@/types/eventoInventario'

const CORES_ESTADO: Record<EstadoInventario, string> = {
  em_falta: 'bg-badge-red-bg text-badge-red-text',
  requisitado: 'bg-badge-orange-bg text-badge-orange-text',
  disponivel: 'bg-badge-green-bg text-badge-green-text',
  emprestado: 'bg-badge-blue-bg text-badge-blue-text',
  danificado: 'bg-bg text-subtle',
  devolvido: 'bg-bg text-subtle',
}

export function AbaInventario({ atividadeId }: { atividadeId: number }) {
  const { data: itens, isLoading } = useEventoInventario(atividadeId)
  const criar = useCriarItemInventario(atividadeId)
  const atualizar = useAtualizarItemInventario(atividadeId)
  const remover = useRemoverItemInventario(atividadeId)

  const [novo, setNovo] = useState({ nome: '', quantidade_necessaria: '', quantidade_disponivel: '', estado: 'em_falta', localizacao: '' })

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Novo item</p>
        <div className="flex flex-wrap gap-2">
          <input value={novo.nome} onChange={(e) => setNovo((f) => ({ ...f, nome: e.target.value }))} placeholder="Nome do material" className="min-w-[160px] flex-1 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <input type="number" value={novo.quantidade_necessaria} onChange={(e) => setNovo((f) => ({ ...f, quantidade_necessaria: e.target.value }))} placeholder="Necessário" className="w-24 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <input type="number" value={novo.quantidade_disponivel} onChange={(e) => setNovo((f) => ({ ...f, quantidade_disponivel: e.target.value }))} placeholder="Disponível" className="w-24 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <input value={novo.localizacao} onChange={(e) => setNovo((f) => ({ ...f, localizacao: e.target.value }))} placeholder="Localização" className="w-32 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <button
            onClick={() => { criar.mutate(novo); setNovo({ nome: '', quantidade_necessaria: '', quantidade_disponivel: '', estado: 'em_falta', localizacao: '' }) }}
            disabled={!novo.nome || criar.isPending}
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
              <th className="px-3.5 py-2.5 font-medium">Material</th>
              <th className="px-3.5 py-2.5 font-medium">Quantidade</th>
              <th className="px-3.5 py-2.5 font-medium">Localização</th>
              <th className="px-3.5 py-2.5 font-medium">Estado</th>
              <th className="px-3.5 py-2.5 text-center font-medium">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!isLoading && itens?.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-subtle">Nenhum item registado.</td></tr>}
            {itens?.map((i) => (
              <tr key={i.id} className="hover:bg-bg">
                <td className="px-3.5 py-2.5 font-medium text-text">{i.nome}</td>
                <td className="px-3.5 py-2.5 text-muted">{i.quantidade_disponivel} / {i.quantidade_necessaria}</td>
                <td className="px-3.5 py-2.5 text-muted">{i.localizacao ?? '—'}</td>
                <td className="px-3.5 py-2.5">
                  <select
                    value={i.estado}
                    onChange={(e) => atualizar.mutate({ id: i.id, nome: i.nome, quantidade_necessaria: i.quantidade_necessaria, quantidade_disponivel: i.quantidade_disponivel, estado: e.target.value, localizacao: i.localizacao, observacoes: i.observacoes })}
                    className={`rounded-full border-0 px-2 py-1 text-[11px] font-semibold outline-none ${CORES_ESTADO[i.estado]}`}
                  >
                    {ESTADOS_INVENTARIO.map((e) => <option key={e} value={e}>{LABEL_ESTADO_INVENTARIO[e]}</option>)}
                  </select>
                </td>
                <td className="px-3.5 py-2.5 text-center">
                  <button onClick={() => remover.mutate(i.id)} className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50">
                    <Trash2 className="size-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
