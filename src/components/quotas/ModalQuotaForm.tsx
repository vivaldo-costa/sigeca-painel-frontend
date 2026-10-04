import { useState, type FormEvent } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useCriarQuota, useAtualizarQuota } from '@/hooks/useQuotas'
import { getApiErrorMessage } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Campo, Linha2, TextField, SelectField } from '@/components/crud/FormShell'
import type { QuotaPainel, QuotaFormPayload, EstadoQuota } from '@/types/quota'
import { notificar } from '@/lib/notificar'

interface Props { quota: QuotaPainel | null; onClose: () => void }

function paraForm(q: QuotaPainel | null): QuotaFormPayload {
  return {
    codigo_associado: q?.codigo_associado ?? '',
    periodo: q?.periodo ?? new Date().toISOString().slice(0, 7),
    valor: q?.valor ?? '',
    estado: q?.estado ?? 'pendente',
    metodo_pagamento: q?.metodo_pagamento ?? '',
    referencia: q?.referencia ?? '',
    data_pagamento: q?.data_pagamento ? q.data_pagamento.slice(0, 10) : '',
    observacoes: q?.observacoes ?? '',
  }
}

export function ModalQuotaForm({ quota, onClose }: Props) {
  const [form, setForm] = useState<QuotaFormPayload>(paraForm(quota))

  const criar = useCriarQuota()
  const atualizar = useAtualizarQuota()
  const aGuardar = criar.isPending || atualizar.isPending

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      if (quota) await atualizar.mutateAsync({ id: quota.id, payload: form })
      else await criar.mutateAsync(form)
      onClose()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível guardar o registo.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">{quota ? 'Editar Quota' : 'Nova Quota'}</h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">

          {!quota && (
            <Campo label="Nº SIGECA do escuteiro">
              <TextField required value={form.codigo_associado} onChange={(e) => setForm((f) => ({ ...f, codigo_associado: e.target.value }))} placeholder="Ex: CA00056000001" />
            </Campo>
          )}
          {quota && (
            <div className="rounded-lg bg-bg px-3 py-2 text-[12.5px]">
              <p className="font-semibold text-text">{quota.utilizador_nome}</p>
              <p className="font-mono text-subtle">{quota.codigo_associado}</p>
            </div>
          )}

          <Linha2>
            <Campo label="Período (AAAA-MM)">
              <TextField
                required
                disabled={!!quota}
                value={form.periodo}
                onChange={(e) => setForm((f) => ({ ...f, periodo: e.target.value }))}
                placeholder="2026-09"
              />
            </Campo>
            <Campo label="Valor (Kz)"><TextField type="number" step="0.01" required value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))} /></Campo>
          </Linha2>

          <Campo label="Estado">
            <SelectField value={form.estado} onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value as EstadoQuota }))}>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="isento">Isento</option>
            </SelectField>
          </Campo>

          {form.estado === 'pago' && (
            <Linha2>
              <Campo label="Método de pagamento"><TextField value={form.metodo_pagamento} onChange={(e) => setForm((f) => ({ ...f, metodo_pagamento: e.target.value }))} placeholder="Numerário, transferência..." /></Campo>
              <Campo label="Data de pagamento"><TextField type="date" value={form.data_pagamento} onChange={(e) => setForm((f) => ({ ...f, data_pagamento: e.target.value }))} /></Campo>
            </Linha2>
          )}
          {form.estado === 'pago' && (
            <Campo label="Referência (opcional)"><TextField value={form.referencia} onChange={(e) => setForm((f) => ({ ...f, referencia: e.target.value }))} /></Campo>
          )}

          <Campo label="Observações">
            <textarea
              rows={2}
              value={form.observacoes}
              onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              className="w-full resize-none rounded-xl border border-border px-3.5 py-2 text-[13px] outline-none focus:border-[#111827]"
            />
          </Campo>

          <div className="flex gap-3 border-t border-border pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={aGuardar} className="flex-1">
              {aGuardar ? <Loader2 className="size-4 animate-spin" /> : null}
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
