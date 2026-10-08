import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useEventoInscricao, useMudarEstadoInscricao, useDadosParticipante, useGuardarDadosParticipante } from '@/hooks/useEventoInscricoes'
import { getApiErrorMessage } from '@/lib/api'
import { notificar } from '@/lib/notificar'
import { ESTADOS_INSCRICAO_EVENTO, LABEL_ESTADO_INSCRICAO, type EstadoInscricaoEvento, type DadosParticipante } from '@/types/eventoInscricao'
import { InscricaoStepper } from '@/components/acampamentos/InscricaoStepper'
import { useEventoPagamentos, useRegistarPagamento, useConfirmarPagamento, useRejeitarPagamento } from '@/hooks/useEventoPagamentos'
import { LABEL_METODO_PAGAMENTO, type MetodoPagamentoEvento, type EstadoPagamentoEvento } from '@/types/eventoFinancas'
import { LinkFicheiroProtegido } from '@/components/ui/LinkFicheiroProtegido'

const ESTADO_PAGAMENTO: Record<EstadoPagamentoEvento, { rotulo: string; cor: string }> = {
  pendente: { rotulo: 'Pendente', cor: 'bg-amber-50 text-amber-700' },
  confirmado: { rotulo: 'Confirmado', cor: 'bg-badge-green-bg text-badge-green-text' },
  estornado: { rotulo: 'Estornado', cor: 'bg-bg text-muted' },
  rejeitado: { rotulo: 'Rejeitado', cor: 'bg-red-50 text-red-600' },
}

interface Props { id: number; delegacaoId: number; onClose: () => void }

const CAMPOS_MEDICOS: { chave: keyof DadosParticipante; label: string }[] = [
  { chave: 'contacto_emergencia_nome', label: 'Contacto de emergência (nome)' },
  { chave: 'contacto_emergencia_telefone', label: 'Contacto de emergência (telefone)' },
  { chave: 'restricoes_alimentares', label: 'Restrições alimentares' },
  { chave: 'alergias', label: 'Alergias' },
  { chave: 'doencas_cronicas', label: 'Doenças crónicas' },
  { chave: 'medicacao', label: 'Medicação' },
  { chave: 'necessidades_especiais', label: 'Necessidades especiais' },
  { chave: 'transporte', label: 'Transporte' },
]

export function ModalInscricaoDetalhe({ id, delegacaoId, onClose }: Props) {
  const { data, isLoading } = useEventoInscricao(id)
  const mudarEstado = useMudarEstadoInscricao(delegacaoId)
  const { data: dadosMedicos, isError: semAcessoMedicos } = useDadosParticipante(id)
  const guardarDados = useGuardarDadosParticipante(id)

  const [nota, setNota] = useState('')
  const [formMedico, setFormMedico] = useState<DadosParticipante | null>(null)

  async function handleMudarEstado(estado: EstadoInscricaoEvento) {
    try {
      await mudarEstado.mutateAsync({ id, estado, motivo: nota || undefined })
      setNota('')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível actualizar o estado.'))
    }
  }

  async function handleGuardarMedicos() {
    if (!formMedico) return
    await guardarDados.mutateAsync(formMedico)
  }

  const dadosParaEditar = formMedico ?? dadosMedicos ?? null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">Inscrição #{id}</h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>

        {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

        {data && (
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div>
              <p className="font-semibold text-text">{data.nome}</p>
              <p className="font-mono text-[11px] text-subtle">{data.codigo_associado} {data.funcao && `· ${data.funcao}`}</p>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">Fluxo da Inscrição</p>
              <InscricaoStepper estado={data.estado} />
            </div>

            <SeccaoPagamentos atividadeId={data.atividade_id} inscricaoId={id} />

            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-subtle">Alterar para</p>
              <textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Nota (opcional)..."
                rows={2}
                className="mb-2 w-full resize-none rounded-lg border border-border px-3 py-2 text-[12.5px] outline-none focus:border-[#111827]"
              />
              <div className="flex flex-wrap gap-2">
                {ESTADOS_INSCRICAO_EVENTO.filter((e) => e !== data.estado).map((e) => (
                  <button
                    key={e}
                    onClick={() => handleMudarEstado(e)}
                    disabled={mudarEstado.isPending}
                    className="rounded-full border border-border px-3 py-1.5 text-[11.5px] font-medium text-text transition hover:bg-bg disabled:opacity-50"
                  >
                    {LABEL_ESTADO_INSCRICAO[e]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">Histórico</p>
              <div className="space-y-1.5">
                {data.historico.map((h) => (
                  <div key={h.id} className="rounded-lg bg-bg px-3 py-2 text-[12px]">
                    <p className="text-text">{h.estado_anterior ? `${LABEL_ESTADO_INSCRICAO[h.estado_anterior]} → ` : ''}{LABEL_ESTADO_INSCRICAO[h.estado_novo]}</p>
                    {h.nota && <p className="text-muted">{h.nota}</p>}
                    <p className="text-[10.5px] text-subtle">{h.utilizador_nome ?? '—'} · {new Date(h.created_at).toLocaleString('pt-PT')}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">Dados médicos / emergência</p>
              {semAcessoMedicos && (
                <p className="rounded-lg bg-bg px-3 py-2 text-[12px] text-subtle">
                  Não tens um papel autorizado (equipa de saúde, secretaria, direcção) para ver estes dados neste evento.
                </p>
              )}
              {!semAcessoMedicos && (
                <div className="space-y-2">
                  {CAMPOS_MEDICOS.map((c) => (
                    <div key={c.chave}>
                      <label className="mb-0.5 block text-[11px] text-subtle">{c.label}</label>
                      <input
                        value={dadosParaEditar?.[c.chave] ?? ''}
                        onChange={(e) => setFormMedico({ ...(dadosParaEditar ?? {} as DadosParticipante), [c.chave]: e.target.value })}
                        className="w-full rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]"
                      />
                    </div>
                  ))}
                  <button
                    onClick={handleGuardarMedicos}
                    disabled={guardarDados.isPending || !formMedico}
                    className="mt-2 w-full rounded-lg bg-[#111827] py-2 text-[12.5px] font-semibold text-white disabled:opacity-50"
                  >
                    {guardarDados.isPending ? <Loader2 className="mx-auto size-4 animate-spin" /> : 'Guardar dados médicos'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/** Secção 6 — "Inscrição → Pagamento → Pagamento confirmado → Receita → Finanças". Registar aqui gera a receita automaticamente ao confirmar, nunca duas para o mesmo pagamento. */
function SeccaoPagamentos({ atividadeId, inscricaoId }: { atividadeId: number; inscricaoId: number }) {
  const { data: pagamentos, isLoading } = useEventoPagamentos(atividadeId, inscricaoId)
  const registar = useRegistarPagamento(atividadeId, inscricaoId)
  const confirmar = useConfirmarPagamento(atividadeId, inscricaoId)
  const rejeitar = useRejeitarPagamento(inscricaoId)
  const [aRejeitar, setARejeitar] = useState<number | null>(null)
  const [motivo, setMotivo] = useState('')

  const [valor, setValor] = useState('')
  const [metodo, setMetodo] = useState<MetodoPagamentoEvento>('transferencia')
  const [dataPagamento, setDataPagamento] = useState('')

  async function handleRegistar() {
    if (!valor) { notificar.erro('Indica o valor do pagamento.'); return }
    try {
      await registar.mutateAsync({ valor, metodo, data_pagamento: dataPagamento || undefined })
      setValor('')
      setDataPagamento('')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível registar o pagamento.'))
    }
  }

  async function handleConfirmar(pagamentoId: number) {
    try {
      await confirmar.mutateAsync(pagamentoId)
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível confirmar o pagamento.'))
    }
  }

  async function confirmarRejeicao() {
    if (aRejeitar === null) return
    if (motivo.trim().length < 3) { notificar.erro('Indica o motivo da rejeição.'); return }
    try {
      await rejeitar.mutateAsync({ pagamentoId: aRejeitar, motivo: motivo.trim() })
      notificar.sucesso('Pagamento rejeitado.')
      setARejeitar(null)
      setMotivo('')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível rejeitar o pagamento.'))
    }
  }

  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">Pagamentos</p>

      {isLoading && <p className="text-[12px] text-subtle">A carregar...</p>}
      <div className="mb-3 space-y-1.5">
        {pagamentos?.map((p) => (
          <div key={p.id} className="rounded-lg bg-bg px-3 py-2 text-[12px]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className={`font-medium text-text ${p.estado === 'rejeitado' ? 'line-through decoration-subtle' : ''}`}>{Number(p.valor).toLocaleString('pt-PT')} Kz · {LABEL_METODO_PAGAMENTO[p.metodo]}</p>
                <p className="text-[10.5px] text-subtle">
                  {p.data_pagamento ? new Date(p.data_pagamento).toLocaleDateString('pt-PT') : '—'}
                  {p.estado === 'confirmado' && p.confirmado_por_nome && ` · confirmado por ${p.confirmado_por_nome}`}
                  {p.estado === 'rejeitado' && p.rejeitado_por_nome && ` · rejeitado por ${p.rejeitado_por_nome}`}
                  {p.estado === 'rejeitado' && p.rejeitado_em && ` a ${new Date(p.rejeitado_em).toLocaleDateString('pt-PT')}`}
                  {p.comprovativo_path && (
                    <> · <LinkFicheiroProtegido pasta="eventos-pagamentos" nome={p.comprovativo_path} className="font-medium text-text underline">ver comprovativo</LinkFicheiroProtegido></>
                  )}
                </p>
              </div>
              {p.estado === 'pendente' ? (
                <div className="flex shrink-0 gap-1.5">
                  <button onClick={() => handleConfirmar(p.id)} disabled={confirmar.isPending || rejeitar.isPending} className="rounded-full bg-badge-green-bg px-3 py-1 text-[11px] font-semibold text-badge-green-text disabled:opacity-50">
                    Confirmar
                  </button>
                  <button onClick={() => { setARejeitar(p.id); setMotivo('') }} disabled={confirmar.isPending || rejeitar.isPending} className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-600 disabled:opacity-50">
                    Rejeitar
                  </button>
                </div>
              ) : (
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${ESTADO_PAGAMENTO[p.estado]?.cor ?? 'bg-bg text-muted'}`}>
                  {ESTADO_PAGAMENTO[p.estado]?.rotulo ?? p.estado}
                </span>
              )}
            </div>

            {p.estado === 'rejeitado' && p.motivo_rejeicao && (
              <p className="mt-1 text-[11px] text-subtle">Motivo: <span className="text-text">{p.motivo_rejeicao}</span></p>
            )}

            {aRejeitar === p.id && (
              <div className="mt-2 space-y-2 rounded-lg border border-border bg-white p-2.5">
                <textarea
                  autoFocus rows={2} maxLength={255} value={motivo} onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Motivo da rejeição (ex.: comprovativo ilegível, valor não corresponde)"
                  className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-[12.5px] outline-none focus:border-[#111827]"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setARejeitar(null)} className="rounded-md border border-border bg-white px-3 py-1 text-[11.5px] font-medium">Cancelar</button>
                  <button onClick={confirmarRejeicao} disabled={rejeitar.isPending} className="rounded-md bg-red-600 px-3 py-1 text-[11.5px] font-semibold text-white disabled:opacity-50">Rejeitar pagamento</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {!isLoading && pagamentos?.length === 0 && <p className="text-[12px] text-subtle">Ainda sem pagamentos registados.</p>}
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-border p-2.5">
        <div>
          <label className="mb-1 block text-[10.5px] text-subtle">Valor (Kz)</label>
          <input value={valor} onChange={(e) => setValor(e.target.value)} type="number" className="h-8 w-24 rounded-md border border-border px-2 text-[12px] outline-none focus:border-[#111827]" />
        </div>
        <div>
          <label className="mb-1 block text-[10.5px] text-subtle">Método</label>
          <select value={metodo} onChange={(e) => setMetodo(e.target.value as MetodoPagamentoEvento)} className="h-8 rounded-md border border-border bg-white px-2 text-[12px] outline-none focus:border-[#111827]">
            {Object.entries(LABEL_METODO_PAGAMENTO).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[10.5px] text-subtle">Data</label>
          <input type="date" value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)} className="h-8 rounded-md border border-border px-2 text-[12px] outline-none focus:border-[#111827]" />
        </div>
        <button onClick={handleRegistar} disabled={registar.isPending} className="h-8 rounded-md bg-[#111827] px-3 text-[11.5px] font-semibold text-white disabled:opacity-50">
          Registar
        </button>
      </div>
    </div>
  )
}
