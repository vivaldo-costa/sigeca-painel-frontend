import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { useLogs } from '@/hooks/useLogs'
import { Card } from '@/components/ui/Card'
import { COR_NIVEL_LOG, type NivelLog } from '@/types/logs'

export function LogsPage() {
  const [ficheiro, setFicheiro] = useState<'combinado' | 'erro'>('combinado')
  const [nivel, setNivel] = useState('')
  const [pesquisaRascunho, setPesquisaRascunho] = useState('')
  const [pesquisa, setPesquisa] = useState('')

  const { data, isLoading, isFetching } = useLogs({ ficheiro, nivel: nivel || undefined, pesquisa: pesquisa || undefined, limite: 300 })

  return (
    <div>
      <Card className="mb-4 flex flex-wrap items-center gap-3 p-4">
        <select value={ficheiro} onChange={(e) => setFicheiro(e.target.value as 'combinado' | 'erro')} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] outline-none focus:border-[#111827]">
          <option value="combinado">Todos os registos</option>
          <option value="erro">Só erros</option>
        </select>
        <select value={nivel} onChange={(e) => setNivel(e.target.value)} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] outline-none focus:border-[#111827]">
          <option value="">Todos os níveis</option>
          <option value="error">Erro</option>
          <option value="warn">Aviso</option>
          <option value="info">Informação</option>
        </select>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
          <input
            value={pesquisaRascunho}
            onChange={(e) => setPesquisaRascunho(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setPesquisa(pesquisaRascunho)}
            placeholder="Pesquisar na mensagem..."
            className="h-9 w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[12.5px] outline-none focus:border-[#111827]"
          />
        </div>
      </Card>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <Card className={`divide-y divide-border overflow-x-auto ${isFetching ? 'opacity-60' : ''}`}>
        {!isLoading && data?.length === 0 && <p className="py-16 text-center text-[12.5px] text-subtle">Nenhum registo encontrado.</p>}
        {data?.map((log) => (
          <div key={log.id} className="flex items-start gap-3 px-4 py-2.5 text-[12.5px]">
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${COR_NIVEL_LOG[log.nivel as NivelLog] ?? 'bg-bg text-subtle'}`}>{log.nivel.toUpperCase()}</span>
            <span className="shrink-0 text-[11px] text-subtle">{log.timestamp ?? '—'}</span>
            <span className="break-all text-text">{log.mensagem}</span>
          </div>
        ))}
      </Card>
    </div>
  )
}
