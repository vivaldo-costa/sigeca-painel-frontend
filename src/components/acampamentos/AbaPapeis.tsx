import { useState } from 'react'
import { Plus, Trash2, Search } from 'lucide-react'
import { useEventoPapeis, useAtribuirPapel, useRemoverPapel } from '@/hooks/useEventoPapeis'
import { useUtilizadores } from '@/hooks/useUtilizadores'
import { getApiErrorMessage } from '@/lib/api'
import { notificar } from '@/lib/notificar'
import { Card } from '@/components/ui/Card'
import { PAPEIS_EVENTO, type PapelEvento } from '@/types/eventoPapel'

export function AbaPapeis({ atividadeId }: { atividadeId: number }) {
  const { data: papeis } = useEventoPapeis(atividadeId)
  const atribuir = useAtribuirPapel(atividadeId)
  const remover = useRemoverPapel(atividadeId)

  const [pesquisa, setPesquisa] = useState('')
  const [utilizadorEscolhido, setUtilizadorEscolhido] = useState<{ id: number; nome: string } | null>(null)
  const [papel, setPapel] = useState<PapelEvento>('participante')

  const { data: resultados } = useUtilizadores({ pesquisa, porPagina: 6 })

  async function handleAtribuir() {
    if (!utilizadorEscolhido) { notificar.erro('Escolhe um utilizador.'); return }
    try {
      await atribuir.mutateAsync({ utilizador_id: utilizadorEscolhido.id, papel })
      setUtilizadorEscolhido(null)
      setPesquisa('')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível atribuir o papel.'))
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Atribuir novo papel</p>
        <div className="flex flex-wrap gap-2">
          {utilizadorEscolhido ? (
            <div className="flex items-center gap-2 rounded-lg bg-bg px-3 py-2 text-[13px]">
              {utilizadorEscolhido.nome}
              <button onClick={() => setUtilizadorEscolhido(null)} className="text-[11px] text-subtle hover:text-text">Trocar</button>
            </div>
          ) : (
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
              <input
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                placeholder="Pesquisar utilizador..."
                className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]"
              />
              {pesquisa.length >= 2 && resultados && resultados.dados.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-white shadow-lg">
                  {resultados.dados.map((u) => (
                    <button key={u.id} onClick={() => setUtilizadorEscolhido({ id: u.id, nome: u.nome })} className="flex w-full items-center justify-between px-3 py-2 text-left text-[12.5px] hover:bg-bg">
                      <span>{u.nome}</span>
                      <span className="font-mono text-[11px] text-subtle">{u.codigo_associado}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <select value={papel} onChange={(e) => setPapel(e.target.value as PapelEvento)} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]">
            {PAPEIS_EVENTO.map((p) => <option key={p.valor} value={p.valor}>{p.label}</option>)}
          </select>
          <button onClick={handleAtribuir} disabled={atribuir.isPending} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white disabled:opacity-50">
            <Plus className="size-3.5" /> Atribuir
          </button>
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3.5 py-2.5 font-medium">Utilizador</th>
              <th className="px-3.5 py-2.5 font-medium">Papel</th>
              <th className="px-3.5 py-2.5 font-medium">Atribuído por</th>
              <th className="px-3.5 py-2.5 text-center font-medium">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {papeis?.length === 0 && <tr><td colSpan={4} className="py-10 text-center text-subtle">Nenhum papel atribuído ainda.</td></tr>}
            {papeis?.map((p) => (
              <tr key={p.id} className="hover:bg-bg">
                <td className="px-3.5 py-2.5">
                  <p className="font-medium text-text">{p.nome}</p>
                  <p className="font-mono text-[11px] text-subtle">{p.codigo_associado}</p>
                </td>
                <td className="px-3.5 py-2.5 text-muted">{PAPEIS_EVENTO.find((x) => x.valor === p.papel)?.label}</td>
                <td className="px-3.5 py-2.5 text-muted">{p.atribuido_por_nome ?? '—'}</td>
                <td className="px-3.5 py-2.5 text-center">
                  <button onClick={() => remover.mutate(p.id)} className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50">
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
