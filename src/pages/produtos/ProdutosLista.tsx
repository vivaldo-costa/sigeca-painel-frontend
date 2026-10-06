import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Plus, Loader2, Search, Pencil, Trash2, ShoppingBag, Link2 } from 'lucide-react'
import { useProdutos, useCategorias, useRemoverProduto } from '@/hooks/useProdutosPainel'
import { usePermissao } from '@/hooks/usePermissao'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { ModalProdutoForm } from '@/components/produtos/ModalProdutoForm'
import { uploadUrl } from '@/lib/uploads'
import { copiarLinkProduto, linkExternoProduto } from '@/lib/linkProduto'
import type { FiltrosProdutos, ProdutoPainel } from '@/types/produto'

export function ProdutosLista() {
  const [filtros, setFiltros] = useState<FiltrosProdutos>({})
  const [pesquisaRascunho, setPesquisaRascunho] = useState('')
  const [modalForm, setModalForm] = useState<'novo' | ProdutoPainel | null>(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState<number | null>(null)

  const { data, isLoading } = useProdutos(filtros)
  const categorias = useCategorias()
  const remover = useRemoverProduto()
  const { criar: podeCriar, editar: podeEditar, apagar: podeEliminar } = usePermissao('Produtos')

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
          <Package className="size-5 text-muted" /> Produtos
        </h1>
        <div className="flex flex-wrap gap-2">
          <ExportarBotoes
            tamanho="sm"
            nomeFicheiro="produtos"
            titulo="Produtos"
            colunas={[
              { titulo: 'Nome', valor: (p: ProdutoPainel) => p.nome },
              { titulo: 'Categoria', valor: (p) => p.categoria_nome ?? '—' },
              { titulo: 'Preço (Kz)', valor: (p) => Number(p.preco) },
              { titulo: 'Stock', valor: (p) => p.stock },
              { titulo: 'Estado', valor: (p) => (p.ativo ? 'Activo' : 'Inactivo') },
            ]}
            linhas={data ?? []}
          />
          <Link
            to="/produtos/encomendas"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3.5 py-2 text-[13px] font-semibold text-text transition hover:bg-bg"
          >
            <ShoppingBag className="size-3.5" /> Encomendas
          </Link>
          {podeCriar && (
            <button
              onClick={() => setModalForm('novo')}
              className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-black"
            >
              <Plus className="size-3.5" /> Novo Produto
            </button>
          )}
        </div>
      </div>

      <Card className="mb-5 flex flex-wrap items-center gap-3 p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); setFiltros((f) => ({ ...f, pesquisa: pesquisaRascunho })) }}
          className="relative min-w-[200px] flex-1"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
          <input
            value={pesquisaRascunho}
            onChange={(e) => setPesquisaRascunho(e.target.value)}
            placeholder="Nome do produto..."
            className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]"
          />
        </form>
        <select
          value={filtros.categoriaId ?? ''}
          onChange={(e) => setFiltros((f) => ({ ...f, categoriaId: Number(e.target.value) || undefined }))}
          className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]"
        >
          <option value="">Todas as categorias</option>
          {categorias.data?.map((c) => <option key={c.id} value={c.id}>{c.nome} ({c.total_produtos})</option>)}
        </select>
        <select
          value={filtros.ativo ?? ''}
          onChange={(e) => setFiltros((f) => ({ ...f, ativo: e.target.value as FiltrosProdutos['ativo'] }))}
          className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]"
        >
          <option value="">Todos os estados</option>
          <option value="1">Activo</option>
          <option value="0">Inactivo</option>
        </select>
      </Card>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      {/* Grelha de colunas — 1 coluna em telemóvel, cresce até 5 em ecrãs largos. Nunca uma tabela. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {data?.map((p, i) => (
          <Card key={p.id} className="hover-lift animate-slide-up overflow-hidden" style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}>
            <div className="relative aspect-square bg-bg">
              {p.imagem ? (
                <img src={uploadUrl('produtos', p.imagem)!} className="size-full bg-white object-contain p-1" alt={p.nome} loading="lazy" />
              ) : (
                <div className="grid size-full place-items-center text-subtle"><Package className="size-8" /></div>
              )}
              {p.etiqueta && (
                <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">{p.etiqueta}</span>
              )}
              {!p.ativo && (
                <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">Inactivo</span>
              )}
            </div>
            <div className="p-3 sm:p-3.5">
              <p className="truncate text-[10px] font-medium uppercase tracking-wide text-subtle sm:text-[10.5px]">{p.categoria_nome ?? 'Sem categoria'}</p>
              <h3 className="mt-0.5 truncate text-[12.5px] font-semibold text-text sm:text-[13.5px]">{p.nome}</h3>
              <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
                {p.preco_antigo && <span className="text-[10.5px] text-subtle line-through">{Number(p.preco_antigo).toLocaleString('pt-PT')}</span>}
                <span className="text-[13px] font-bold text-text sm:text-[14px]">{Number(p.preco).toLocaleString('pt-PT')} Kz</span>
              </div>
              <p className="mt-0.5 text-[10.5px] text-subtle sm:text-[11px]">Stock: {p.stock}</p>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => copiarLinkProduto(p.id)}
                  title={linkExternoProduto(p.id)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-[11.5px] font-medium text-text transition hover:bg-bg"
                >
                  <Link2 className="size-3" /> <span className="hidden sm:inline">Copiar link</span>
                </button>
              </div>

              {(podeEditar || podeEliminar) && (
                <div className="mt-2 flex gap-2">
                  {podeEditar && (
                    <button onClick={() => setModalForm(p)} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-[11.5px] font-medium text-text transition hover:bg-bg">
                      <Pencil className="size-3" /> <span className="hidden sm:inline">Editar</span>
                    </button>
                  )}
                  {podeEliminar && (
                    <button
                      onClick={() => handleEliminar(p.id)}
                      disabled={remover.isPending}
                      className={`flex items-center justify-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11.5px] transition disabled:opacity-50 ${
                        confirmarEliminar === p.id ? 'border-badge-red-text bg-badge-red-text text-white' : 'border-red-200 text-red-500 hover:bg-red-50'
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

      {!isLoading && data?.length === 0 && (
        <p className="py-16 text-center text-sm text-subtle">Nenhum produto encontrado.</p>
      )}

      {modalForm && (
        <ModalProdutoForm produto={modalForm === 'novo' ? null : modalForm} onClose={() => setModalForm(null)} />
      )}
    </div>
  )
}
