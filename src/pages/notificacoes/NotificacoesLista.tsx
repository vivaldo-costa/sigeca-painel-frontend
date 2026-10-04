import { useState } from 'react'
import { Bell, Plus, Loader2, Pencil, Trash2, Globe, User } from 'lucide-react'
import { useNotificacoesGestao, useRemoverNotificacao } from '@/hooks/useNotificacoes'
import { usePermissao } from '@/hooks/usePermissao'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { ModalNotificacaoForm } from '@/components/notificacoes/ModalNotificacaoForm'
import type { NotificacaoPainel } from '@/types/notificacao'

const LABEL_DESTINO = { portal: 'Portal', painel: 'Painel', ambos: 'Portal + Painel' }
const LABEL_LOCAL: Record<string, string> = {
  abertura: 'Ao abrir', dashboard: 'Início', perfil: 'Perfil', loja: 'Loja', documentos: 'Documentos', actividades: 'Actividades',
}

export function NotificacoesLista() {
  const { data, isLoading } = useNotificacoesGestao()
  const remover = useRemoverNotificacao()
  const { criar: podeCriar, editar: podeEditar, apagar: podeEliminar } = usePermissao('Notificações')

  const [modalForm, setModalForm] = useState<'novo' | NotificacaoPainel | null>(null)
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
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <Bell className="size-5 text-muted" /> Notificações
        </h1>
        <div className="flex items-center gap-2">
          <ExportarBotoes
            tamanho="sm"
            nomeFicheiro="notificacoes"
            titulo="Notificações"
            colunas={[
              { titulo: 'Título', valor: (n: NotificacaoPainel) => n.titulo ?? '—' },
              { titulo: 'Mensagem', valor: (n) => n.mensagem },
              { titulo: 'Destino', valor: (n) => LABEL_DESTINO[n.destino] },
              { titulo: 'Onde aparece', valor: (n) => LABEL_LOCAL[n.local_exibicao] },
              { titulo: 'Alcance', valor: (n) => (n.global ? 'Todos os utilizadores' : (n.utilizador_nome ?? `ID ${n.utilizador_id}`)) },
              { titulo: 'Estado', valor: (n) => (n.ativo ? 'Activa' : 'Inactiva') },
              { titulo: 'Data', valor: (n) => new Date(n.created_at).toLocaleDateString('pt-PT') },
            ]}
            linhas={data ?? []}
          />
          {podeCriar && (
            <button onClick={() => setModalForm('novo')} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-black">
              <Plus className="size-3.5" /> Nova Notificação
            </button>
          )}
        </div>
      </div>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <div className="space-y-3">
        {data?.map((n, i) => (
          <Card key={n.id} className="animate-slide-up p-4" style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {n.titulo && <p className="font-semibold text-text">{n.titulo}</p>}
                  <span className="rounded-full bg-badge-blue-bg px-2 py-0.5 text-[10.5px] font-semibold text-badge-blue-text">{LABEL_DESTINO[n.destino]}</span>
                  <span className="rounded-full bg-bg px-2 py-0.5 text-[10.5px] font-medium text-muted">{LABEL_LOCAL[n.local_exibicao]}</span>
                  {!n.ativo && <span className="rounded-full bg-badge-red-bg px-2 py-0.5 text-[10.5px] font-semibold text-badge-red-text">Inactiva</span>}
                </div>
                <p className="mt-1 text-[13px] text-muted">{n.mensagem}</p>
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-subtle">
                  {n.global ? <><Globe className="size-3" /> Todos os utilizadores</> : <><User className="size-3" /> {n.utilizador_nome ?? `ID ${n.utilizador_id}`}</>}
                  {' · '}{new Date(n.created_at).toLocaleDateString('pt-PT')}
                  {n.criado_por_nome && ` · por ${n.criado_por_nome}`}
                </p>
              </div>

              {(podeEditar || podeEliminar) && (
                <div className="flex shrink-0 gap-2">
                  {podeEditar && (
                    <button onClick={() => setModalForm(n)} className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11.5px] font-medium text-text transition hover:bg-bg">
                      <Pencil className="size-3" />
                    </button>
                  )}
                  {podeEliminar && (
                    <button
                      onClick={() => handleEliminar(n.id)}
                      disabled={remover.isPending}
                      className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11.5px] transition disabled:opacity-50 ${
                        confirmarEliminar === n.id ? 'border-badge-red-text bg-badge-red-text text-white' : 'border-red-200 text-red-500 hover:bg-red-50'
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

      {!isLoading && data?.length === 0 && <p className="py-16 text-center text-sm text-subtle">Nenhuma notificação criada.</p>}

      {modalForm && <ModalNotificacaoForm notificacao={modalForm === 'novo' ? null : modalForm} onClose={() => setModalForm(null)} />}
    </div>
  )
}
