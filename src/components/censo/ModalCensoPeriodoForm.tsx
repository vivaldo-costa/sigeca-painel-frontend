import { useState, type FormEvent } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useCriarCensoPeriodo } from '@/hooks/useCenso'
import { getApiErrorMessage } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Campo, Linha2, NumeroField, TextField } from '@/components/crud/FormShell'
import type { CensoPeriodoFormPayload } from '@/types/censo'
import { notificar } from '@/lib/notificar'

export function ModalCensoPeriodoForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<CensoPeriodoFormPayload>({ titulo: '', data_inicio: '', data_fim: '', valor_por_membro: '', ativo: true })
  const criar = useCriarCensoPeriodo()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      await criar.mutateAsync(form)
      onClose()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível criar o período.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">Novo Período de Censo</h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
          <Campo label="Título"><TextField required value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} placeholder="Ex.: Censo 2026" /></Campo>
          <Linha2>
            <Campo label="Início"><TextField type="date" required value={form.data_inicio} onChange={(e) => setForm((f) => ({ ...f, data_inicio: e.target.value }))} /></Campo>
            <Campo label="Fim"><TextField type="date" required value={form.data_fim} onChange={(e) => setForm((f) => ({ ...f, data_fim: e.target.value }))} /></Campo>
          </Linha2>
          <Campo label="Valor do Censo por membro (Kz)">
            <NumeroField
              decimal placeholder="0.00"
              value={form.valor_por_membro}
              onValor={(v) => setForm((f) => ({ ...f, valor_por_membro: v }))}
            />
          </Campo>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={criar.isPending} className="flex-1">
              {criar.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Criar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
