import { Filter, X, Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useOpcoesFiltro } from '@/hooks/useDashboardPainel'
import { formatarAgrupamento } from '@/lib/formatadores'
import type { FiltrosDashboard } from '@/types/dashboard'

interface Props {
  rascunho: FiltrosDashboard
  setRascunho: (f: FiltrosDashboard) => void
  aplicados: FiltrosDashboard
  onAplicar: () => void
  onLimpar: () => void
}

/**
 * Visível apenas para ADMIN/TECNICO — os únicos perfis sem âmbito restrito no backend real.
 * Qualquer filtro pode ser aplicado isoladamente — os selects não bloqueiam
 * uns aos outros.
 */
export function FiltrosBar({ rascunho, setRascunho, aplicados, onAplicar, onLimpar }: Props) {
  const dioceses = useOpcoesFiltro('dioceses')
  const vigararias = useOpcoesFiltro('vigararias', rascunho.diocese)
  const paroquias = useOpcoesFiltro('paroquias', rascunho.vigararia)
  const agrupamentos = useOpcoesFiltro('agrupamentos', rascunho.paroquia)

  const activo = Object.values(aplicados).some((v) => v !== undefined)

  function set(campo: keyof FiltrosDashboard, valor: string) {
    setRascunho({ ...rascunho, [campo]: valor ? Number(valor) : undefined })
  }

  return (
    <Card className="flex flex-wrap items-center gap-3 p-4">
      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-text">
        <Filter className="size-3.5" /> Filtrar dados
      </span>

      <Select label="Diocese" value={rascunho.diocese} onChange={(v) => set('diocese', v)} opcoes={dioceses.data} placeholder="Todas as dioceses" />
      <Select label="Vigararia" value={rascunho.vigararia} onChange={(v) => set('vigararia', v)} opcoes={vigararias.data} placeholder="Todas as vigararias" />
      <Select label="Paróquia" value={rascunho.paroquia} onChange={(v) => set('paroquia', v)} opcoes={paroquias.data} placeholder="Todas as paróquias" />
      <Select label="Agrupamento" value={rascunho.agrupamento} onChange={(v) => set('agrupamento', v)} opcoes={agrupamentos.data} placeholder="Todos os agrupamentos" />

      <div className="ml-auto flex items-center gap-2">
        {activo && (
          <button
            onClick={onLimpar}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12.5px] font-medium text-muted transition hover:bg-bg"
          >
            <X className="size-3.5" /> Limpar
          </button>
        )}
        <button
          onClick={onAplicar}
          className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-black"
        >
          <Search className="size-3.5" /> Aplicar
        </button>
      </div>
    </Card>
  )
}

function Select({
  label, value, onChange, opcoes, placeholder,
}: {
  label: string
  value: number | undefined
  onChange: (v: string) => void
  opcoes: { id: number; nome: string; ab_agrupamento?: string | null }[] | undefined
  placeholder: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-subtle">{label}</label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 min-w-[150px] rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]"
      >
        <option value="">{placeholder}</option>
        {opcoes?.map((o) => (
          <option key={o.id} value={o.id}>{formatarAgrupamento(o)}</option>
        ))}
      </select>
    </div>
  )
}
