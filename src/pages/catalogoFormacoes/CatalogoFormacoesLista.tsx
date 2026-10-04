import { useState } from 'react'
import { BookOpen, Plus, Loader2, Pencil, Trash2 } from 'lucide-react'
import { useCatalogoFormacoes, useRemoverItemCatalogo } from '@/hooks/useCatalogoFormacoes'
import { usePermissao } from '@/hooks/usePermissao'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { ModalCatalogoForm } from '@/components/catalogoFormacoes/ModalCatalogoForm'
import { CATEGORIAS_FORMACAO, type ItemCatalogo } from '@/types/catalogoFormacao'

export function CatalogoFormacoesLista() {
  const [categoria, setCategoria] = useState('')
  const { data, isLoading } = useCatalogoFormacoes(categoria)
  const remover = useRemoverItemCatalogo()
  const { criar: podeCriar, editar: podeEditar, apagar: podeEliminar } = usePermissao('CatalogoFormacoes')

  const [modalForm, setModalForm] = useState<'novo' | ItemCatalogo | null>(null)
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
          <BookOpen className="size-5 text-muted" /> Catálogo Nacional de Formação
        </h1>
        <div className="flex items-center gap-2">
          <ExportarBotoes
            tamanho="sm"
            nomeFicheiro="catalogo-formacoes"
            titulo="Catálogo Nacional de Formação"
            colunas={[
              { titulo: 'Nome', valor: (item: ItemCatalogo) => item.nome },
              { titulo: 'Categoria', valor: (item) => CATEGORIAS_FORMACAO.find((c) => c.valor === item.categoria)?.label ?? item.categoria },
              { titulo: 'Carga Horária', valor: (item) => item.carga_horaria ?? '—' },
              { titulo: 'Cursos', valor: (item) => item.total_cursos },
              { titulo: 'Estado', valor: (item) => (item.ativo ? 'Activo' : 'Inactivo') },
            ]}
            linhas={data ?? []}
          />
          {podeCriar && (
            <button onClick={() => setModalForm('novo')} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-black">
              <Plus className="size-3.5" /> Novo Item
            </button>
          )}
        </div>
      </div>

      <Card className="mb-5 flex flex-wrap gap-2 p-4">
        <button onClick={() => setCategoria('')} className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold ${!categoria ? 'bg-[#111827] text-white' : 'bg-bg text-muted hover:bg-border'}`}>Todas</button>
        {CATEGORIAS_FORMACAO.map((c) => (
          <button key={c.valor} onClick={() => setCategoria(c.valor)} className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold ${categoria === c.valor ? 'bg-[#111827] text-white' : 'bg-bg text-muted hover:bg-border'}`}>
            {c.label}
          </button>
        ))}
      </Card>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="mb-1 flex items-start justify-between gap-2">
              <span className="rounded-full bg-badge-blue-bg px-2 py-0.5 text-[10.5px] font-semibold text-badge-blue-text">
                {CATEGORIAS_FORMACAO.find((c) => c.valor === item.categoria)?.label}
              </span>
              {!item.ativo && <span className="rounded-full bg-bg px-2 py-0.5 text-[10px] font-semibold text-subtle">Inactivo</span>}
            </div>
            <h3 className="font-semibold text-text">{item.nome}</h3>
            {item.descricao && <p className="mt-0.5 line-clamp-2 text-[12px] text-subtle">{item.descricao}</p>}
            <p className="mt-2 text-[11.5px] text-muted">
              {item.carga_horaria ? `${item.carga_horaria}h` : 'Sem carga horária definida'} · {item.total_cursos} curso{item.total_cursos !== 1 && 's'}
            </p>
            {(item.minimo_participantes || item.maximo_participantes) && (
              <p className="text-[11.5px] text-subtle">
                Turmas: {item.minimo_participantes ?? '—'} a {item.maximo_participantes ?? '—'} participantes
              </p>
            )}
            {item.pre_requisito_nome && (
              <p className="mt-1 text-[11.5px] font-medium text-amber-600">Pré-requisito: {item.pre_requisito_nome}</p>
            )}

            {(podeEditar || podeEliminar) && (
              <div className="mt-3 flex gap-2 border-t border-border pt-3">
                {podeEditar && (
                  <button onClick={() => setModalForm(item)} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-[11.5px] font-medium text-text transition-colors hover:bg-bg">
                    <Pencil className="size-3" /> Editar
                  </button>
                )}
                {podeEliminar && (
                  <button
                    onClick={() => handleEliminar(item.id)}
                    className={`flex items-center justify-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11.5px] ${confirmarEliminar === item.id ? 'border-badge-red-text bg-badge-red-text text-white' : 'border-red-200 text-red-500 hover:bg-red-50'}`}
                  >
                    <Trash2 className="size-3" />
                  </button>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {!isLoading && data?.length === 0 && <p className="py-16 text-center text-sm text-subtle">Nenhum item encontrado.</p>}

      {modalForm && <ModalCatalogoForm item={modalForm === 'novo' ? null : modalForm} onClose={() => setModalForm(null)} />}
    </div>
  )
}
