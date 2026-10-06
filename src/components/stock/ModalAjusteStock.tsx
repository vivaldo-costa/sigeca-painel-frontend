import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { useAjustarStock, useMotivosAjuste, useVariantesVenda } from '@/hooks/useStock'
import { Campo, Linha2, TextField, SelectField, TextareaField } from '@/components/crud/FormShell'
import { Button } from '@/components/ui/Button'
import { useConfirmar } from '@/components/ui/ConfirmProvider'
import { getApiErrorMessage } from '@/lib/api'
import { notificar } from '@/lib/notificar'
import { descreverVariante, type LinhaInventario } from '@/types/stock'
import { cn } from '@/lib/cn'

interface Props {
  /** Variante já escolhida (vindo do Inventário); sem ela, mostra um selector. */
  variante?: LinhaInventario | null
  onClose: () => void
}

/** Ajuste manual de stock (entrada/saída) — motivo obrigatório, fica nos movimentos e na auditoria. */
export function ModalAjusteStock({ variante: varianteInicial, onClose }: Props) {
  const [pesquisa, setPesquisa] = useState('')
  const { data: variantes } = useVariantesVenda(pesquisa)
  const { data: motivos } = useMotivosAjuste()
  const ajustar = useAjustarStock()
  const confirmar = useConfirmar()
  const [variante, setVariante] = useState<LinhaInventario | null>(varianteInicial ?? null)
  const [sentido, setSentido] = useState<'entrada' | 'saida'>('entrada')
  const [quantidade, setQuantidade] = useState('')
  const [motivo, setMotivo] = useState('')
  const [observacao, setObservacao] = useState('')

  const q = Math.floor(Number(quantidade) || 0)
  const fisicoDepois = variante ? variante.stock_fisico + (sentido === 'entrada' ? q : -q) : 0
  const excede = variante && sentido === 'saida' && q > variante.stock_disponivel

  async function submeter(e: FormEvent) {
    e.preventDefault()
    if (!variante) { notificar.aviso('Escolhe o artigo.'); return }
    if (q < 1) { notificar.aviso('Indica a quantidade.'); return }
    if (!motivo) { notificar.aviso('Escolhe o motivo.'); return }
    if (motivo === 'Outros' && !observacao.trim()) { notificar.aviso('Descreve o motivo em "Observação".'); return }
    if (excede) { notificar.erro(`Só é possível retirar ${variante.stock_disponivel} unidade(s).`); return }
    const ok = await confirmar({
      titulo: sentido === 'entrada' ? 'Confirmar entrada de stock' : 'Confirmar saída de stock',
      mensagem: `${sentido === 'entrada' ? 'Entrada' : 'Saída'} de ${q} unidade(s) de "${variante.produto_nome} (${descreverVariante(variante)})" — motivo: ${motivo}. Stock físico passa de ${variante.stock_fisico} para ${fisicoDepois}.`,
      textoConfirmar: 'Confirmar ajuste',
      perigoso: sentido === 'saida',
    })
    if (!ok) return
    try {
      await ajustar.mutateAsync({ variacao_id: variante.variacao_id, sentido, quantidade: q, motivo, observacao: observacao.trim() || undefined })
      notificar.sucesso('Ajuste registado.')
      onClose()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível registar o ajuste.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">Ajuste de stock</h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>
        <form onSubmit={submeter} className="space-y-4 px-6 py-5">
          {variante ? (
            <div className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-[12.5px]">
              <div>
                <p className="font-medium text-text">{variante.produto_nome} — {descreverVariante(variante)}</p>
                <p className="text-[11.5px] text-subtle">
                  {variante.sku} · físico {variante.stock_fisico} · reservado {variante.stock_reservado} · disponível {variante.stock_disponivel}
                </p>
              </div>
              {!varianteInicial && <button type="button" onClick={() => setVariante(null)} className="text-[11px] text-subtle hover:text-text">Trocar</button>}
            </div>
          ) : (
            <Campo label="Artigo">
              <TextField value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} placeholder="Pesquisar por produto ou SKU…" autoFocus />
              <div className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-border">
                {(variantes ?? []).slice(0, 40).map((v) => (
                  <button key={v.variacao_id} type="button" onClick={() => setVariante(v)} className="flex w-full items-center justify-between px-3 py-1.5 text-left text-[12px] hover:bg-bg">
                    <span>{v.produto_nome} — {descreverVariante(v)}</span>
                    <span className="font-mono text-[11px] text-subtle">{v.sku} · {v.stock_disponivel} disp.</span>
                  </button>
                ))}
              </div>
            </Campo>
          )}

          <div className="flex gap-2">
            {(['entrada', 'saida'] as const).map((s) => (
              <button key={s} type="button" onClick={() => setSentido(s)}
                className={cn('flex-1 rounded-lg border px-3 py-2 text-[13px] font-semibold',
                  sentido === s ? 'border-[#111827] bg-[#111827] text-white' : 'border-border text-muted hover:bg-bg')}>
                {s === 'entrada' ? 'Entrada (+)' : 'Saída (−)'}
              </button>
            ))}
          </div>

          <Linha2>
            <Campo label="Quantidade">
              <TextField type="number" min="1" step="1" required value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
            </Campo>
            <Campo label="Motivo">
              <SelectField required value={motivo} onChange={(e) => setMotivo(e.target.value)}>
                <option value="">-- Escolher --</option>
                {(motivos ?? []).map((m) => <option key={m} value={m}>{m}</option>)}
              </SelectField>
            </Campo>
          </Linha2>
          <Campo label={`Observação${motivo === 'Outros' ? ' (obrigatória)' : ''}`}>
            <TextareaField value={observacao} onChange={(e) => setObservacao(e.target.value)} />
          </Campo>

          {variante && q > 0 && (
            <p className={cn('rounded-lg px-3 py-2 text-[12px]', excede ? 'bg-badge-red-bg text-badge-red-text' : 'bg-bg text-muted')}>
              {excede
                ? `Só é possível retirar ${variante.stock_disponivel} unidade(s) — o restante está reservado para encomendas.`
                : `Stock físico: ${variante.stock_fisico} → ${fisicoDepois}`}
            </p>
          )}

          <div className="flex gap-3 border-t border-border pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={ajustar.isPending} disabled={Boolean(excede)} className="flex-1">Registar ajuste</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
