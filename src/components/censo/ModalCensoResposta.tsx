import { useState, type FormEvent } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useGuardarCensoResposta } from '@/hooks/useCenso'
import { getApiErrorMessage } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Campo, Linha2, TextField } from '@/components/crud/FormShell'
import type { CensoRespostaResumo, CensoRespostaFormPayload } from '@/types/censo'
import { notificar } from '@/lib/notificar'

interface Props { periodoId: number; resposta: CensoRespostaResumo; onClose: () => void }

const SECCOES = ['Alcateia', 'Castores', 'Exploradores Juniores', 'Flotilha', 'Exploradores Seniores', 'Frota', 'Clã', 'Comunidade']

export function ModalCensoResposta({ periodoId, resposta, onClose }: Props) {
  const [form, setForm] = useState<CensoRespostaFormPayload>({
    num_dirigentes: resposta.num_dirigentes ?? 0,
    num_candidatos: resposta.num_candidatos ?? 0,
    contagem_seccoes: resposta.contagem_seccoes ?? {},
    observacoes: resposta.observacoes ?? '',
    estado: resposta.estado === 'submetido' ? 'submetido' : 'rascunho',
  })
  const guardar = useGuardarCensoResposta(periodoId)

  function alterarSeccao(nome: string, valor: string) {
    setForm((f) => ({ ...f, contagem_seccoes: { ...f.contagem_seccoes, [nome]: Number(valor) || 0 } }))
  }

  async function submeter(estadoFinal: 'rascunho' | 'submetido', e: FormEvent) {
    e.preventDefault()
    try {
      await guardar.mutateAsync({ agrupamentoId: resposta.agrupamento_id, payload: { ...form, estado: estadoFinal } })
      onClose()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível guardar a resposta.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">Censo — {resposta.agrupamento_nome}</h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>

        <form onSubmit={(e) => submeter('submetido', e)} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">

          <Linha2>
            <Campo label="Nº de Dirigentes"><TextField type="number" min="0" value={form.num_dirigentes} onChange={(e) => setForm((f) => ({ ...f, num_dirigentes: Number(e.target.value) || 0 }))} /></Campo>
            <Campo label="Nº de Candidatos"><TextField type="number" min="0" value={form.num_candidatos} onChange={(e) => setForm((f) => ({ ...f, num_candidatos: Number(e.target.value) || 0 }))} /></Campo>
          </Linha2>

          <div>
            <p className="mb-2 text-[12.5px] font-medium text-muted">Nº de escuteiros por secção</p>
            <div className="grid grid-cols-2 gap-3">
              {SECCOES.map((s) => (
                <Campo key={s} label={s}>
                  <TextField type="number" min="0" value={form.contagem_seccoes[s] ?? 0} onChange={(e) => alterarSeccao(s, e.target.value)} />
                </Campo>
              ))}
            </div>
          </div>

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
            <button
              type="button"
              onClick={(e) => submeter('rascunho', e as unknown as FormEvent)}
              disabled={guardar.isPending}
              className="flex-1 rounded-full border border-border py-2.5 text-[13px] font-semibold text-text transition hover:bg-bg disabled:opacity-50"
            >
              Guardar rascunho
            </button>
            <Button type="submit" loading={guardar.isPending} className="flex-1">
              {guardar.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Submeter
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
