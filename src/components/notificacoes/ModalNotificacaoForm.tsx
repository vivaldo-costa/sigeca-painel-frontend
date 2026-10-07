import { useState, type FormEvent } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useCriarNotificacao, useAtualizarNotificacao } from '@/hooks/useNotificacoes'
import { getApiErrorMessage } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Campo, Linha2, TextField, SelectField } from '@/components/crud/FormShell'
import type { NotificacaoPainel, NotificacaoFormPayload, DestinoNotificacao, LocalExibicao } from '@/types/notificacao'
import { notificar } from '@/lib/notificar'

interface Props { notificacao: NotificacaoPainel | null; onClose: () => void }

const LOCAIS: { valor: LocalExibicao; label: string }[] = [
  { valor: 'abertura', label: 'Ao abrir a aplicação (popup)' },
  { valor: 'dashboard', label: 'Painel principal / Início' },
  { valor: 'perfil', label: 'Perfil' },
  { valor: 'loja', label: 'Loja' },
  { valor: 'documentos', label: 'Documentos' },
  { valor: 'actividades', label: 'Actividades' },
]

function paraForm(n: NotificacaoPainel | null): NotificacaoFormPayload {
  return {
    titulo: n?.titulo ?? '',
    mensagem: n?.mensagem ?? '',
    destino: n?.destino ?? 'portal',
    local_exibicao: n?.local_exibicao ?? 'abertura',
    global: n ? !!n.global : true,
    utilizador_id: n?.utilizador_id ?? '',
    ativo: n ? !!n.ativo : true,
    data_inicio: n?.data_inicio ? n.data_inicio.slice(0, 16) : '',
    data_fim: n?.data_fim ? n.data_fim.slice(0, 16) : '',
  }
}

export function ModalNotificacaoForm({ notificacao, onClose }: Props) {
  const [form, setForm] = useState<NotificacaoFormPayload>(paraForm(notificacao))

  const criar = useCriarNotificacao()
  const atualizar = useAtualizarNotificacao()
  const aGuardar = criar.isPending || atualizar.isPending

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      if (notificacao) await atualizar.mutateAsync({ id: notificacao.id, payload: form })
      else await criar.mutateAsync(form)
      onClose()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível guardar a notificação.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">{notificacao ? 'Editar Notificação' : 'Nova Notificação'}</h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">

          <Campo label="Título (opcional)"><TextField value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} /></Campo>
          <Campo label="Mensagem">
            <textarea
              required
              rows={3}
              value={form.mensagem}
              onChange={(e) => setForm((f) => ({ ...f, mensagem: e.target.value }))}
              className="w-full resize-none rounded-xl border border-border px-3.5 py-2 text-[13px] outline-none focus:border-[#111827]"
            />
          </Campo>

          <Linha2>
            <Campo label="Onde aparece (destino)">
              <SelectField value={form.destino} onChange={(e) => setForm((f) => ({ ...f, destino: e.target.value as DestinoNotificacao }))}>
                <option value="portal">Só no Portal do Escuteiro</option>
                <option value="painel">Só no Painel de Gestão</option>
                <option value="ambos">Portal e Painel</option>
              </SelectField>
            </Campo>
            <Campo label="Local específico">
              <SelectField value={form.local_exibicao} onChange={(e) => setForm((f) => ({ ...f, local_exibicao: e.target.value as LocalExibicao }))}>
                {LOCAIS.map((l) => <option key={l.valor} value={l.valor}>{l.label}</option>)}
              </SelectField>
            </Campo>
          </Linha2>

          <Campo label="Para quem">
            <SelectField value={form.global ? '1' : '0'} onChange={(e) => setForm((f) => ({ ...f, global: e.target.value === '1' }))}>
              <option value="1">Todos os utilizadores (difusão geral)</option>
              <option value="0">Um utilizador específico (indicar ID)</option>
            </SelectField>
          </Campo>
          {!form.global && (
            <Campo label="ID do utilizador destinatário">
              <TextField
                type="number"
                required
                value={form.utilizador_id}
                onChange={(e) => setForm((f) => ({ ...f, utilizador_id: Number(e.target.value) || '' }))}
                placeholder="Ex.: 1024"
              />
            </Campo>
          )}

          <Linha2>
            <Campo label="Válida a partir de (opcional)"><TextField type="datetime-local" value={form.data_inicio} onChange={(e) => setForm((f) => ({ ...f, data_inicio: e.target.value }))} /></Campo>
            <Campo label="Válida até (opcional)"><TextField type="datetime-local" value={form.data_fim} onChange={(e) => setForm((f) => ({ ...f, data_fim: e.target.value }))} /></Campo>
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
