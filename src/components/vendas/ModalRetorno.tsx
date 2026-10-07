import { useMemo, useState, type FormEvent } from 'react'
import { X, Loader2, RotateCcw, Repeat } from 'lucide-react'
import { useVendaParaRetorno, useVariantesVenda, useRegistarRetorno } from '@/hooks/useStock'
import { Campo, TextField, SelectField, TextareaField } from '@/components/crud/FormShell'
import { Button } from '@/components/ui/Button'
import { useConfirmar } from '@/components/ui/ConfirmProvider'
import { getApiErrorMessage } from '@/lib/api'
import { notificar } from '@/lib/notificar'
import { descreverVariante } from '@/types/stock'
import { cn } from '@/lib/cn'

interface Props {
  pedidoId: number
  tipoInicial?: 'devolucao' | 'troca'
  onClose: () => void
}

/**
 * Devolução ou troca a partir da VENDA/ENCOMENDA ORIGINAL.
 * Troca de tamanho: venda original → artigo → tamanho actual → novo
 * tamanho → validação do stock → confirmação.
 */
export function ModalRetorno({ pedidoId, tipoInicial = 'devolucao', onClose }: Props) {
  const { data: venda, isLoading } = useVendaParaRetorno(pedidoId)
  const { data: variantes } = useVariantesVenda('')
  const registar = useRegistarRetorno()
  const confirmar = useConfirmar()
  const [tipo, setTipo] = useState<'devolucao' | 'troca'>(tipoInicial)
  const [motivo, setMotivo] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [quantidades, setQuantidades] = useState<Record<number, number>>({})
  const [novas, setNovas] = useState<Record<number, number>>({})

  const variantesPorProduto = useMemo(() => {
    const m = new Map<number, typeof variantes>()
    for (const v of variantes ?? []) {
      if (!m.has(v.produto_id)) m.set(v.produto_id, [])
      m.get(v.produto_id)!.push(v)
    }
    return m
  }, [variantes])

  const seleccionados = (venda?.itens ?? []).filter((i) => (quantidades[i.id] ?? 0) > 0)

  async function submeter(e: FormEvent) {
    e.preventDefault()
    if (!venda) return
    if (!seleccionados.length) { notificar.aviso('Escolhe pelo menos um artigo e a quantidade.'); return }
    if (!motivo.trim()) { notificar.aviso('Indica o motivo.'); return }
    if (tipo === 'troca') {
      for (const i of seleccionados) {
        const nova = variantesPorProduto.get(i.produto_id)?.find((v) => v.variacao_id === novas[i.id])
        if (!nova) { notificar.aviso(`Escolhe o novo tamanho/variante de "${i.produto_nome}".`); return }
        if (nova.variacao_id !== i.variacao_id && nova.stock_disponivel < quantidades[i.id]) {
          notificar.erro('Não existe stock disponível para o tamanho seleccionado.')
          return
        }
      }
    }
    const unidades = seleccionados.reduce((n, i) => n + quantidades[i.id], 0)
    const ok = await confirmar({
      titulo: tipo === 'troca' ? 'Confirmar troca' : 'Confirmar devolução',
      mensagem: tipo === 'troca'
        ? `Trocar ${unidades} unidade(s) da venda #${venda.id}? O artigo devolvido entra no stock e o novo sai do stock.`
        : `Devolver ${unidades} unidade(s) da venda #${venda.id}? Os artigos voltam ao stock físico.`,
      textoConfirmar: tipo === 'troca' ? 'Confirmar troca' : 'Confirmar devolução',
    })
    if (!ok) return
    try {
      const r = await registar.mutateAsync({
        pedido_id: venda.id,
        tipo,
        motivo: motivo.trim(),
        observacoes: observacoes.trim() || undefined,
        itens: seleccionados.map((i) => ({
          pedido_item_id: i.id,
          quantidade: quantidades[i.id],
          ...(tipo === 'troca' ? { nova_variacao_id: novas[i.id] } : {}),
        })),
      })
      notificar.sucesso(r.mensagem ?? 'Registado.')
      onClose()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível registar.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">Devolução / Troca — Venda #{pedidoId}</h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>

        {isLoading || !venda ? (
          <div className="flex justify-center py-12"><Loader2 className="size-5 animate-spin text-subtle" /></div>
        ) : (
          <form onSubmit={submeter} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <p className="text-[12.5px] text-muted">
              {venda.cliente_nome} · {venda.cliente_codigo} · {new Date(venda.pedido_em).toLocaleString('pt-PT')} · {venda.origem === 'pos' ? 'Venda POS' : 'Encomenda do Portal'}
            </p>

            {!venda.pode_devolver ? (
              <p className="rounded-lg bg-badge-orange-bg px-3 py-2 text-[12.5px] text-badge-orange-text">
                Só se podem devolver/trocar artigos de vendas concluídas ou encomendas já levantadas/enviadas.
              </p>
            ) : (
              <>
                <div className="flex gap-2">
                  {([['devolucao', 'Devolução', RotateCcw], ['troca', 'Troca', Repeat]] as const).map(([valor, label, Icone]) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => setTipo(valor)}
                      className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-semibold',
                        tipo === valor ? 'border-[#111827] bg-[#111827] text-white' : 'border-border text-muted hover:bg-bg')}
                    >
                      <Icone className="size-3.5" /> {label}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  {venda.itens.map((i) => {
                    const opcoes = variantesPorProduto.get(i.produto_id) ?? []
                    const nova = opcoes.find((v) => v.variacao_id === novas[i.id])
                    const q = quantidades[i.id] ?? 0
                    return (
                      <div key={i.id} className="rounded-lg border border-border p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-text">{i.produto_nome}</p>
                            <p className="text-[11.5px] text-subtle">
                              Tamanho actual: {descreverVariante(i)}{i.sku ? ` · ${i.sku}` : ''} · comprado {i.quantidade}
                              {i.quantidade_devolvida > 0 && ` · já devolvido/trocado ${i.quantidade_devolvida}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-[12px]">
                            <span className="text-muted">Qtd.</span>
                            <TextField
                              type="number" min="0" max={i.quantidade_disponivel_retorno} step="1"
                              disabled={i.quantidade_disponivel_retorno < 1}
                              value={q || ''}
                              placeholder="0"
                              onChange={(e) => setQuantidades((m) => ({ ...m, [i.id]: Math.min(Math.max(0, Math.floor(Number(e.target.value) || 0)), i.quantidade_disponivel_retorno) }))}
                              style={{ width: 80 }}
                            />
                            <span className="text-subtle">/ {i.quantidade_disponivel_retorno}</span>
                          </div>
                        </div>
                        {tipo === 'troca' && q > 0 && (
                          <div className="mt-2">
                            <Campo label="Novo tamanho / variante">
                              <SelectField value={novas[i.id] ?? ''} onChange={(e) => setNovas((m) => ({ ...m, [i.id]: Number(e.target.value) }))}>
                                <option value="">-- Escolher --</option>
                                {opcoes.map((v) => (
                                  <option key={v.variacao_id} value={v.variacao_id} disabled={v.variacao_id !== i.variacao_id && v.stock_disponivel < q}>
                                    {descreverVariante(v)} — {v.stock_disponivel} disponível(eis){v.variacao_id === i.variacao_id ? ' (mesmo artigo)' : ''}
                                  </option>
                                ))}
                              </SelectField>
                            </Campo>
                            {nova && nova.variacao_id !== i.variacao_id && nova.stock_disponivel < q && (
                              <p className="mt-1 text-[11.5px] font-medium text-badge-red-text">Não existe stock disponível para o tamanho seleccionado.</p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <Campo label="Motivo"><TextField required value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder={tipo === 'troca' ? 'Ex.: Tamanho errado' : 'Ex.: Artigo com defeito'} /></Campo>
                <Campo label="Observações (opcional)"><TextareaField value={observacoes} onChange={(e) => setObservacoes(e.target.value)} /></Campo>

                <div className="flex gap-3 border-t border-border pt-4">
                  <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                  <Button type="submit" loading={registar.isPending} className="flex-1">
                    {tipo === 'troca' ? 'Registar troca' : 'Registar devolução'}
                  </Button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
