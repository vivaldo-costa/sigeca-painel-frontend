import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { useHistoricoEmails } from '@/hooks/useHistoricoEmails'
import { Card } from '@/components/ui/Card'
import { PaginacaoServidor } from '@/components/crud/PaginacaoServidor'
import { LABEL_ESTADO_EMAIL, COR_ESTADO_EMAIL, type EstadoEmail, type FiltrosHistoricoEmail } from '@/types/historicoEmail'

export function HistoricoEmailsPage() {
  const [filtros, setFiltros] = useState<FiltrosHistoricoEmail>({ pagina: 1, porPagina: 25 })
  const [pesquisaRascunho, setPesquisaRascunho] = useState('')
  const { data, isLoading, isFetching } = useHistoricoEmails(filtros)

  function aplicar(alteracoes: Partial<FiltrosHistoricoEmail>) {
    setFiltros((f) => ({ ...f, ...alteracoes, pagina: 1 }))
  }

  return (
    <div>

      <Card className="mb-5 flex flex-wrap items-center gap-3 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
          <input
            value={pesquisaRascunho}
            onChange={(e) => setPesquisaRascunho(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && aplicar({ pesquisa: pesquisaRascunho })}
            placeholder="Nome ou e-mail..."
            className="h-9 rounded-lg border border-border py-2 pl-9 pr-3 text-[12.5px] outline-none focus:border-[#111827]"
          />
        </div>
        <select value={filtros.status ?? ''} onChange={(e) => aplicar({ status: e.target.value || undefined })} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]">
          <option value="">Todos os estados</option>
          {(Object.keys(LABEL_ESTADO_EMAIL) as EstadoEmail[]).map((e) => <option key={e} value={e}>{LABEL_ESTADO_EMAIL[e]}</option>)}
        </select>
      </Card>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3.5 py-2.5 font-medium">Destinatário</th>
              <th className="px-3.5 py-2.5 font-medium">Tipo</th>
              <th className="px-3.5 py-2.5 font-medium">Estado</th>
              <th className="px-3.5 py-2.5 font-medium">Tentativas</th>
              <th className="px-3.5 py-2.5 font-medium">Enviado em</th>
              <th className="px-3.5 py-2.5 font-medium">Erro</th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-border ${isFetching ? 'opacity-60' : ''}`}>
            {!isLoading && data?.dados.length === 0 && <tr><td colSpan={6} className="py-16 text-center text-subtle">Nenhum e-mail encontrado.</td></tr>}
            {data?.dados.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-bg">
                <td className="px-3.5 py-2.5">
                  <p className="font-medium text-text">{item.nome ?? '—'}</p>
                  <p className="text-[11px] text-subtle">{item.email}</p>
                </td>
                <td className="px-3.5 py-2.5 text-muted">{item.tipo}</td>
                <td className="px-3.5 py-2.5"><span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${COR_ESTADO_EMAIL[item.status]}`}>{LABEL_ESTADO_EMAIL[item.status]}</span></td>
                <td className="px-3.5 py-2.5 text-muted">{item.tentativas}</td>
                <td className="px-3.5 py-2.5 text-muted">{item.data_envio ? new Date(item.data_envio).toLocaleString('pt-PT') : '—'}</td>
                <td className="max-w-[220px] truncate px-3.5 py-2.5 text-[11px] text-badge-red-text" title={item.erro ?? ''}>{item.erro ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-4">
        <PaginacaoServidor paginacao={data?.paginacao} onMudarPagina={(pagina) => setFiltros((f) => ({ ...f, pagina }))} />
      </div>
    </div>
  )
}
