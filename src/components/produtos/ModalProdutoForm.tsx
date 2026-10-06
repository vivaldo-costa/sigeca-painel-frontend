import { copiarLinkProduto } from '@/lib/linkProduto'
import { useState, type FormEvent } from 'react'
import { X, Loader2, Plus, Trash2, ImagePlus, Images } from 'lucide-react'
import {
  useCriarProduto,
  useAtualizarProduto,
  useCategorias,
  useProduto,
  useAdicionarImagensProduto,
  useRemoverImagemProduto,
} from '@/hooks/useProdutosPainel'
import { getApiErrorMessage } from '@/lib/api'
import { uploadUrl } from '@/lib/uploads'
import { Button } from '@/components/ui/Button'
import { Campo, Linha2, TextField, SelectField } from '@/components/crud/FormShell'
import type { ProdutoPainel, ProdutoFormPayload, VariacaoProduto } from '@/types/produto'
import { notificar } from '@/lib/notificar'
import { useConfirmar } from '@/components/ui/ConfirmProvider'

const MAX_FOTOS = 8

interface Props {
  produto: ProdutoPainel | null
  onClose: () => void
}

function paraForm(p: ProdutoPainel | null): ProdutoFormPayload {
  return {
    nome: p?.nome ?? '',
    descricao: p?.descricao ?? '',
    descricao_curta: p?.descricao_curta ?? '',
    preco: p?.preco ?? '',
    preco_antigo: p?.preco_antigo ?? '',
    stock: p?.stock !== undefined ? String(p.stock) : '',
    ativo: p ? !!p.ativo : true,
    etiqueta: p?.etiqueta ?? '',
    categoria_id: p?.categoria_id ?? '',
    variacoes: p?.variacoes?.map((v) => ({ tamanho: v.tamanho, cor: v.cor, stock: v.stock })) ?? [],
  }
}

function GaleriaProduto({ produtoId }: { produtoId: number }) {
  const { data: produto } = useProduto(produtoId)
  const adicionar = useAdicionarImagensProduto()
  const remover = useRemoverImagemProduto()
  const confirmar = useConfirmar()

  const imagens = produto?.imagens ?? []
  const totalFotos = imagens.length + (produto?.imagem ? 1 : 0)
  const atingiuLimite = totalFotos >= MAX_FOTOS

  async function onFicheirosChange(e: React.ChangeEvent<HTMLInputElement>) {
    const ficheiros = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (ficheiros.length === 0) return
    try {
      await adicionar.mutateAsync({ id: produtoId, ficheiros })
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível adicionar as fotos.'))
    }
  }

  async function onRemover(imagemId: number) {
    const ok = await confirmar({
      titulo: 'Remover foto',
      mensagem: 'Tens a certeza que queres remover esta foto da galeria?',
      perigoso: true,
    })
    if (!ok) return
    try {
      await remover.mutateAsync({ id: produtoId, imagemId })
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível remover a foto.'))
    }
  }

  return (
    <div className="border-t border-border pt-4">
      <div className="mb-2 flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-[13px] font-medium text-muted">
          <Images className="size-3.5" /> Galeria de fotos
        </label>
        <span className="text-[11.5px] text-subtle">{totalFotos}/{MAX_FOTOS} fotos</span>
      </div>

      {imagens.length > 0 && (
        <div className="mb-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {imagens.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-bg">
              <img src={uploadUrl('produtos', img.imagem)!} className="size-full object-cover" alt="" />
              <button
                type="button"
                onClick={() => onRemover(img.id)}
                disabled={remover.isPending}
                className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 disabled:opacity-50"
                aria-label="Remover foto"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {atingiuLimite ? (
        <p className="text-[12px] text-subtle">Limite de {MAX_FOTOS} fotos atingido (capa + galeria).</p>
      ) : (
        <label className="flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12.5px] font-medium text-text transition hover:bg-bg">
          {adicionar.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
          {adicionar.isPending ? 'A enviar...' : 'Adicionar fotos'}
          <input type="file" accept="image/*" multiple className="hidden" disabled={adicionar.isPending} onChange={onFicheirosChange} />
        </label>
      )}
    </div>
  )
}

export function ModalProdutoForm({ produto, onClose }: Props) {
  const [form, setForm] = useState<ProdutoFormPayload>(paraForm(produto))
  const [imagem, setImagem] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const categorias = useCategorias()
  const criar = useCriarProduto()
  const atualizar = useAtualizarProduto()
  const aGuardar = criar.isPending || atualizar.isPending

  function onImagemChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImagem(file)
    setPreview(URL.createObjectURL(file))
  }

  function adicionarVariacao() {
    setForm((f) => ({ ...f, variacoes: [...f.variacoes, { tamanho: '', cor: '', stock: 0 }] }))
  }

  function alterarVariacao(i: number, campo: keyof VariacaoProduto, valor: string) {
    setForm((f) => {
      const variacoes = [...f.variacoes]
      variacoes[i] = { ...variacoes[i], [campo]: campo === 'stock' ? Number(valor) || 0 : valor }
      return { ...f, variacoes }
    })
  }

  function removerVariacao(i: number) {
    setForm((f) => ({ ...f, variacoes: f.variacoes.filter((_, idx) => idx !== i) }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      if (produto) {
        await atualizar.mutateAsync({ id: produto.id, payload: form, imagem })
      } else {
        const resposta = await criar.mutateAsync({ payload: form, imagem })
        const novoId = (resposta as { dados?: { id?: number } })?.dados?.id
        // Gera logo o link externo do produto (para as redes sociais) e copia-o.
        if (novoId) await copiarLinkProduto(novoId)
      }
      onClose()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível guardar o produto.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">{produto ? 'Editar Produto' : 'Novo Produto'}</h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">

          <div className="flex items-center gap-4">
            <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-bg">
              {preview || produto?.imagem ? (
                <img src={preview ?? uploadUrl('produtos', produto!.imagem)!} className="size-full object-cover" alt="" />
              ) : (
                <ImagePlus className="size-6 text-subtle" />
              )}
            </div>
            <label className="cursor-pointer rounded-lg border border-border px-3 py-2 text-[12.5px] font-medium text-text transition hover:bg-bg">
              Escolher imagem
              <input type="file" accept="image/*" className="hidden" onChange={onImagemChange} />
            </label>
          </div>

          <Campo label="Nome"><TextField required value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} /></Campo>
          <Campo label="Descrição curta"><TextField value={form.descricao_curta} onChange={(e) => setForm((f) => ({ ...f, descricao_curta: e.target.value }))} /></Campo>

          <Linha2>
            <Campo label="Preço (Kz)"><TextField type="number" step="0.01" required value={form.preco} onChange={(e) => setForm((f) => ({ ...f, preco: e.target.value }))} /></Campo>
            <Campo label="Preço antigo (opcional)"><TextField type="number" step="0.01" value={form.preco_antigo} onChange={(e) => setForm((f) => ({ ...f, preco_antigo: e.target.value }))} /></Campo>
          </Linha2>
          <Linha2>
            <Campo label="Stock"><TextField type="number" required value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} /></Campo>
            <Campo label="Categoria">
              <SelectField value={form.categoria_id} onChange={(e) => setForm((f) => ({ ...f, categoria_id: Number(e.target.value) || '' }))}>
                <option value="">-- Sem categoria --</option>
                {categorias.data?.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </SelectField>
            </Campo>
          </Linha2>
          <Linha2>
            <Campo label="Etiqueta (ex: Novo, Promoção)"><TextField value={form.etiqueta} onChange={(e) => setForm((f) => ({ ...f, etiqueta: e.target.value }))} /></Campo>
            <Campo label="Estado">
              <SelectField value={form.ativo ? '1' : '0'} onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.value === '1' }))}>
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </SelectField>
            </Campo>
          </Linha2>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[13px] font-medium text-muted">Variações (tamanho/cor)</label>
              <button type="button" onClick={adicionarVariacao} className="flex items-center gap-1 text-[12px] font-medium text-[#111827] hover:underline">
                <Plus className="size-3" /> Adicionar
              </button>
            </div>
            {form.variacoes.length === 0 ? (
              <p className="text-[12.5px] text-subtle">Sem variações — o produto usa apenas o stock geral.</p>
            ) : (
              <div className="space-y-2">
                {form.variacoes.map((v, i) => (
                  <div key={i} className="flex gap-2">
                    <input placeholder="Tamanho" value={v.tamanho} onChange={(e) => alterarVariacao(i, 'tamanho', e.target.value)}
                      className="w-1/3 rounded-lg border border-border px-2.5 py-1.5 text-[12.5px]" />
                    <input placeholder="Cor" value={v.cor} onChange={(e) => alterarVariacao(i, 'cor', e.target.value)}
                      className="w-1/3 rounded-lg border border-border px-2.5 py-1.5 text-[12.5px]" />
                    <input type="number" placeholder="Stock" value={v.stock} onChange={(e) => alterarVariacao(i, 'stock', e.target.value)}
                      className="w-1/4 rounded-lg border border-border px-2.5 py-1.5 text-[12.5px]" />
                    <button type="button" onClick={() => removerVariacao(i)} className="text-badge-red-text hover:opacity-70">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {produto ? (
            <GaleriaProduto produtoId={produto.id} />
          ) : (
            <div className="border-t border-border pt-4">
              <label className="flex items-center gap-1.5 text-[13px] font-medium text-muted">
                <Images className="size-3.5" /> Galeria de fotos
              </label>
              <p className="mt-1 text-[12px] text-subtle">Guarda o produto primeiro para poderes acrescentar mais fotos.</p>
            </div>
          )}

          <div className="flex gap-3 border-t border-border pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={aGuardar} className="flex-1">
              {aGuardar ? <Loader2 className="size-4 animate-spin" /> : null}
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
