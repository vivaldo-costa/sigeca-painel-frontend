import { useState } from 'react'
import { X, Loader2, Paperclip, UserRound, EyeOff } from 'lucide-react'
import { useDenunciaDetalhe, useMudarEstadoDenuncia } from '@/hooks/useDenuncias'
import { getApiErrorMessage } from '@/lib/api'
import { BadgeEstadoDenuncia } from './BadgeEstadoDenuncia'
import type { EstadoDenuncia } from '@/types/denuncia'
import { notificar } from '@/lib/notificar'
import { LinkFicheiroProtegido } from '@/components/ui/LinkFicheiroProtegido'

interface Props { id: number; onClose: () => void }

const ESTADOS: EstadoDenuncia[] = ['nova', 'em_analise', 'resolvida', 'encerrada']

export function ModalDenunciaDetalhe({ id, onClose }: Props) {
  const { data, isLoading } = useDenunciaDetalhe(id)
  const mudarEstado = useMudarEstadoDenuncia()
  const [nota, setNota] = useState('')

  async function handleMudarEstado(estado: EstadoDenuncia) {
    try {
      await mudarEstado.mutateAsync({ id, estado, nota: nota || undefined })
      setNota('')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível actualizar o estado.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">Denúncia #{id}</h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>

        {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

        {data && (
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-text">{data.tipo}</span>
              <BadgeEstadoDenuncia estado={data.estado} />
            </div>

            <p className="whitespace-pre-line rounded-xl bg-bg p-3.5 text-[13px] leading-relaxed text-text">{data.descricao}</p>

            <div className="grid grid-cols-2 gap-3 text-[12.5px]">
              <div>
                <p className="text-[10.5px] font-medium uppercase tracking-wide text-subtle">Denunciante</p>
                {data.anonimo ? (
                  <p className="mt-0.5 flex items-center gap-1.5 text-muted"><EyeOff className="size-3" /> Anónimo</p>
                ) : (
                  <p className="mt-0.5 flex items-center gap-1.5 text-text"><UserRound className="size-3 text-subtle" /> {data.denunciante_nome ?? '—'}</p>
                )}
              </div>
              {data.associado_nome && (
                <div>
                  <p className="text-[10.5px] font-medium uppercase tracking-wide text-subtle">Pessoa denunciada</p>
                  <p className="mt-0.5 text-text">{data.associado_nome}</p>
                </div>
              )}
            </div>

            {data.anexo_path && (
              <LinkFicheiroProtegido
                pasta="denuncias" nome={data.anexo_path} nomeFicheiro={data.anexo_nome}
                className="flex w-fit items-center gap-1.5 rounded-lg bg-bg px-3 py-1.5 text-[12px] font-medium text-badge-blue-text hover:underline"
              >
                <Paperclip className="size-3.5" /> {data.anexo_nome ?? 'Ver anexo'}
              </LinkFicheiroProtegido>
            )}


            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-subtle">Mudar estado</p>
              <textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Nota interna (opcional)..."
                rows={2}
                className="mb-2 w-full resize-none rounded-lg border border-border px-3 py-2 text-[12.5px] outline-none focus:border-[#111827]"
              />
              <div className="flex flex-wrap gap-2">
                {ESTADOS.filter((e) => e !== data.estado).map((e) => (
                  <button
                    key={e}
                    onClick={() => handleMudarEstado(e)}
                    disabled={mudarEstado.isPending}
                    className="rounded-full border border-border px-3 py-1.5 text-[11.5px] font-medium text-text transition hover:bg-bg disabled:opacity-50"
                  >
                    Marcar como {LABEL_ESTADO[e]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">Histórico</p>
              <div className="space-y-2">
                {data.historico.map((h) => (
                  <div key={h.id} className="rounded-lg bg-bg px-3 py-2 text-[12px]">
                    <p className="text-text">
                      {h.estado_anterior ? `${LABEL_ESTADO[h.estado_anterior]} → ` : ''}{LABEL_ESTADO[h.estado_novo]}
                    </p>
                    {h.nota && <p className="mt-0.5 text-muted">{h.nota}</p>}
                    <p className="mt-0.5 text-[10.5px] text-subtle">
                      {h.utilizador_nome ?? 'Sistema'} · {new Date(h.created_at).toLocaleString('pt-PT')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const LABEL_ESTADO: Record<EstadoDenuncia, string> = {
  nova: 'Nova', em_analise: 'Em análise', resolvida: 'Resolvida', encerrada: 'Encerrada',
}
