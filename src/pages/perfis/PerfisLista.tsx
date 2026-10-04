import { useState } from 'react'
import { ShieldCheck, Users, LockOpen, Pencil, Trash2, Plus, Loader2 } from 'lucide-react'
import { usePerfisAcesso, useRemoverPerfilAcesso } from '@/hooks/usePerfisAcesso'
import { useAuthStore } from '@/store/auth'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { ModalPerfilForm } from '@/components/perfis/ModalPerfilForm'
import { ModalPermissoes } from '@/components/perfis/ModalPermissoes'
import type { PerfilAcesso } from '@/types/perfis'

const CORES: Record<string, string> = {
  ADMIN: 'bg-badge-red-bg text-badge-red-text',
  TECNICO: 'bg-badge-violet-bg text-badge-violet-text',
  DIRIGENTE: 'bg-badge-blue-bg text-badge-blue-text',
  CONSULTOR: 'bg-badge-orange-bg text-badge-orange-text',
  ESCUTEIRO: 'bg-badge-green-bg text-badge-green-text',
}

export function PerfisLista() {
  const user = useAuthStore((s) => s.user)
  const ehAdmin = user?.perfil_nome === 'ADMIN'
  const { data: perfis, isLoading } = usePerfisAcesso()
  const remover = useRemoverPerfilAcesso()

  const [modalForm, setModalForm] = useState<'novo' | PerfilAcesso | null>(null)
  const [modalPermissoes, setModalPermissoes] = useState<PerfilAcesso | null>(null)
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
    <div className="mx-auto max-w-[1200px] px-6 py-7">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
            <ShieldCheck className="size-5 text-[#111827]" /> Gestão de Perfis
          </h1>
          <p className="mt-1 text-[13px] text-muted">Cria e gere os perfis de acesso ao sistema SIGECA.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportarBotoes
            tamanho="sm"
            nomeFicheiro="perfis-acesso"
            titulo="Gestão de Perfis"
            colunas={[
              { titulo: 'Nome', valor: (p: PerfilAcesso) => p.nome },
              { titulo: 'Tipo', valor: (p) => (p.protegido ? 'Sistema' : 'Personalizado') },
              { titulo: 'Descrição', valor: (p) => p.descricao || '—' },
              { titulo: 'Utilizadores', valor: (p) => p.total_utilizadores },
            ]}
            linhas={perfis ?? []}
          />
          {ehAdmin && (
            <button
              onClick={() => setModalForm('novo')}
              className="flex items-center gap-2 rounded-full bg-[#111827] px-5 py-2.5 text-[13px] font-medium text-white shadow transition hover:bg-black"
            >
              <Plus className="size-3.5" /> Novo Perfil
            </button>
          )}
        </div>
      </div>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {perfis?.map((p, i) => (
          <Card key={p.id} className="hover-lift flex animate-slide-up flex-col gap-4 p-5" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#111827]/10">
                  <ShieldCheck className="size-5 text-[#111827]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text">{p.nome}</h2>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${CORES[p.nome] ?? 'bg-bg text-muted'}`}>
                    {p.protegido ? 'Sistema' : 'Personalizado'}
                  </span>
                </div>
              </div>
              <span className="mt-1 text-xs text-subtle">#{p.id}</span>
            </div>

            <p className="min-h-[36px] text-sm leading-relaxed text-muted">
              {p.descricao || 'Sem descrição definida.'}
            </p>

            <div className="flex items-center gap-2 rounded-lg bg-bg px-3 py-2 text-sm text-text">
              <Users className="size-3.5 text-[#111827]" />
              <span>{p.total_utilizadores} utilizador{p.total_utilizadores !== 1 && 'es'} com este perfil</span>
            </div>

            <div className="flex gap-2 border-t border-border pt-3">
              <button
                onClick={() => setModalPermissoes(p)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#111827]/25 py-2 text-xs font-medium text-[#111827] transition hover:bg-[#111827]/5"
              >
                <LockOpen className="size-3.5" /> Permissões
              </button>
              {ehAdmin && !p.protegido && (
                <>
                  <button
                    onClick={() => setModalForm(p)}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-amber-200 px-3 py-2 text-xs text-amber-600 transition hover:bg-amber-50"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleEliminar(p.id)}
                    disabled={remover.isPending}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition disabled:opacity-50 ${
                      confirmarEliminar === p.id
                        ? 'border-badge-red-text bg-badge-red-text text-white'
                        : 'border-red-200 text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      {modalForm && (
        <ModalPerfilForm
          perfil={modalForm === 'novo' ? null : modalForm}
          onClose={() => setModalForm(null)}
        />
      )}

      {modalPermissoes && (
        <ModalPermissoes
          perfilId={modalPermissoes.id}
          perfilNome={modalPermissoes.nome}
          somenteLeitura={!ehAdmin}
          onClose={() => setModalPermissoes(null)}
        />
      )}
    </div>
  )
}
