import { useState } from 'react'
import { X, Loader2, Users } from 'lucide-react'
import { PagamentosInscricoes } from './PagamentosInscricoes'
import { cn } from '@/lib/cn'
import { uploadUrl } from '@/lib/uploads'
import type { criarHooksAtividade } from '@/hooks/criarHooksAtividade'
import type { AtividadePainel, EstadoInscricao } from '@/types/atividade'

interface Props {
  hooks: ReturnType<typeof criarHooksAtividade>
  atividade: AtividadePainel
  onClose: () => void
}

const ESTADOS: EstadoInscricao[] = ['pendente', 'confirmada', 'pago', 'cancelada']
const CORES: Record<EstadoInscricao, string> = {
  pendente: 'bg-badge-orange-bg text-badge-orange-text',
  confirmada: 'bg-badge-blue-bg text-badge-blue-text',
  pago: 'bg-badge-green-bg text-badge-green-text',
  cancelada: 'bg-bg text-muted',
}

export function ModalInscritos({ hooks, atividade, onClose }: Props) {
  const { data: inscritos, isLoading } = hooks.useInscritos(atividade.id)
  const atualizar = hooks.useAtualizarInscricao()
  const [vista, setVista] = useState<'inscritos' | 'pagamentos'>('inscritos')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-text">
            <Users className="size-4 text-muted" /> Inscritos — {atividade.titulo}
          </h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>

        {atividade.tipo_acesso === 'Pago' && (
          <div className="flex shrink-0 gap-1 border-b border-border px-6">
            {([['inscritos', 'Inscritos'], ['pagamentos', 'Comprovativos de pagamento']] as const).map(([v, rotulo]) => (
              <button key={v} onClick={() => setVista(v)} className={cn('border-b-2 px-3 py-2 text-[12.5px] font-medium transition', vista === v ? 'border-[#111827] text-text' : 'border-transparent text-subtle hover:text-text')}>
                {rotulo}
              </button>
            ))}
          </div>
        )}

        {vista === 'pagamentos' ? (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <PagamentosInscricoes base={hooks.basePath} atividadeId={atividade.id} />
          </div>
        ) : (
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading && <div className="flex justify-center py-10"><Loader2 className="size-6 animate-spin text-subtle" /></div>}
          {!isLoading && inscritos?.length === 0 && <p className="py-10 text-center text-sm text-subtle">Ainda não há inscritos.</p>}

          <div className="space-y-2">
            {inscritos?.map((insc) => (
              <div key={insc.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <div className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-bg text-[11px] font-semibold text-muted">
                  {insc.foto ? (
                    <img src={uploadUrl('avatar', insc.foto)!} className="size-full object-cover" alt="" />
                  ) : (
                    insc.nome[0]?.toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-text">{insc.nome}</p>
                  <p className="truncate font-mono text-[11px] text-subtle">{insc.codigo_associado}</p>
                </div>
                <select
                  value={insc.estado}
                  onChange={(e) => atualizar.mutate({ inscricaoId: insc.id, estado: e.target.value as EstadoInscricao })}
                  disabled={atualizar.isPending}
                  className={`rounded-full border-0 px-2.5 py-1 text-[11px] font-semibold outline-none ${CORES[insc.estado]}`}
                >
                  {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
