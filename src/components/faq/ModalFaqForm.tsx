import { useState, type FormEvent } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useCriarFaq, useAtualizarFaq } from '@/hooks/useFaq'
import { getApiErrorMessage } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Campo, SelectField } from '@/components/crud/FormShell'
import type { FaqPainel, FaqFormPayload } from '@/types/faq'
import { notificar } from '@/lib/notificar'

interface Props { faq: FaqPainel | null; onClose: () => void }

export function ModalFaqForm({ faq, onClose }: Props) {
  const [form, setForm] = useState<FaqFormPayload>({
    pergunta: faq?.pergunta ?? '',
    resposta: faq?.resposta ?? '',
    ativo: faq ? !!faq.ativo : true,
  })

  const criar = useCriarFaq()
  const atualizar = useAtualizarFaq()
  const aGuardar = criar.isPending || atualizar.isPending

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      if (faq) await atualizar.mutateAsync({ id: faq.id, payload: form })
      else await criar.mutateAsync(form)
      onClose()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível guardar.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">{faq ? 'Editar Pergunta' : 'Nova Pergunta'}</h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">

          <Campo label="Pergunta">
            <input
              required
              value={form.pergunta}
              onChange={(e) => setForm((f) => ({ ...f, pergunta: e.target.value }))}
              className="w-full rounded-xl border border-border px-3.5 py-2 text-[13px] outline-none focus:border-[#111827]"
            />
          </Campo>
          <Campo label="Resposta">
            <textarea
              required
              rows={4}
              value={form.resposta}
              onChange={(e) => setForm((f) => ({ ...f, resposta: e.target.value }))}
              className="w-full resize-none rounded-xl border border-border px-3.5 py-2 text-[13px] outline-none focus:border-[#111827]"
            />
          </Campo>
          <Campo label="Estado">
            <SelectField value={form.ativo ? '1' : '0'} onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.value === '1' }))}>
              <option value="1">Activa</option>
              <option value="0">Inactiva</option>
            </SelectField>
          </Campo>

          <div className="flex gap-3 pt-2">
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
