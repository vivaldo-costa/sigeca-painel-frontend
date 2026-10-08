import { useState } from 'react'
import { GraduationCap, Plus, Loader2, Search, Pencil, Trash2 } from 'lucide-react'
import { useFormadores, useRemoverFormador, useFormador } from '@/hooks/useFormadores'
import { usePermissao } from '@/hooks/usePermissao'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { ModalFormadorForm } from '@/components/formadores/ModalFormadorForm'
import type { FormadorPainel } from '@/types/formador'

export function FormadoresLista() {
  const [pesquisaRascunho, setPesquisaRascunho] = useState('')
  const [pesquisa, setPesquisa] = useState('')
  const { data, isLoading } = useFormadores(pesquisa)
  const remover = useRemoverFormador()
  const { criar: podeCriar, editar: podeEditar, apagar: podeEliminar } = usePermissao('Formadores')

  const [modalForm, setModalForm] = useState<'novo' | number | null>(null)
  const { data: formadorDetalhe } = useFormador(typeof modalForm === 'number' ? modalForm : null)
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
          <GraduationCap className="size-5 text-muted" /> Gestão de Formadores
        </h1>
        <div className="flex items-center gap-2">
          <ExportarBotoes
            tamanho="sm"
            nomeFicheiro="formadores"
            titulo="Gestão de Formadores"
            colunas={[
              { titulo: 'Nome', valor: (f: FormadorPainel) => f.nome },
              { titulo: 'Nº SIGECA', valor: (f) => f.codigo_associado },
              { titulo: 'Especialidades', valor: (f) => f.especialidades ?? '—' },
              { titulo: 'Cursos', valor: (f) => f.total_cursos },
              { titulo: 'Responsável de formação', valor: (f) => (f.responsavel_formacao_diocese ? f.diocese_nome ?? 'Sim' : '—') },
              { titulo: 'Estado', valor: (f) => (f.ativo ? 'Activo' : 'Inactivo') },
            ]}
            linhas={data ?? []}
          />
          {podeCriar && (
            <button onClick={() => setModalForm('novo')} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-black">
              <Plus className="size-3.5" /> Registar Formador
            </button>
          )}
        </div>
      </div>

      <Card className="mb-5 p-4">
        <form onSubmit={(e) => { e.preventDefault(); setPesquisa(pesquisaRascunho) }} className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
          <input
            value={pesquisaRascunho}
            onChange={(e) => setPesquisaRascunho(e.target.value)}
            placeholder="Pesquisar por nome ou especialidade..."
            className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]"
          />
        </form>
      </Card>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data?.map((f: FormadorPainel) => (
          <Card key={f.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-text">{f.nome}</h3>
                <p className="font-mono text-[11px] text-subtle">{f.codigo_associado}</p>
              </div>
              <div className="flex flex-wrap justify-end gap-1">
                {!!f.responsavel_formacao_diocese && (
                  <span className="rounded-full bg-badge-blue-bg px-2 py-0.5 text-[10px] font-semibold text-badge-blue-text">
                    Responsável de formação{f.diocese_nome ? ` — ${f.diocese_nome}` : ''}
                  </span>
                )}
                {!f.ativo && <span className="rounded-full bg-bg px-2 py-0.5 text-[10px] font-semibold text-subtle">Inactivo</span>}
              </div>
            </div>
            {f.especialidades && <p className="mt-2 text-[12.5px] text-muted">{f.especialidades}</p>}
            <p className="mt-1.5 text-[11.5px] text-subtle">{f.total_cursos} curso{f.total_cursos !== 1 && 's'}</p>

            {(podeEditar || podeEliminar) && (
              <div className="mt-3 flex gap-2 border-t border-border pt-3">
                {podeEditar && (
                  <button onClick={() => setModalForm(f.id)} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-[11.5px] font-medium text-text transition-colors hover:bg-bg">
                    <Pencil className="size-3" /> Editar
                  </button>
                )}
                {podeEliminar && (
                  <button
                    onClick={() => handleEliminar(f.id)}
                    className={`flex items-center justify-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11.5px] ${confirmarEliminar === f.id ? 'border-badge-red-text bg-badge-red-text text-white' : 'border-red-200 text-red-500 hover:bg-red-50'}`}
                  >
                    <Trash2 className="size-3" />
                  </button>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {!isLoading && data?.length === 0 && <p className="py-16 text-center text-sm text-subtle">Nenhum formador encontrado.</p>}

      {modalForm === 'novo' && <ModalFormadorForm formador={null} onClose={() => setModalForm(null)} />}
      {typeof modalForm === 'number' && formadorDetalhe && <ModalFormadorForm formador={formadorDetalhe} onClose={() => setModalForm(null)} />}
    </div>
  )
}
