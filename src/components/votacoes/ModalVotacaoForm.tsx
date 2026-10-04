import { useState, type FormEvent } from 'react'
import { X, Loader2, ImagePlus } from 'lucide-react'
import { useCriarVotacao, useAtualizarVotacao } from '@/hooks/useVotacoes'
import { getApiErrorMessage } from '@/lib/api'
import { uploadUrl } from '@/lib/uploads'
import { Button } from '@/components/ui/Button'
import { Campo, Linha2, TextField, SelectField } from '@/components/crud/FormShell'
import type { VotacaoPainel, VotacaoFormPayload } from '@/types/votacao'
import { notificar } from '@/lib/notificar'

interface Props { votacao: VotacaoPainel | null; onClose: () => void }

function paraForm(v: VotacaoPainel | null): VotacaoFormPayload {
  return {
    titulo: v?.titulo ?? '',
    descricao: v?.descricao ?? '',
    data_inicio: v?.data_inicio ? v.data_inicio.slice(0, 10) : '',
    data_fim: v?.data_fim ? v.data_fim.slice(0, 10) : '',
    ativo: v ? !!v.ativo : true,
  }
}

export function ModalVotacaoForm({ votacao, onClose }: Props) {
  const [form, setForm] = useState<VotacaoFormPayload>(paraForm(votacao))
  const [imagem, setImagem] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const criar = useCriarVotacao()
  const atualizar = useAtualizarVotacao()
  const aGuardar = criar.isPending || atualizar.isPending

  function onImagemChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImagem(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      if (votacao) await atualizar.mutateAsync({ id: votacao.id, payload: form, imagem })
      else await criar.mutateAsync({ payload: form, imagem })
      onClose()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível guardar a votação.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">{votacao ? 'Editar Votação' : 'Nova Votação'}</h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">

          <div className="flex items-center gap-4">
            <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-bg">
              {preview || votacao?.imagem ? (
                <img src={preview ?? uploadUrl('votacoes', votacao!.imagem)!} className="size-full object-cover" alt="" />
              ) : (
                <ImagePlus className="size-5 text-subtle" />
              )}
            </div>
            <label className="cursor-pointer rounded-lg border border-border px-3 py-2 text-[12.5px] font-medium text-text transition hover:bg-bg">
              Escolher imagem
              <input type="file" accept="image/*" className="hidden" onChange={onImagemChange} />
            </label>
          </div>

          <Campo label="Título"><TextField required value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} /></Campo>
          <Campo label="Descrição">
            <textarea
              rows={3}
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              className="w-full resize-none rounded-xl border border-border px-3.5 py-2 text-[13px] outline-none focus:border-[#111827]"
            />
          </Campo>
          <Linha2>
            <Campo label="Data de início"><TextField type="date" value={form.data_inicio} onChange={(e) => setForm((f) => ({ ...f, data_inicio: e.target.value }))} /></Campo>
            <Campo label="Data de fim"><TextField type="date" value={form.data_fim} onChange={(e) => setForm((f) => ({ ...f, data_fim: e.target.value }))} /></Campo>
          </Linha2>
          <Campo label="Estado">
            <SelectField value={form.ativo ? '1' : '0'} onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.value === '1' }))}>
              <option value="1">Activa</option>
              <option value="0">Inactiva</option>
            </SelectField>
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
