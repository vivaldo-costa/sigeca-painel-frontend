import { useState } from 'react'
import { Plus, ShieldAlert } from 'lucide-react'
import { useOcorrenciasSaude, useCriarOcorrenciaSaude, useMudarEstadoOcorrencia } from '@/hooks/useOcorrenciasSaude'
import { Card } from '@/components/ui/Card'
import type { GravidadeOcorrencia, EstadoOcorrencia } from '@/types/eventoCampo'

const CORES_GRAVIDADE: Record<GravidadeOcorrencia, string> = {
  leve: 'bg-badge-blue-bg text-badge-blue-text',
  moderada: 'bg-badge-orange-bg text-badge-orange-text',
  grave: 'bg-badge-red-bg text-badge-red-text',
}

export function AbaSaudeOperacional({ atividadeId }: { atividadeId: number }) {
  const { data: ocorrencias, isError: semAcesso } = useOcorrenciasSaude(atividadeId)
  const criar = useCriarOcorrenciaSaude(atividadeId)
  const mudarEstado = useMudarEstadoOcorrencia(atividadeId)

  const [novo, setNovo] = useState({ inscricao_id: '', tipo: '', descricao: '', gravidade: 'leve' as GravidadeOcorrencia })

  if (semAcesso) {
    return (
      <Card className="flex items-center gap-3 p-6">
        <ShieldAlert className="size-5 shrink-0 text-amber-500" />
        <p className="text-[13px] text-muted">Não tens um papel autorizado (equipa de saúde, secretaria, direcção) para aceder à saúde operacional deste evento.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Nova ocorrência</p>
        <div className="flex flex-wrap gap-2">
          <input
            type="number"
            value={novo.inscricao_id}
            onChange={(e) => setNovo((f) => ({ ...f, inscricao_id: e.target.value }))}
            placeholder="ID da inscrição"
            className="w-40 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]"
          />
          <input value={novo.tipo} onChange={(e) => setNovo((f) => ({ ...f, tipo: e.target.value }))} placeholder="Tipo (ex: Febre, Ferimento)" className="min-w-[160px] flex-1 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <select value={novo.gravidade} onChange={(e) => setNovo((f) => ({ ...f, gravidade: e.target.value as GravidadeOcorrencia }))} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12px] outline-none focus:border-[#111827]">
            <option value="leve">Leve</option>
            <option value="moderada">Moderada</option>
            <option value="grave">Grave</option>
          </select>
          <button
            onClick={() => { criar.mutate({ ...novo, inscricao_id: Number(novo.inscricao_id) }); setNovo({ inscricao_id: '', tipo: '', descricao: '', gravidade: 'leve' }) }}
            disabled={!novo.inscricao_id || !novo.tipo || criar.isPending}
            className="flex items-center gap-1 rounded-lg bg-[#111827] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
        <textarea
          value={novo.descricao}
          onChange={(e) => setNovo((f) => ({ ...f, descricao: e.target.value }))}
          placeholder="Descrição, tratamento dado..."
          rows={2}
          className="mt-2 w-full resize-none rounded-lg border border-border px-3 py-2 text-[12.5px] outline-none focus:border-[#111827]"
        />
      </Card>

      <div className="space-y-2">
        {ocorrencias?.map((o) => (
          <Card key={o.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-text">{o.nome} <span className="font-mono text-[11px] text-subtle">{o.codigo_associado}</span></p>
                <p className="mt-0.5 text-[13px] text-text">{o.tipo}</p>
                {o.descricao && <p className="mt-0.5 text-[12.5px] text-muted">{o.descricao}</p>}
                {o.encaminhamento && <p className="mt-0.5 text-[12px] text-subtle">Encaminhamento: {o.encaminhamento}</p>}
                <p className="mt-1 text-[11px] text-subtle">{o.registado_por_nome} · {new Date(o.created_at).toLocaleString('pt-PT')}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CORES_GRAVIDADE[o.gravidade]}`}>{o.gravidade}</span>
            </div>
            {o.estado !== 'encerrada' && (
              <div className="mt-3 flex gap-2 border-t border-border pt-3">
                {(['em_acompanhamento', 'encerrada'] as EstadoOcorrencia[]).filter((e) => e !== o.estado).map((e) => (
                  <button
                    key={e}
                    onClick={() => mudarEstado.mutate({ id: o.id, estado: e })}
                    className="rounded-full border border-border px-3 py-1 text-[11.5px] font-medium text-text hover:bg-bg"
                  >
                    {e === 'em_acompanhamento' ? 'Em acompanhamento' : 'Encerrar'}
                  </button>
                ))}
              </div>
            )}
            {o.estado === 'encerrada' && <span className="mt-2 inline-block rounded-full bg-bg px-2.5 py-0.5 text-[10.5px] font-semibold text-subtle">Encerrada</span>}
          </Card>
        ))}
        {ocorrencias?.length === 0 && <p className="py-8 text-center text-sm text-subtle">Nenhuma ocorrência registada.</p>}
      </div>
    </div>
  )
}
