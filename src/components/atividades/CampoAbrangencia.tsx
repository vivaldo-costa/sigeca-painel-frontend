import { useOpcoesFiltro } from '@/hooks/useDashboardPainel'
import { cn } from '@/lib/cn'

export type Abrangencia = 'nacional' | 'dioceses'

interface Props {
  abrangencia: Abrangencia
  diocesesIds: number[]
  onChange: (valor: { abrangencia: Abrangencia; dioceses_ids: number[] }) => void
}

/** Nacional (todas as dioceses) ou só para algumas dioceses. */
export function CampoAbrangencia({ abrangencia, diocesesIds, onChange }: Props) {
  const { data: dioceses } = useOpcoesFiltro('dioceses')
  const alternar = (id: number) => onChange({
    abrangencia, dioceses_ids: diocesesIds.includes(id) ? diocesesIds.filter((d) => d !== id) : [...diocesesIds, id],
  })
  return (
    <div className="space-y-2">
      <label className="block text-[13px] font-medium text-muted">Abrangência</label>
      <div className="flex gap-2">
        {([['nacional', 'Nacional (todas as dioceses)'], ['dioceses', 'Só algumas dioceses']] as const).map(([v, r]) => (
          <button key={v} type="button" onClick={() => onChange({ abrangencia: v, dioceses_ids: v === 'nacional' ? [] : diocesesIds })}
            className={cn('flex-1 rounded-lg border px-3 py-2 text-[12.5px] font-semibold',
              abrangencia === v ? 'border-[#111827] bg-[#111827] text-white' : 'border-border text-muted hover:bg-bg')}>
            {r}
          </button>
        ))}
      </div>
      {abrangencia === 'dioceses' && (
        <div className="grid max-h-40 grid-cols-2 gap-1 overflow-y-auto rounded-lg border border-border p-2">
          {(dioceses ?? []).map((d) => (
            <label key={d.id} className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-[12.5px] hover:bg-bg">
              <input type="checkbox" checked={diocesesIds.includes(d.id)} onChange={() => alternar(d.id)} className="size-3.5" />
              {d.nome}
            </label>
          ))}
        </div>
      )}
      {abrangencia === 'dioceses' && diocesesIds.length === 0 && <p className="text-[11.5px] text-badge-orange-text">Escolhe pelo menos uma diocese.</p>}
    </div>
  )
}
