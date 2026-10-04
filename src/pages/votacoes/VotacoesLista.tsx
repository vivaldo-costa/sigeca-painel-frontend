import { useState } from 'react'
import { Vote, Plus, Loader2, Pencil, Trash2 } from 'lucide-react'
import { useVotacoes, useRemoverVotacao } from '@/hooks/useVotacoes'
import { usePermissao } from '@/hooks/usePermissao'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { ModalVotacaoForm } from '@/components/votacoes/ModalVotacaoForm'
import { uploadUrl } from '@/lib/uploads'
import type { VotacaoPainel } from '@/types/votacao'

export function VotacoesLista() {
  const { data, isLoading } = useVotacoes()
  const remover = useRemoverVotacao()
  const { criar: podeCriar, editar: podeEditar, apagar: podeEliminar } = usePermissao('Votações')

  const [modalForm, setModalForm] = useState<'novo' | VotacaoPainel | null>(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState<number | null>(null)

  async function handleEliminar(id: number) {
    if (confirmarEliminar !== id) {
      setConfirmarEliminar(id)
      setTimeout(() => setConfirmarEliminar(null), 3000)
      return
    }
    await remover.mutateAsync(id)
    setConfirmarEliminar(null)
  }

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-6 sm:px-6 sm:py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <Vote className="size-5 text-muted" /> Votações
        </h1>
        <div className="flex items-center gap-2">
          <ExportarBotoes
            tamanho="sm"
            nomeFicheiro="votacoes"
            titulo="Votações"
            colunas={[
              { titulo: 'Título', valor: (v: VotacaoPainel) => v.titulo },
              { titulo: 'Descrição', valor: (v) => v.descricao ?? '—' },
              { titulo: 'Data Início', valor: (v) => (v.data_inicio ? new Date(v.data_inicio).toLocaleDateString('pt-PT') : '—') },
              { titulo: 'Data Fim', valor: (v) => (v.data_fim ? new Date(v.data_fim).toLocaleDateString('pt-PT') : '—') },
              { titulo: 'Estado', valor: (v) => (v.ativo ? 'Activa' : 'Inactiva') },
            ]}
            linhas={data ?? []}
          />
          {podeCriar && (
            <button onClick={() => setModalForm('novo')} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-black">
              <Plus className="size-3.5" /> Nova Votação
            </button>
          )}
        </div>
      </div>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data?.map((v, i) => (
          <Card key={v.id} className="hover-lift animate-slide-up overflow-hidden" style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}>
            <div className="relative aspect-[16/9] bg-bg">
              {v.imagem ? (
                <img src={uploadUrl('votacoes', v.imagem)!} className="size-full object-cover" alt={v.titulo} loading="lazy" />
              ) : (
                <div className="grid size-full place-items-center text-subtle"><Vote className="size-8" /></div>
              )}
              {!v.ativo && <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">Inactiva</span>}
            </div>
            <div className="p-3.5">
              <h3 className="truncate text-[13.5px] font-semibold text-text">{v.titulo}</h3>
              {v.descricao && <p className="mt-0.5 line-clamp-2 text-[12px] text-subtle">{v.descricao}</p>}
              {(v.data_inicio || v.data_fim) && (
                <p className="mt-1 text-[11px] text-subtle">
                  {v.data_inicio && new Date(v.data_inicio).toLocaleDateString('pt-PT')}
                  {v.data_fim && ` – ${new Date(v.data_fim).toLocaleDateString('pt-PT')}`}
                </p>
              )}

              {(podeEditar || podeEliminar) && (
                <div className="mt-3 flex gap-2 border-t border-border pt-3">
                  {podeEditar && (
                    <button onClick={() => setModalForm(v)} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-[11.5px] font-medium text-text transition hover:bg-bg">
                      <Pencil className="size-3" /> Editar
                    </button>
                  )}
                  {podeEliminar && (
                    <button
                      onClick={() => handleEliminar(v.id)}
                      disabled={remover.isPending}
                      className={`flex items-center justify-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11.5px] transition disabled:opacity-50 ${
                        confirmarEliminar === v.id ? 'border-badge-red-text bg-badge-red-text text-white' : 'border-red-200 text-red-500 hover:bg-red-50'
                      }`}
                    >
                      <Trash2 className="size-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {!isLoading && data?.length === 0 && <p className="py-16 text-center text-sm text-subtle">Nenhuma votação encontrada.</p>}

      {modalForm && <ModalVotacaoForm votacao={modalForm === 'novo' ? null : modalForm} onClose={() => setModalForm(null)} />}
    </div>
  )
}
