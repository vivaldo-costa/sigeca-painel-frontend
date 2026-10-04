import { useState, type FormEvent } from 'react'
import { ArrowRightLeft, Loader2, FileText } from 'lucide-react'
import { useSolicitarTransferencia, useTransferencias, useDecidirTransferencia, useCancelarTransferencia } from '@/hooks/useTransferencias'
import { formatarAgrupamento } from '@/lib/formatadores'
import { useOpcoesFiltro } from '@/hooks/useDashboardPainel'
import { useAuthStore } from '@/store/auth'
import { getApiErrorMessage } from '@/lib/api'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Campo, TextField, SelectField } from '@/components/crud/FormShell'
import { BadgeEstadoTransferencia } from '@/components/crud/BadgesEstado'
import type { UtilizadorListagem } from '@/types/utilizador'
import { notificar } from '@/lib/notificar'

export function AbaTransferir({ utilizador }: { utilizador: UtilizadorListagem }) {
  const user = useAuthStore((s) => s.user)
  const solicitar = useSolicitarTransferencia()
  const decidir = useDecidirTransferencia()
  const cancelar = useCancelarTransferencia()
  const { data } = useTransferencias({ escuteiroId: utilizador.id, porPagina: 20 })

  const [dioceseId, setDioceseId] = useState<number | undefined>()
  const [vigarariaId, setVigarariaId] = useState<number | undefined>()
  const [paroquiaId, setParoquiaId] = useState<number | undefined>()
  const [agrupamentoDestino, setAgrupamentoDestino] = useState<number | undefined>()
  const [motivo, setMotivo] = useState('')
  const [documento, setDocumento] = useState<File | null>(null)

  const dioceses = useOpcoesFiltro('dioceses')
  const vigararias = useOpcoesFiltro('vigararias', dioceseId)
  const paroquias = useOpcoesFiltro('paroquias', vigarariaId)
  const agrupamentos = useOpcoesFiltro('agrupamentos', paroquiaId)

  const temPendente = data?.dados.some((t) => t.estado === 'PENDENTE')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!agrupamentoDestino) return notificar.erro('Selecciona o agrupamento de destino.')
    try {
      await solicitar.mutateAsync({
        escuteiro_id: utilizador.id,
        agrupamento_destino_id: agrupamentoDestino,
        motivo,
        documento,
      })
      notificar.sucesso('Pedido de transferência criado, a aguardar decisão.')
      setMotivo('')
      setDocumento(null)
      setAgrupamentoDestino(undefined)
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível solicitar a transferência.'))
    }
  }

  return (
    <div className="space-y-6">
      {!temPendente && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-[var(--radius-pn)] border border-border bg-surface p-6 shadow-[var(--shadow-pn)]">
          <h3 className="flex items-center gap-2 text-sm font-bold text-text">
            <ArrowRightLeft className="size-4 text-muted" /> Solicitar Transferência
          </h3>
          <p className="text-[12.5px] text-muted">
            Agrupamento actual: <strong className="text-text">{utilizador.agrupamento_nome ?? '—'}</strong>
          </p>


          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo label="Diocese de destino">
              <SelectField value={dioceseId ?? ''} onChange={(e) => { setDioceseId(Number(e.target.value) || undefined); setVigarariaId(undefined); setParoquiaId(undefined); setAgrupamentoDestino(undefined) }}>
                <option value="">-- Seleccionar --</option>
                {dioceses.data?.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
              </SelectField>
            </Campo>
            <Campo label="Vigararia">
              <SelectField disabled={!dioceseId} value={vigarariaId ?? ''} onChange={(e) => { setVigarariaId(Number(e.target.value) || undefined); setParoquiaId(undefined); setAgrupamentoDestino(undefined) }}>
                <option value="">-- Seleccionar --</option>
                {vigararias.data?.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
              </SelectField>
            </Campo>
            <Campo label="Paróquia">
              <SelectField disabled={!vigarariaId} value={paroquiaId ?? ''} onChange={(e) => { setParoquiaId(Number(e.target.value) || undefined); setAgrupamentoDestino(undefined) }}>
                <option value="">-- Seleccionar --</option>
                {paroquias.data?.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </SelectField>
            </Campo>
            <Campo label="Agrupamento de destino">
              <SelectField required disabled={!paroquiaId} value={agrupamentoDestino ?? ''} onChange={(e) => setAgrupamentoDestino(Number(e.target.value) || undefined)}>
                <option value="">-- Seleccionar --</option>
                {agrupamentos.data?.map((a) => <option key={a.id} value={a.id}>{formatarAgrupamento(a)}</option>)}
              </SelectField>
            </Campo>
          </div>

          <Campo label="Motivo">
            <TextField required value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex: Mudança de residência" />
          </Campo>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-muted">Documento de suporte (opcional)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setDocumento(e.target.files?.[0] ?? null)}
              className="block w-full text-[13px] text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-bg file:px-3 file:py-2 file:text-[12.5px] file:font-medium file:text-text"
            />
          </div>

          <Button type="submit" loading={solicitar.isPending}>
            {solicitar.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Solicitar Transferência
          </Button>
        </form>
      )}

      {temPendente && (
        <Alert variant="warning" dismissible={false}>
          Já existe um pedido de transferência pendente para este escuteiro — decide-o abaixo antes de criar um novo.
        </Alert>
      )}

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-subtle">Histórico de pedidos</h3>
        {!data || data.dados.length === 0 ? (
          <p className="text-[13px] text-subtle">Ainda não houve pedidos de transferência para este escuteiro.</p>
        ) : (
          <div className="space-y-3">
            {data.dados.map((t) => (
              <div key={t.id} className="rounded-[var(--radius-pn)] border border-border bg-surface p-4">
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <p className="text-[13px] font-medium text-text">
                    {t.agrupamento_origem_nome ? formatarAgrupamento({ nome: t.agrupamento_origem_nome, ab_agrupamento: t.agrupamento_origem_ab_agrupamento }) : '—'} → {formatarAgrupamento({ nome: t.agrupamento_destino_nome, ab_agrupamento: t.agrupamento_destino_ab_agrupamento })}
                  </p>
                  <BadgeEstadoTransferencia estado={t.estado} />
                </div>
                {t.motivo && <p className="text-[12.5px] text-muted">{t.motivo}</p>}
                {t.documento_nome && (
                  <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-subtle">
                    <FileText className="size-3" /> {t.documento_nome}
                  </p>
                )}
                <p className="mt-1.5 text-[11px] text-subtle">
                  Solicitado por {t.solicitado_por_nome} em {new Date(t.data_solicitacao).toLocaleDateString('pt-PT')}
                  {t.aprovado_por_nome && <> · Decidido por {t.aprovado_por_nome}</>}
                </p>

                {t.estado === 'PENDENTE' && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => decidir.mutate({ id: t.id, estado: 'APROVADA' })}
                      disabled={decidir.isPending}
                      className="rounded-lg bg-badge-green-bg px-3 py-1.5 text-[12px] font-semibold text-badge-green-text transition hover:opacity-80 disabled:opacity-50"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => decidir.mutate({ id: t.id, estado: 'REJEITADA' })}
                      disabled={decidir.isPending}
                      className="rounded-lg bg-badge-red-bg px-3 py-1.5 text-[12px] font-semibold text-badge-red-text transition hover:opacity-80 disabled:opacity-50"
                    >
                      Rejeitar
                    </button>
                    {(user?.perfil_nome === 'ADMIN' || t.solicitado_por === user?.id) && (
                      <button
                        onClick={() => cancelar.mutate(t.id)}
                        disabled={cancelar.isPending}
                        className="rounded-lg bg-bg px-3 py-1.5 text-[12px] font-semibold text-muted transition hover:bg-border disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
