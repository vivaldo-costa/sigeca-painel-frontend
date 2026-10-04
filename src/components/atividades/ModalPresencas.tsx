import { useState, type FormEvent } from 'react'
import { X, Loader2, QrCode, ScanLine, CircleCheck } from 'lucide-react'
import { useCredenciaisAtividade, usePresencasAtividade, useGerarCredenciais, useRegistarScan } from '@/hooks/usePresencas'
import { getApiErrorMessage } from '@/lib/api'
import { notificar } from '@/lib/notificar'

interface Props { atividadeId: number; titulo: string; onClose: () => void }

export function ModalPresencas({ atividadeId, titulo, onClose }: Props) {
  const { data: credenciais, isLoading: aCarregarCredenciais } = useCredenciaisAtividade(atividadeId)
  const { data: presencas, isLoading: aCarregarPresencas } = usePresencasAtividade(atividadeId)
  const gerar = useGerarCredenciais(atividadeId)
  const scan = useRegistarScan(atividadeId)

  const [token, setToken] = useState('')
  const [ultimoRegistado, setUltimoRegistado] = useState<string | null>(null)

  async function handleScan(e: FormEvent) {
    e.preventDefault()
    setUltimoRegistado(null)
    if (!token.trim()) return
    try {
      const resultado = await scan.mutateAsync(token.trim())
      setUltimoRegistado(resultado.dados.nome)
      setToken('')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível registar a presença.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-text">Presenças</h2>
            <p className="text-[12px] text-subtle">{titulo}</p>
          </div>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <button
            onClick={() => gerar.mutate()}
            disabled={gerar.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-[13px] font-semibold text-text transition hover:bg-bg disabled:opacity-50"
          >
            {gerar.isPending ? <Loader2 className="size-4 animate-spin" /> : <QrCode className="size-4" />}
            Gerar credenciais para inscritos confirmados
          </button>
          {gerar.data?.mensagem && <p className="-mt-3 text-center text-[11.5px] text-subtle">{gerar.data.mensagem}</p>}

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">Registar presença</p>
            <form onSubmit={handleScan} className="flex gap-2">
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Cola ou introduz o código da credencial..."
                className="flex-1 rounded-lg border border-border px-3 py-2 text-[13px] outline-none focus:border-[#111827]"
              />
              <button type="submit" disabled={scan.isPending || !token.trim()} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white disabled:opacity-50">
                {scan.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <ScanLine className="size-3.5" />}
                Registar
              </button>
            </form>
            {ultimoRegistado && (
              <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-medium text-emerald-600">
                <CircleCheck className="size-3.5" /> Presença registada: {ultimoRegistado}
              </p>
            )}
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">
              Credenciais {credenciais && `(${credenciais.length})`}
            </p>
            {aCarregarCredenciais && <Loader2 className="size-4 animate-spin text-subtle" />}
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {credenciais?.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-[12.5px]">
                  <span>{c.nome} <span className="font-mono text-[11px] text-subtle">{c.codigo_associado}</span></span>
                  <span className={`text-[11px] font-semibold ${c.total_presencas > 0 ? 'text-emerald-600' : 'text-subtle'}`}>
                    {c.total_presencas > 0 ? 'Presente' : 'Sem presença'}
                  </span>
                </div>
              ))}
              {credenciais?.length === 0 && <p className="text-[12px] text-subtle">Ainda sem credenciais geradas.</p>}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">
              Presenças registadas {presencas && `(${presencas.length})`}
            </p>
            {aCarregarPresencas && <Loader2 className="size-4 animate-spin text-subtle" />}
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {presencas?.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-[12px]">
                  <span>{p.nome}</span>
                  <span className="text-subtle">{new Date(p.created_at).toLocaleString('pt-PT')}</span>
                </div>
              ))}
              {presencas?.length === 0 && <p className="text-[12px] text-subtle">Ainda sem presenças registadas.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
