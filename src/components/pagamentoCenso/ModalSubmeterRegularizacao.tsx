import { useState, useMemo, type FormEvent } from 'react'
import { X, Loader2, UserRound, Coins } from 'lucide-react'
import { useCensoPeriodos } from '@/hooks/useCenso'
import { useSubmeterPagamentoCenso } from '@/hooks/usePagamentoCenso'
import { dioceseHooks, agrupamentoHooks } from '@/hooks/useEstrutura'
import { useUtilizadores } from '@/hooks/useUtilizadores'
import { getApiErrorMessage } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Campo, NumeroField, SelectField } from '@/components/crud/FormShell'
import { notificar } from '@/lib/notificar'
import { formatarAgrupamento } from '@/lib/formatadores'

interface Props { onClose: () => void }

export function ModalSubmeterRegularizacao({ onClose }: Props) {
  const [periodoCensoId, setPeriodoCensoId] = useState<number | ''>('')
  const [dioceseId, setDioceseId] = useState<number | ''>('')
  const [agrupamentosIds, setAgrupamentosIds] = useState<number[]>([])
  const [valorTotal, setValorTotal] = useState('')
  const [valorEditadoManualmente, setValorEditadoManualmente] = useState(false)
  const [membrosSelecionados, setMembrosSelecionados] = useState<number[]>([])
  const [comprovativo, setComprovativo] = useState<File | null>(null)

  const { data: periodos } = useCensoPeriodos()
  const { data: dioceses } = dioceseHooks.useList()
  const { data: agrupamentos } = agrupamentoHooks.useList()
  // Por número do agrupamento (há agrupamentos com o mesmo nome)
  const agrupamentosDaDiocese = useMemo(
    () => (agrupamentos ?? [])
      .filter((a) => dioceseId && a.diocese_id === dioceseId)
      .sort((x, y) => (Number(x.ab_agrupamento) || 0) - (Number(y.ab_agrupamento) || 0) || x.nome.localeCompare(y.nome)),
    [agrupamentos, dioceseId],
  )
  const { data: membrosDisponiveis, isFetching: aCarregarMembros } = useUtilizadores({
    agrupamentoIds: agrupamentosIds.length > 0 ? agrupamentosIds.join(',') : undefined,
    porPagina: 5000,
    estado: 'ACTIVO',
  })
  const membros = membrosDisponiveis?.dados ?? []
  const submeter = useSubmeterPagamentoCenso()

  const periodoSelecionado = periodos?.find((p) => p.id === periodoCensoId)
  const valorPorMembro = periodoSelecionado ? Number(periodoSelecionado.valor_por_membro) : 0
  const valorSugerido = valorPorMembro * membrosSelecionados.length

  function alternarAgrupamento(id: number) {
    setAgrupamentosIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
    setMembrosSelecionados([])
  }

  function marcarTodosAgrupamentos() {
    const todos = agrupamentosDaDiocese.map((a) => a.id)
    setAgrupamentosIds((prev) => (prev.length === todos.length ? [] : todos))
    setMembrosSelecionados([])
  }

  function marcarTodosMembros() {
    setMembrosSelecionados((prev) => (prev.length === membros.length ? [] : membros.map((m) => m.id)))
    setValorEditadoManualmente(false)
  }

  function alternarMembro(id: number) {
    setMembrosSelecionados((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
    setValorEditadoManualmente(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!periodoCensoId || !dioceseId) { notificar.erro('Escolhe o período e a diocese.'); return }
    if (agrupamentosIds.length === 0) { notificar.erro('Selecciona pelo menos um agrupamento.'); return }
    if (membrosSelecionados.length === 0) { notificar.erro('Selecciona pelo menos um membro a regularizar.'); return }
    if (!comprovativo) { notificar.erro('Anexa o comprovativo de pagamento.'); return }

    const form = new FormData()
    form.append('periodo_censo_id', String(periodoCensoId))
    form.append('diocese_id', String(dioceseId))
    form.append('agrupamentos_ids', JSON.stringify(agrupamentosIds))
    form.append('valor_total', (valorEditadoManualmente ? valorTotal : String(valorSugerido)) || '0')
    form.append('membros_ids', JSON.stringify(membrosSelecionados))
    form.append('comprovativo', comprovativo)

    try {
      await submeter.mutateAsync(form)
      onClose()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível submeter o pagamento.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">Submeter Regularização</h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">

          <Campo label="Período">
            <SelectField value={periodoCensoId} onChange={(e) => setPeriodoCensoId(Number(e.target.value) || '')}>
              <option value="">-- Seleccionar --</option>
              {periodos?.filter((p) => p.ativo).map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
            </SelectField>
          </Campo>

          {periodoSelecionado && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[12.5px] font-semibold text-amber-800">
              <Coins className="size-3.5 shrink-0" />
              Valor do Censo neste período: {valorPorMembro.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz por membro
            </div>
          )}

          <Campo label="Diocese">
            <SelectField
              value={dioceseId}
              onChange={(e) => { setDioceseId(Number(e.target.value) || ''); setAgrupamentosIds([]); setMembrosSelecionados([]) }}
            >
              <option value="">-- Seleccionar --</option>
              {dioceses?.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </SelectField>
          </Campo>

          {dioceseId && (
            <Campo label={`Agrupamentos a regularizar (${agrupamentosIds.length} seleccionado${agrupamentosIds.length !== 1 ? 's' : ''})`}>
              {agrupamentosDaDiocese.length > 0 && (
                <button type="button" onClick={marcarTodosAgrupamentos} className="mb-1 text-[12px] font-semibold text-badge-blue-text hover:underline">
                  {agrupamentosIds.length === agrupamentosDaDiocese.length ? 'Desmarcar todos' : 'Marcar todos'}
                </button>
              )}
              <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                {agrupamentosDaDiocese.length === 0 && <p className="p-2 text-[12.5px] text-subtle">Nenhum agrupamento encontrado nesta diocese.</p>}
                {agrupamentosDaDiocese.map((a) => (
                  <label key={a.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[12.5px] hover:bg-bg">
                    <input type="checkbox" checked={agrupamentosIds.includes(a.id)} onChange={() => alternarAgrupamento(a.id)} className="size-3.5" />
                    <span className="flex-1">{formatarAgrupamento(a)}</span>
                  </label>
                ))}
              </div>
            </Campo>
          )}

          {agrupamentosIds.length > 0 && (
            <Campo label={`Membros a regularizar (${membrosSelecionados.length} de ${membros.length} seleccionado${membrosSelecionados.length !== 1 ? 's' : ''})`}>
              {membros.length > 0 && (
                <button type="button" onClick={marcarTodosMembros} className="mb-1 text-[12px] font-semibold text-badge-blue-text hover:underline">
                  {membrosSelecionados.length === membros.length ? 'Desmarcar todos' : `Marcar todos (${membros.length})`}
                </button>
              )}
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                {aCarregarMembros && membros.length === 0 && <p className="flex items-center gap-2 p-2 text-[12.5px] text-subtle"><Loader2 className="size-3.5 animate-spin" /> A carregar membros…</p>}
                {!aCarregarMembros && membros.length === 0 && <p className="p-2 text-[12.5px] text-subtle">Nenhum membro activo nestes agrupamentos.</p>}
                {membros.map((m) => (
                  <label key={m.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[12.5px] hover:bg-bg">
                    <input type="checkbox" checked={membrosSelecionados.includes(m.id)} onChange={() => alternarMembro(m.id)} className="size-3.5" />
                    <UserRound className="size-3.5 text-subtle" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{m.nome}</span>
                      <span className="block text-[11px] text-subtle">{[m.seccao_nome, m.ab_agrupamento].filter(Boolean).join(' · ') || '—'}</span>
                    </span>
                    <span className="font-mono text-[11px] text-subtle">{m.codigo_associado}</span>
                  </label>
                ))}
              </div>
            </Campo>
          )}

          {valorPorMembro > 0 && membrosSelecionados.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12.5px] text-amber-900">
              <span className="font-semibold">{membrosSelecionados.length}</span> membro(s) × {valorPorMembro.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz ={' '}
              <span className="font-bold">{valorSugerido.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz</span> a pagar
            </div>
          )}

          <Campo label={`Valor total pago (Kz)${!valorEditadoManualmente && valorPorMembro > 0 ? ' — sugerido automaticamente' : ''}`}>
            <NumeroField
              decimal
              value={valorEditadoManualmente ? valorTotal : (valorSugerido || '')}
              onValor={(v) => { setValorEditadoManualmente(true); setValorTotal(v) }}
            />
          </Campo>

          <Campo label="Comprovativo de pagamento">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setComprovativo(e.target.files?.[0] ?? null)}
              className="block w-full text-[12.5px] text-subtle file:mr-3 file:rounded-lg file:border-0 file:bg-bg file:px-3 file:py-2 file:text-[12px] file:font-medium file:text-text"
            />
          </Campo>

          <div className="flex gap-3 border-t border-border pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={submeter.isPending} className="flex-1">
              {submeter.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Submeter
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
