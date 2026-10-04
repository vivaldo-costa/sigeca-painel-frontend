import { useState, type FormEvent } from 'react'
import { ScanLine, Loader2, CircleCheck } from 'lucide-react'
import { useEventoRegistosQr, useRegistarAcaoQr } from '@/hooks/useEventoCredenciais'
import { useEventoZonas } from '@/hooks/useEventoZonas'
import { getApiErrorMessage } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { TIPOS_ACAO_QR, type TipoAcaoQr } from '@/types/eventoCampo'
import { notificar } from '@/lib/notificar'

export function AbaScanQr({ atividadeId }: { atividadeId: number }) {
  const [tipoAcao, setTipoAcao] = useState<TipoAcaoQr>('entrada')
  const [token, setToken] = useState('')
  const [zonaId, setZonaId] = useState<number | ''>('')
  const [detalheItem, setDetalheItem] = useState('')
  const [detalheMotivo, setDetalheMotivo] = useState('')

  const [ultimoRegistado, setUltimoRegistado] = useState<string | null>(null)

  const registar = useRegistarAcaoQr(atividadeId)
  const { data: filtroRegistos } = useEventoRegistosQr(atividadeId, tipoAcao)
  const { data: zonas } = useEventoZonas(atividadeId)

  const precisaZona = tipoAcao === 'atendimento_medico' || tipoAcao === 'refeicao';
  const precisaItem = tipoAcao === 'material';
  const precisaMotivo = tipoAcao === 'saida_antecipada';

  async function handleScan(e: FormEvent) {
    e.preventDefault()
    setUltimoRegistado(null)
    if (!token.trim()) return

    const detalhes: Record<string, string> = {}
    if (precisaItem && detalheItem) detalhes.item = detalheItem
    if (precisaMotivo && detalheMotivo) detalhes.motivo = detalheMotivo

    try {
      const resultado = await registar.mutateAsync({
        token: token.trim(), tipo_acao: tipoAcao,
        zona_id: zonaId || undefined,
        detalhes: Object.keys(detalhes).length ? detalhes : undefined,
      })
      setUltimoRegistado(resultado.dados.credencial.nome)
      setToken('')
      setDetalheItem('')
      setDetalheMotivo('')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível registar a acção.'))
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Registar acção por QR</p>
        <form onSubmit={handleScan} className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {TIPOS_ACAO_QR.map((t) => (
              <button
                key={t.valor}
                type="button"
                onClick={() => setTipoAcao(t.valor)}
                className={`rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition ${tipoAcao === t.valor ? 'bg-[#111827] text-white' : 'bg-bg text-muted hover:bg-border'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Cola ou introduz o token da credencial..."
            className="w-full rounded-lg border border-border px-3 py-2 text-[13px] outline-none focus:border-[#111827]"
            autoFocus
          />

          {precisaZona && (
            <select value={zonaId} onChange={(e) => setZonaId(Number(e.target.value) || '')} className="w-full h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] outline-none focus:border-[#111827]">
              <option value="">-- Zona (opcional) --</option>
              {zonas?.map((z) => <option key={z.id} value={z.id}>{z.nome}</option>)}
            </select>
          )}
          {precisaItem && (
            <input value={detalheItem} onChange={(e) => setDetalheItem(e.target.value)} placeholder="Item entregue" className="w-full rounded-lg border border-border px-3 py-2 text-[13px] outline-none focus:border-[#111827]" />
          )}
          {precisaMotivo && (
            <input value={detalheMotivo} onChange={(e) => setDetalheMotivo(e.target.value)} placeholder="Motivo da saída antecipada" className="w-full rounded-lg border border-border px-3 py-2 text-[13px] outline-none focus:border-[#111827]" />
          )}

          {ultimoRegistado && (
            <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-emerald-600">
              <CircleCheck className="size-3.5" /> Registado: {ultimoRegistado}
            </p>
          )}

          <button type="submit" disabled={registar.isPending || !token.trim()} className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#111827] py-2.5 text-[13px] font-semibold text-white disabled:opacity-50">
            {registar.isPending ? <Loader2 className="size-4 animate-spin" /> : <ScanLine className="size-4" />}
            Registar
          </button>
        </form>
      </Card>

      <Card className="overflow-x-auto">
        <div className="border-b border-border px-4 py-2.5 text-[12px] font-semibold text-muted">
          Últimos registos — {TIPOS_ACAO_QR.find((t) => t.valor === tipoAcao)?.label}
        </div>
        <table className="w-full text-left text-[12.5px]">
          <tbody className="divide-y divide-border">
            {filtroRegistos?.length === 0 && <tr><td className="py-8 text-center text-subtle">Nenhum registo deste tipo ainda.</td></tr>}
            {filtroRegistos?.map((r) => (
              <tr key={r.id}>
                <td className="px-3.5 py-2.5">
                  <p className="font-medium text-text">{r.nome} <span className="font-mono text-[11px] text-subtle">{r.codigo_associado}</span></p>
                  {r.zona_nome && <p className="text-[11px] text-subtle">{r.zona_nome}</p>}
                  {r.detalhes && <p className="text-[11px] text-subtle">{Object.values(r.detalhes).join(' · ')}</p>}
                </td>
                <td className="px-3.5 py-2.5 text-right text-[11px] text-subtle">{new Date(r.created_at).toLocaleString('pt-PT')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
