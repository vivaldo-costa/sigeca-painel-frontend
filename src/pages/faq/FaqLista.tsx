import { useState } from 'react'
import { CircleHelp, Plus, Loader2, Pencil, Trash2, ChevronDown } from 'lucide-react'
import { useFaqs, useRemoverFaq } from '@/hooks/useFaq'
import { usePermissao } from '@/hooks/usePermissao'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { ModalFaqForm } from '@/components/faq/ModalFaqForm'
import { cn } from '@/lib/cn'
import type { FaqPainel } from '@/types/faq'

export function FaqLista() {
  const { data, isLoading } = useFaqs()
  const remover = useRemoverFaq()
  const { criar: podeCriar, editar: podeEditar, apagar: podeEliminar } = usePermissao('Perguntas')

  const [aberta, setAberta] = useState<number | null>(null)
  const [modalForm, setModalForm] = useState<'novo' | FaqPainel | null>(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState<number | null>(null)

  async function handleEliminar(id: number, e: React.MouseEvent) {
    e.stopPropagation()
    if (confirmarEliminar !== id) {
      setConfirmarEliminar(id)
      setTimeout(() => setConfirmarEliminar(null), 3000)
      return
    }
    await remover.mutateAsync(id)
    setConfirmarEliminar(null)
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <CircleHelp className="size-5 text-muted" /> Perguntas Frequentes
        </h1>
        <div className="flex items-center gap-2">
          <ExportarBotoes
            tamanho="sm"
            nomeFicheiro="perguntas-frequentes"
            titulo="Perguntas Frequentes"
            colunas={[
              { titulo: 'Pergunta', valor: (f: FaqPainel) => f.pergunta },
              { titulo: 'Resposta', valor: (f) => f.resposta },
              { titulo: 'Estado', valor: (f) => (f.ativo ? 'Activa' : 'Inactiva') },
              { titulo: 'Data', valor: (f) => new Date(f.created_at).toLocaleDateString('pt-PT') },
            ]}
            linhas={data ?? []}
          />
          {podeCriar && (
            <button onClick={() => setModalForm('novo')} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-black">
              <Plus className="size-3.5" /> Nova Pergunta
            </button>
          )}
        </div>
      </div>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <div className="space-y-2.5">
        {data?.map((faq, i) => (
          <Card key={faq.id} className="animate-slide-up overflow-hidden" style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}>
            <button onClick={() => setAberta(aberta === faq.id ? null : faq.id)} className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left">
              <span className="flex items-center gap-2 text-[13.5px] font-medium text-text">
                {faq.pergunta}
                {!faq.ativo && <span className="rounded-full bg-bg px-2 py-0.5 text-[10px] font-semibold text-muted">Inactiva</span>}
              </span>
              <ChevronDown className={cn('size-4 shrink-0 text-subtle transition-transform', aberta === faq.id && 'rotate-180')} />
            </button>
            {aberta === faq.id && (
              <div className="animate-slide-up border-t border-border px-4 py-3.5">
                <p className="whitespace-pre-line text-[13px] leading-relaxed text-muted">{faq.resposta}</p>
                {(podeEditar || podeEliminar) && (
                  <div className="mt-3 flex gap-2">
                    {podeEditar && (
                      <button onClick={() => setModalForm(faq)} className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11.5px] font-medium text-text transition hover:bg-bg">
                        <Pencil className="size-3" /> Editar
                      </button>
                    )}
                    {podeEliminar && (
                      <button
                        onClick={(e) => handleEliminar(faq.id, e)}
                        disabled={remover.isPending}
                        className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11.5px] transition disabled:opacity-50 ${
                          confirmarEliminar === faq.id ? 'border-badge-red-text bg-badge-red-text text-white' : 'border-red-200 text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <Trash2 className="size-3" /> Eliminar
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {!isLoading && data?.length === 0 && <p className="py-16 text-center text-sm text-subtle">Nenhuma pergunta encontrada.</p>}

      {modalForm && <ModalFaqForm faq={modalForm === 'novo' ? null : modalForm} onClose={() => setModalForm(null)} />}
    </div>
  )
}
