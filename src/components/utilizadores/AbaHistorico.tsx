import { useState, type FormEvent } from 'react'
import { ArrowRight, Calendar, Loader2, Plus, Trash2, X } from 'lucide-react'
import { useHistoricoUtilizador, useRegistarPercurso, useRemoverPercurso } from '@/hooks/useUtilizadores'
import { useOpcoesFiltro } from '@/hooks/useDashboardPainel'
import { usePermissao } from '@/hooks/usePermissao'
import { useConfirmar } from '@/components/ui/ConfirmProvider'
import { Campo, Linha2, TextField, SelectField, TextareaField } from '@/components/crud/FormShell'
import { Button } from '@/components/ui/Button'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { getApiErrorMessage } from '@/lib/api'
import { notificar } from '@/lib/notificar'
import type { TimelineEvento } from '@/types/timeline'

interface Props {
  utilizadorId: number
  seccaoActualId?: number | null
  cargoActual?: string | null
}

const VAZIO = {
  tipo: 'seccao' as 'seccao' | 'cargo' | 'ambos',
  seccao_nova_id: '' as number | '',
  cargo_novo: '',
  motivo: '',
  data_alteracao: new Date().toISOString().slice(0, 10),
  apenas_historico: false,
  seccao_anterior_id: '' as number | '',
  cargo_anterior: '',
}

const ORIGEM: Record<string, string> = { manual: 'Registo manual', automatica: 'Automática', transferencia: 'Transferência', sistema: 'Ficha do escuteiro' }

/**
 * Percurso do escuteiro: mudanças de Secção/Categoria, Funções/Cargos e
 * transferências — a mesma fonte de dados que o Portal mostra no perfil.
 * Quem tem permissão de edição em "Escuteiros" pode registar mudanças;
 * quem tem permissão de apagar pode remover registos errados.
 */
export function AbaHistorico({ utilizadorId, seccaoActualId, cargoActual }: Props) {
  const { data: eventos, isLoading, isError } = useHistoricoUtilizador(utilizadorId)
  const permissao = usePermissao('Escuteiros')
  const seccoes = useOpcoesFiltro('seccoes')
  const registar = useRegistarPercurso(utilizadorId)
  const remover = useRemoverPercurso(utilizadorId)
  const confirmar = useConfirmar()
  const [aberto, setAberto] = useState(false)
  const [form, setForm] = useState(VAZIO)

  const nomeSeccao = (id?: number | null) => seccoes.data?.find((s) => s.id === id)?.nome ?? '—'
  const querSeccao = form.tipo !== 'cargo'
  const querCargo = form.tipo !== 'seccao'

  async function submeter(e: FormEvent) {
    e.preventDefault()
    if (querSeccao && !form.seccao_nova_id) { notificar.aviso('Escolhe a nova secção/categoria.'); return }
    if (querCargo && !form.cargo_novo.trim()) { notificar.aviso('Indica a nova função/cargo.'); return }
    if (!form.motivo.trim()) { notificar.aviso('Indica o motivo.'); return }

    const ok = await confirmar({
      titulo: 'Registar mudança',
      mensagem: form.apenas_historico
        ? 'Este registo fica apenas no percurso — a secção e o cargo actuais não mudam. Confirmas?'
        : 'A secção/cargo actuais do escuteiro vão ser actualizados e a mudança fica no histórico. Confirmas?',
      textoConfirmar: 'Sim, registar',
    })
    if (!ok) return

    try {
      await registar.mutateAsync({
        seccao_nova_id: querSeccao ? Number(form.seccao_nova_id) : null,
        cargo_novo: querCargo ? form.cargo_novo.trim() : '',
        motivo: form.motivo.trim(),
        data_alteracao: form.data_alteracao,
        apenas_historico: form.apenas_historico,
        ...(form.apenas_historico
          ? { seccao_anterior_id: form.seccao_anterior_id ? Number(form.seccao_anterior_id) : null, cargo_anterior: form.cargo_anterior }
          : {}),
      })
      notificar.sucesso('Mudança registada no percurso.')
      setForm(VAZIO)
      setAberto(false)
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível registar a mudança.'))
    }
  }

  async function apagar(ev: TimelineEvento) {
    if (!ev.registo_id) return
    const ok = await confirmar({ titulo: 'Remover registo', mensagem: 'Remover este registo do percurso? A secção/cargo actuais não mudam.', perigoso: true })
    if (!ok) return
    try {
      await remover.mutateAsync(ev.registo_id)
      notificar.sucesso('Registo removido.')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível remover o registo.'))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-pn)] border border-border bg-surface px-4 py-3">
        <div className="text-[12.5px] text-muted">
          <span className="font-semibold text-text">Actual:</span> {nomeSeccao(seccaoActualId)} · {cargoActual || 'Sem cargo'}
        </div>
        <div className="flex items-center gap-2">
          <ExportarBotoes
            tamanho="sm"
            nomeFicheiro={`percurso-escuteiro-${utilizadorId}`}
            titulo="Percurso do Escuteiro"
            colunas={[
              { titulo: 'Data', valor: (e: TimelineEvento) => new Date(e.data_evento).toLocaleDateString('pt-PT') },
              { titulo: 'Tipo', valor: (e: TimelineEvento) => (e.tipo === 'transferencia' ? 'Transferência' : 'Secção/Cargo') },
              { titulo: 'De', valor: (e: TimelineEvento) => e.de_nome ?? '—' },
              { titulo: 'Para', valor: (e: TimelineEvento) => e.para_nome ?? '—' },
              { titulo: 'Cargo anterior', valor: (e: TimelineEvento) => e.cargo_anterior ?? '—' },
              { titulo: 'Cargo novo', valor: (e: TimelineEvento) => e.cargo_novo ?? '—' },
              { titulo: 'Motivo', valor: (e: TimelineEvento) => e.motivo ?? '—' },
              { titulo: 'Registado por', valor: (e: TimelineEvento) => e.responsavel_nome ?? '—' },
            ]}
            linhas={eventos ?? []}
          />
          {permissao.editar && !aberto && (
            <Button type="button" onClick={() => setAberto(true)}><Plus className="size-3.5" /> Registar mudança</Button>
          )}
        </div>
      </div>

      {aberto && (
        <form onSubmit={submeter} className="space-y-4 rounded-[var(--radius-pn)] border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-text">Mudança de Secção/Categoria ou Função/Cargo</h3>
            <button type="button" onClick={() => { setAberto(false); setForm(VAZIO) }} className="text-subtle hover:text-text"><X className="size-4" /></button>
          </div>

          <Campo label="O que muda?">
            <SelectField value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as typeof f.tipo }))}>
              <option value="seccao">Secção / Categoria</option>
              <option value="cargo">Função / Cargo</option>
              <option value="ambos">Secção e Cargo</option>
            </SelectField>
          </Campo>

          <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-text">
            <input type="checkbox" className="size-3.5" checked={form.apenas_historico} onChange={(e) => setForm((f) => ({ ...f, apenas_historico: e.target.checked }))} />
            Registo histórico (mudança antiga — não altera a secção/cargo actuais)
          </label>

          {querSeccao && (
            <Linha2>
              {form.apenas_historico ? (
                <Campo label="Secção anterior">
                  <SelectField value={form.seccao_anterior_id} onChange={(e) => setForm((f) => ({ ...f, seccao_anterior_id: Number(e.target.value) || '' }))}>
                    <option value="">-- Seleccionar --</option>
                    {seccoes.data?.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </SelectField>
                </Campo>
              ) : (
                <Campo label="Secção actual"><TextField disabled value={nomeSeccao(seccaoActualId)} /></Campo>
              )}
              <Campo label="Nova secção / categoria">
                <SelectField required value={form.seccao_nova_id} onChange={(e) => setForm((f) => ({ ...f, seccao_nova_id: Number(e.target.value) || '' }))}>
                  <option value="">-- Seleccionar --</option>
                  {seccoes.data?.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </SelectField>
              </Campo>
            </Linha2>
          )}

          {querCargo && (
            <Linha2>
              {form.apenas_historico ? (
                <Campo label="Cargo anterior"><TextField value={form.cargo_anterior} onChange={(e) => setForm((f) => ({ ...f, cargo_anterior: e.target.value }))} /></Campo>
              ) : (
                <Campo label="Cargo actual"><TextField disabled value={cargoActual || 'Sem cargo'} /></Campo>
              )}
              <Campo label="Nova função / cargo">
                <TextField required value={form.cargo_novo} onChange={(e) => setForm((f) => ({ ...f, cargo_novo: e.target.value }))} placeholder="Ex.: Guia de Patrulha" />
              </Campo>
            </Linha2>
          )}

          <Linha2>
            <Campo label="Data da mudança">
              <TextField type="date" required value={form.data_alteracao} onChange={(e) => setForm((f) => ({ ...f, data_alteracao: e.target.value }))} />
            </Campo>
            <div />
          </Linha2>
          <Campo label="Motivo">
            <TextareaField required value={form.motivo} onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))} placeholder="Ex.: Passagem de secção por idade, nomeação, rotação de cargo…" />
          </Campo>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="secondary" onClick={() => { setAberto(false); setForm(VAZIO) }}>Cancelar</Button>
            <Button type="submit" loading={registar.isPending}>Registar mudança</Button>
          </div>
        </form>
      )}

      {isLoading && <div className="flex justify-center py-12"><Loader2 className="size-5 animate-spin text-subtle" /></div>}
      {isError && <p className="py-12 text-center text-sm text-subtle">Não foi possível carregar o histórico.</p>}
      {eventos && eventos.length === 0 && <p className="py-12 text-center text-sm text-subtle">Sem registos no histórico deste escuteiro.</p>}

      {eventos?.map((ev, i) => (
        <div key={i} className="rounded-[var(--radius-pn)] border border-border bg-surface p-4">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-subtle">
              {ev.tipo === 'transferencia' ? 'Transferência' : 'Mudança de Secção/Cargo'}
            </span>
            <div className="flex items-center gap-2">
              {ev.estado_ou_origem && (
                <span className="rounded-full bg-bg px-2.5 py-0.5 text-[11px] font-semibold text-muted">{ORIGEM[ev.estado_ou_origem] ?? ev.estado_ou_origem}</span>
              )}
              {permissao.apagar && ev.registo_id && (
                <button type="button" onClick={() => apagar(ev)} title="Remover registo" className="text-subtle hover:text-badge-red-text"><Trash2 className="size-3.5" /></button>
              )}
            </div>
          </div>
          {(ev.de_nome || ev.para_nome) && ev.de_nome !== ev.para_nome && (
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-text">
              {ev.de_nome ?? '—'} <ArrowRight className="size-3 text-subtle" /> {ev.para_nome ?? '—'}
            </p>
          )}
          {ev.cargo_novo && ev.cargo_novo !== ev.cargo_anterior && (
            <p className="mt-1 text-[12.5px] text-muted">Cargo: {ev.cargo_anterior ?? '—'} → {ev.cargo_novo}</p>
          )}
          {ev.motivo && <p className="mt-1 text-[12.5px] text-muted">{ev.motivo}</p>}
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-subtle">
            <Calendar className="size-3" /> {new Date(ev.data_evento).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
            {ev.responsavel_nome && <> · Registado por {ev.responsavel_nome}</>}
          </p>
        </div>
      ))}
    </div>
  )
}
