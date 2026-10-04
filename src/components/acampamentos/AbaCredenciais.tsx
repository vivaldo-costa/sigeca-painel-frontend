import { QrCode, Loader2, Copy } from 'lucide-react'
import { useEventoCredenciais, useGerarCredenciaisEvento } from '@/hooks/useEventoCredenciais'
import { Card } from '@/components/ui/Card'

export function AbaCredenciais({ atividadeId }: { atividadeId: number }) {
  const { data: credenciais, isLoading } = useEventoCredenciais(atividadeId)
  const gerar = useGerarCredenciaisEvento(atividadeId)

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <button
          onClick={() => gerar.mutate()}
          disabled={gerar.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-[13px] font-semibold text-text transition hover:bg-bg disabled:opacity-50"
        >
          {gerar.isPending ? <Loader2 className="size-4 animate-spin" /> : <QrCode className="size-4" />}
          Gerar credenciais para participantes confirmados
        </button>
        {gerar.data?.mensagem && <p className="mt-2 text-center text-[11.5px] text-subtle">{gerar.data.mensagem}</p>}
      </Card>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3.5 py-2.5 font-medium">Participante</th>
              <th className="px-3.5 py-2.5 font-medium">Token (credencial)</th>
              <th className="px-3.5 py-2.5 text-center font-medium">Presenças</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!isLoading && credenciais?.length === 0 && (
              <tr><td colSpan={3} className="py-10 text-center text-subtle">Ainda sem credenciais geradas.</td></tr>
            )}
            {credenciais?.map((c) => (
              <tr key={c.id} className="hover:bg-bg">
                <td className="px-3.5 py-2.5">
                  <p className="font-medium text-text">{c.nome}</p>
                  <p className="font-mono text-[11px] text-subtle">{c.codigo_associado}</p>
                </td>
                <td className="px-3.5 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] text-muted">{c.token.slice(0, 16)}...</span>
                    <button onClick={() => navigator.clipboard.writeText(c.token)} className="text-subtle hover:text-text" title="Copiar token completo">
                      <Copy className="size-3" />
                    </button>
                  </div>
                </td>
                <td className="px-3.5 py-2.5 text-center font-semibold text-text">{c.total_presencas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
