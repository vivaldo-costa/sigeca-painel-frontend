import { useState } from 'react'
import { ChevronDown, Plus, Trash2, Users } from 'lucide-react'
import { useEventoZonas, useCriarZona, useRemoverZona, useZonaOcupantes, useAdicionarOcupanteZona, useRemoverOcupanteZona } from '@/hooks/useEventoZonas'
import { Card } from '@/components/ui/Card'
import { notificar } from '@/lib/notificar'
import { cn } from '@/lib/cn'
import { TIPOS_ZONA, type TipoZona } from '@/types/eventoZona'

export function AbaZonas({ atividadeId }: { atividadeId: number }) {
  const [filtroTipo, setFiltroTipo] = useState('')
  const { data: zonas } = useEventoZonas(atividadeId, filtroTipo)
  const criar = useCriarZona(atividadeId)
  const remover = useRemoverZona(atividadeId)

  const [novaZona, setNovaZona] = useState({ tipo: 'subcampo' as TipoZona, nome: '', capacidade: '', descricao: '' })
  const [zonaAberta, setZonaAberta] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Nova zona</p>
        <div className="flex flex-wrap gap-2">
          <select value={novaZona.tipo} onChange={(e) => setNovaZona((f) => ({ ...f, tipo: e.target.value as TipoZona }))} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12px] outline-none focus:border-[#111827]">
            {TIPOS_ZONA.map((t) => <option key={t.valor} value={t.valor}>{t.label}</option>)}
          </select>
          <input value={novaZona.nome} onChange={(e) => setNovaZona((f) => ({ ...f, nome: e.target.value }))} placeholder="Nome (ex: Subcampo A - Tenda 3)" className="min-w-[180px] flex-1 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <input type="number" value={novaZona.capacidade} onChange={(e) => setNovaZona((f) => ({ ...f, capacidade: e.target.value }))} placeholder="Capacidade" className="w-28 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <button
            onClick={() => { criar.mutate(novaZona); setNovaZona({ tipo: 'subcampo', nome: '', capacidade: '', descricao: '' }) }}
            disabled={!novaZona.nome || criar.isPending}
            className="flex items-center gap-1 rounded-lg bg-[#111827] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </Card>

      <Card className="flex flex-wrap gap-2 p-3">
        <button onClick={() => setFiltroTipo('')} className={cn('rounded-full px-3 py-1 text-[11.5px] font-semibold', !filtroTipo ? 'bg-[#111827] text-white' : 'bg-bg text-muted')}>Todas</button>
        {TIPOS_ZONA.map((t) => (
          <button key={t.valor} onClick={() => setFiltroTipo(t.valor)} className={cn('rounded-full px-3 py-1 text-[11.5px] font-semibold', filtroTipo === t.valor ? 'bg-[#111827] text-white' : 'bg-bg text-muted')}>
            {t.label}
          </button>
        ))}
      </Card>

      <div className="space-y-3">
        {zonas?.length === 0 && <p className="py-8 text-center text-sm text-subtle">Nenhuma zona encontrada.</p>}
        {zonas?.map((z) => (
          <Card key={z.id} className="overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <button onClick={() => setZonaAberta(zonaAberta === z.id ? null : z.id)} className="flex flex-1 items-center justify-between text-left">
                <div>
                  <p className="font-semibold text-text">{z.nome}</p>
                  <p className="text-[11.5px] text-subtle">
                    {TIPOS_ZONA.find((t) => t.valor === z.tipo)?.label}
                    {z.responsavel_nome && ` · ${z.responsavel_nome}`}
                    {' · '}
                    <span className="inline-flex items-center gap-1"><Users className="size-3" /> {z.total_ocupantes}{z.capacidade ? ` / ${z.capacidade}` : ''}</span>
                  </p>
                  {z.detalhes && (
                    <p className="mt-0.5 text-[11px] text-subtle">
                      {Object.entries(z.detalhes).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </p>
                  )}
                </div>
                <ChevronDown className={cn('size-4 shrink-0 text-subtle transition-transform', zonaAberta === z.id && 'rotate-180')} />
              </button>
              <button onClick={() => remover.mutate(z.id)} className="ml-3 shrink-0 text-red-400 hover:text-red-600"><Trash2 className="size-3.5" /></button>
            </div>
            {zonaAberta === z.id && <OcupantesZona zonaId={z.id} atividadeId={atividadeId} />}
          </Card>
        ))}
      </div>
    </div>
  )
}

function OcupantesZona({ zonaId, atividadeId }: { zonaId: number; atividadeId: number }) {
  const { data: ocupantes } = useZonaOcupantes(zonaId)
  const adicionar = useAdicionarOcupanteZona(zonaId, atividadeId)
  const remover = useRemoverOcupanteZona(zonaId, atividadeId)
  const [inscricaoId, setInscricaoId] = useState('')

  async function handleAdicionar() {
    if (!inscricaoId) return
    try {
      await adicionar.mutateAsync(Number(inscricaoId))
      setInscricaoId('')
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { mensagem?: string } } }).response?.data?.mensagem
        : undefined
      notificar.erro(msg ?? 'Não foi possível atribuir.')
    }
  }

  return (
    <div className="border-t border-border p-4">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">Ocupantes</p>
      <div className="mb-2 flex gap-2">
        <input
          type="number"
          value={inscricaoId}
          onChange={(e) => setInscricaoId(e.target.value)}
          placeholder="ID da inscrição (ver em Delegações e Inscrições)"
          className="flex-1 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]"
        />
        <button onClick={handleAdicionar} disabled={!inscricaoId || adicionar.isPending} className="rounded-lg bg-[#111827] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50">
          Atribuir
        </button>
      </div>
      <div className="space-y-1">
        {ocupantes?.map((o) => (
          <div key={o.id} className="flex items-center justify-between rounded-lg bg-bg px-3 py-1.5 text-[12.5px]">
            <span>{o.nome} <span className="font-mono text-[11px] text-subtle">{o.codigo_associado}</span></span>
            <button onClick={() => remover.mutate(o.id)} className="text-red-400 hover:text-red-600"><Trash2 className="size-3.5" /></button>
          </div>
        ))}
        {ocupantes?.length === 0 && <p className="text-[12px] text-subtle">Ainda sem ocupantes.</p>}
      </div>
    </div>
  )
}
