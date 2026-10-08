import { useState, type FormEvent } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useCriarAcampamento, useAtualizarAcampamento } from '@/hooks/useAcampamentos'
import { getApiErrorMessage } from '@/lib/api'
import { CampoAbrangencia } from '@/components/atividades/CampoAbrangencia'
import { CampoCoordenadasBancarias } from '@/components/atividades/CampoCoordenadasBancarias'
import { Button } from '@/components/ui/Button'
import { Campo, Linha2, TextField, SelectField } from '@/components/crud/FormShell'
import type { EventoDetalhe, EventoFormPayload, NivelOrganizador } from '@/types/acampamento'
import { notificar } from '@/lib/notificar'

interface Props { evento: EventoDetalhe | null; onClose: () => void }

function paraForm(e: EventoDetalhe | null): EventoFormPayload {
  return {
    titulo: e?.titulo ?? '',
    lema: e?.lema ?? '',
    descricao: e?.descricao ?? '',
    local: e?.local ?? '',
    data_inicio: e?.data_inicio ? e.data_inicio.slice(0, 10) : '',
    data_fim: e?.data_fim ? e.data_fim.slice(0, 10) : '',
    nivel_organizador: e?.nivel_organizador ?? '',
    nivel_organizador_id: e?.nivel_organizador_id ?? '',
    abrangencia: e?.abrangencia ?? 'nacional',
    dioceses_ids: e?.dioceses_ids ?? [],
    prazo_inscricao: e?.prazo_inscricao ? e.prazo_inscricao.slice(0, 10) : '',
    vagas: e?.vagas ? String(e.vagas) : '',
    capacidade_minima: e?.capacidade_minima ? String(e.capacidade_minima) : '',
    valor: e?.valor ?? '',
    director_id: e?.director_id ?? '',
    ativo: e ? !!e.ativo : true,
    banco: e?.banco ?? '',
    iban: e?.iban ?? '',
    titular_conta: e?.titular_conta ?? '',
  }
}

export function ModalEventoForm({ evento, onClose }: Props) {
  const [form, setForm] = useState<EventoFormPayload>(paraForm(evento))

  const criar = useCriarAcampamento()
  const atualizar = useAtualizarAcampamento()
  const aGuardar = criar.isPending || atualizar.isPending

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      if (evento) await atualizar.mutateAsync({ id: evento.id, payload: form })
      else await criar.mutateAsync(form)
      onClose()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível guardar o evento.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">{evento ? 'Editar Evento' : 'Novo Evento'}</h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">

          <Campo label="Título"><TextField required value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} /></Campo>
          <Campo label="Lema (opcional)"><TextField value={form.lema} onChange={(e) => setForm((f) => ({ ...f, lema: e.target.value }))} /></Campo>

          <Campo label="Descrição">
            <textarea
              rows={2}
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              className="w-full resize-none rounded-xl border border-border px-3.5 py-2 text-[13px] outline-none focus:border-[#111827]"
            />
          </Campo>

          <CampoAbrangencia abrangencia={form.abrangencia} diocesesIds={form.dioceses_ids}
            onChange={(v) => setForm((f) => ({ ...f, ...v }))} />

          <Campo label="Local"><TextField value={form.local} onChange={(e) => setForm((f) => ({ ...f, local: e.target.value }))} /></Campo>

          <Linha2>
            <Campo label="Data de início"><TextField type="date" required value={form.data_inicio} onChange={(e) => setForm((f) => ({ ...f, data_inicio: e.target.value }))} /></Campo>
            <Campo label="Data de fim"><TextField type="date" value={form.data_fim} onChange={(e) => setForm((f) => ({ ...f, data_fim: e.target.value }))} /></Campo>
          </Linha2>

          <Linha2>
            <Campo label="Nível organizador">
              <SelectField value={form.nivel_organizador} onChange={(e) => setForm((f) => ({ ...f, nivel_organizador: e.target.value as NivelOrganizador }))}>
                <option value="">-- Seleccionar --</option>
                <option value="agrupamento">Agrupamento</option>
                <option value="vigararia">Vigararia</option>
                <option value="diocese">Diocese</option>
                <option value="nacional">Coordenação Nacional</option>
              </SelectField>
            </Campo>
            <Campo label="Prazo de inscrição"><TextField type="date" value={form.prazo_inscricao} onChange={(e) => setForm((f) => ({ ...f, prazo_inscricao: e.target.value }))} /></Campo>
          </Linha2>

          <Linha2>
            <Campo label="Capacidade mínima"><TextField type="number" min="0" value={form.capacidade_minima} onChange={(e) => setForm((f) => ({ ...f, capacidade_minima: e.target.value }))} /></Campo>
            <Campo label="Vagas (máximo)"><TextField type="number" min="0" value={form.vagas} onChange={(e) => setForm((f) => ({ ...f, vagas: e.target.value }))} /></Campo>
          </Linha2>

          <Campo label="Taxa de inscrição (Kz)"><TextField type="number" step="0.01" value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))} /></Campo>

          <CampoCoordenadasBancarias valor={form} onChange={(v) => setForm((f) => ({ ...f, ...v }))} />

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
