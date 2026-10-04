import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Loader2, Search } from 'lucide-react'
import { useCensoRespostas } from '@/hooks/useCenso'
import { Card } from '@/components/ui/Card'
import { ModalCensoResposta } from '@/components/censo/ModalCensoResposta'
import { formatarAgrupamento } from '@/lib/formatadores'
import type { CensoRespostaResumo } from '@/types/censo'

const CORES_ESTADO: Record<string, string> = {
  por_preencher: 'bg-bg text-muted',
  rascunho: 'bg-badge-orange-bg text-badge-orange-text',
  submetido: 'bg-badge-green-bg text-badge-green-text',
}
const LABEL_ESTADO: Record<string, string> = {
  por_preencher: 'Por preencher', rascunho: 'Rascunho', submetido: 'Submetido',
}

export function CensoRespostasPage() {
  const { periodoId } = useParams()
  const { data, isLoading } = useCensoRespostas(Number(periodoId))
  const [pesquisa, setPesquisa] = useState('')
  const [respostaAberta, setRespostaAberta] = useState<CensoRespostaResumo | null>(null)

  const filtrados = data?.filter((r) => r.agrupamento_nome.toLowerCase().includes(pesquisa.toLowerCase()))

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6 sm:px-6 sm:py-7">
      <Link to="/censo" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-text">
        <ChevronLeft className="size-3.5" /> Voltar aos períodos
      </Link>

      <h1 className="mb-5 text-xl font-bold text-text">Respostas por agrupamento</h1>

      <Card className="mb-4 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
          <input
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder="Pesquisar agrupamento..."
            className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]"
          />
        </div>
      </Card>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3.5 py-2.5 font-medium">Agrupamento</th>
              <th className="px-3.5 py-2.5 font-medium">Estado</th>
              <th className="px-3.5 py-2.5 font-medium">Submetido em</th>
              <th className="px-3.5 py-2.5 font-medium">Por</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtrados?.map((r) => (
              <tr key={r.agrupamento_id} onClick={() => setRespostaAberta(r)} className="cursor-pointer transition-colors hover:bg-bg">
                <td className="px-3.5 py-2.5 font-medium text-text">{formatarAgrupamento({ nome: r.agrupamento_nome, ab_agrupamento: r.ab_agrupamento })}</td>
                <td className="px-3.5 py-2.5">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CORES_ESTADO[r.estado]}`}>
                    {LABEL_ESTADO[r.estado]}
                  </span>
                </td>
                <td className="px-3.5 py-2.5 text-muted">{r.submetido_em ? new Date(r.submetido_em).toLocaleDateString('pt-PT') : '—'}</td>
                <td className="px-3.5 py-2.5 text-muted">{r.respondido_por_nome ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {respostaAberta && periodoId && (
        <ModalCensoResposta periodoId={Number(periodoId)} resposta={respostaAberta} onClose={() => setRespostaAberta(null)} />
      )}
    </div>
  )
}
