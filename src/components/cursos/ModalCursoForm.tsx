import { useState, type FormEvent } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useCriarCurso, useAtualizarCurso } from '@/hooks/useCursos'
import { useCatalogoFormacoes } from '@/hooks/useCatalogoFormacoes'
import { getApiErrorMessage } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Campo, Linha2, TextField, SelectField } from '@/components/crud/FormShell'
import type { CursoDetalhe, CursoFormPayload } from '@/types/curso'
import { notificar } from '@/lib/notificar'

interface Props { curso: CursoDetalhe | null; onClose: () => void }

function paraForm(c: CursoDetalhe | null): CursoFormPayload {
  return {
    titulo: c?.titulo ?? '',
    descricao: c?.descricao ?? '',
    local: c?.local ?? '',
    data_inicio: c?.data_inicio ? c.data_inicio.slice(0, 10) : '',
    data_fim: c?.data_fim ? c.data_fim.slice(0, 10) : '',
    catalogo_formacao_id: c?.catalogo_formacao_id ?? '',
    carga_horaria: c?.carga_horaria ? String(c.carga_horaria) : '',
    certificacao_automatica: c ? !!c.certificacao_automatica : false,
    vagas: c?.vagas ? String(c.vagas) : '',
    ativo: c ? !!c.ativo : true,
  }
}

export function ModalCursoForm({ curso, onClose }: Props) {
  const [form, setForm] = useState<CursoFormPayload>(paraForm(curso))

  const { data: catalogo } = useCatalogoFormacoes('')
  const criar = useCriarCurso()
  const atualizar = useAtualizarCurso()
  const aGuardar = criar.isPending || atualizar.isPending

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      if (curso) await atualizar.mutateAsync({ id: curso.id, payload: form })
      else await criar.mutateAsync(form)
      onClose()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível guardar o curso.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">{curso ? 'Editar Curso' : 'Novo Curso'}</h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">

          <Campo label="Título"><TextField required value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} /></Campo>

          <Campo label="Item do Catálogo (opcional)">
            <SelectField value={form.catalogo_formacao_id} onChange={(e) => setForm((f) => ({ ...f, catalogo_formacao_id: Number(e.target.value) || '' }))}>
              <option value="">-- Nenhum --</option>
              {catalogo?.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </SelectField>
          </Campo>

          <Campo label="Descrição">
            <textarea
              rows={2}
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              className="w-full resize-none rounded-xl border border-border px-3.5 py-2 text-[13px] outline-none focus:border-[#111827]"
            />
          </Campo>

          <Campo label="Local"><TextField value={form.local} onChange={(e) => setForm((f) => ({ ...f, local: e.target.value }))} /></Campo>

          <Linha2>
            <Campo label="Data de início"><TextField type="date" required value={form.data_inicio} onChange={(e) => setForm((f) => ({ ...f, data_inicio: e.target.value }))} /></Campo>
            <Campo label="Data de fim"><TextField type="date" value={form.data_fim} onChange={(e) => setForm((f) => ({ ...f, data_fim: e.target.value }))} /></Campo>
          </Linha2>

          <Linha2>
            <Campo label="Carga horária (h)"><TextField type="number" min="0" value={form.carga_horaria} onChange={(e) => setForm((f) => ({ ...f, carga_horaria: e.target.value }))} /></Campo>
            <Campo label="Vagas"><TextField type="number" min="0" value={form.vagas} onChange={(e) => setForm((f) => ({ ...f, vagas: e.target.value }))} /></Campo>
          </Linha2>

          <label className="flex items-center gap-2.5 rounded-xl bg-bg px-3.5 py-3">
            <input type="checkbox" checked={form.certificacao_automatica} onChange={(e) => setForm((f) => ({ ...f, certificacao_automatica: e.target.checked }))} className="size-4" />
            <span className="text-[13px] text-text">Emitir certificado automaticamente a quem for aprovado</span>
          </label>

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
