import { useState, type FormEvent } from 'react'
import { X, Loader2, FileUp, FileDown, Trash2 } from 'lucide-react'
import { useCatalogoFormacoes, useCriarItemCatalogo, useAtualizarItemCatalogo } from '@/hooks/useCatalogoFormacoes'
import { useMateriaisFormacao, useAdicionarMaterialFormacao, useRemoverMaterialFormacao } from '@/hooks/useMateriaisFormacao'
import { getApiErrorMessage } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Campo, Linha2, TextField, SelectField } from '@/components/crud/FormShell'
import { CATEGORIAS_FORMACAO, type ItemCatalogo, type ItemCatalogoFormPayload, type CategoriaFormacao } from '@/types/catalogoFormacao'
import { notificar } from '@/lib/notificar'
import { useConfirmar } from '@/components/ui/ConfirmProvider'

interface Props { item: ItemCatalogo | null; onClose: () => void }

function MateriaisFormacao({ catalogoId }: { catalogoId: number }) {
  const { data: materiais } = useMateriaisFormacao(catalogoId)
  const adicionar = useAdicionarMaterialFormacao()
  const remover = useRemoverMaterialFormacao()
  const confirmar = useConfirmar()
  const [titulo, setTitulo] = useState('')
  const [ficheiro, setFicheiro] = useState<File | null>(null)

  async function onAdicionar() {
    if (!ficheiro || !titulo.trim()) return
    try {
      await adicionar.mutateAsync({ catalogoId, titulo: titulo.trim(), ficheiro })
      setTitulo('')
      setFicheiro(null)
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível adicionar o material.'))
    }
  }

  async function onRemover(materialId: number) {
    const ok = await confirmar({ titulo: 'Remover material', mensagem: 'Tens a certeza que queres remover este material?', perigoso: true })
    if (!ok) return
    try {
      await remover.mutateAsync({ catalogoId, materialId })
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível remover o material.'))
    }
  }

  return (
    <div className="border-t border-border pt-4">
      <label className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-muted">
        <FileDown className="size-3.5" /> Materiais de apoio (downloads)
      </label>

      {materiais && materiais.length > 0 && (
        <ul className="mb-3 space-y-1.5">
          {materiais.map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-1.5 text-[12.5px]">
              <span className="truncate text-text">{m.titulo}</span>
              <button type="button" onClick={() => onRemover(m.id)} disabled={remover.isPending} className="shrink-0 text-subtle transition hover:text-red-500">
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1">
          <TextField placeholder="Título do material" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12.5px] font-medium text-text transition hover:bg-bg">
          {ficheiro ? ficheiro.name.slice(0, 16) : 'Escolher ficheiro'}
          <input type="file" accept=".pdf,.docx,.xlsx,.pptx,.zip" className="hidden" onChange={(e) => setFicheiro(e.target.files?.[0] ?? null)} />
        </label>
        <Button type="button" onClick={onAdicionar} disabled={!ficheiro || !titulo.trim() || adicionar.isPending} className="shrink-0">
          {adicionar.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <FileUp className="size-3.5" />}
          Adicionar
        </Button>
      </div>
    </div>
  )
}

function paraForm(i: ItemCatalogo | null): ItemCatalogoFormPayload {
  return {
    categoria: i?.categoria ?? 'formacao_inicial',
    nome: i?.nome ?? '',
    descricao: i?.descricao ?? '',
    carga_horaria: i?.carga_horaria ? String(i.carga_horaria) : '',
    publico_alvo: i?.publico_alvo ?? '',
    ativo: i ? !!i.ativo : true,
    minimo_participantes: i?.minimo_participantes ? String(i.minimo_participantes) : '',
    maximo_participantes: i?.maximo_participantes ? String(i.maximo_participantes) : '',
    pre_requisito_id: i?.pre_requisito_id ?? '',
  }
}

export function ModalCatalogoForm({ item, onClose }: Props) {
  const [form, setForm] = useState<ItemCatalogoFormPayload>(paraForm(item))
  const { data: todosItens } = useCatalogoFormacoes('')
  const opcoesPreRequisito = (todosItens ?? []).filter((i) => i.id !== item?.id)

  const criar = useCriarItemCatalogo()
  const atualizar = useAtualizarItemCatalogo()
  const aGuardar = criar.isPending || atualizar.isPending

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      if (item) await atualizar.mutateAsync({ id: item.id, payload: form })
      else await criar.mutateAsync(form)
      onClose()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível guardar.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">{item ? 'Editar Item' : 'Novo Item do Catálogo'}</h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">

          <Campo label="Categoria">
            <SelectField value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value as CategoriaFormacao }))}>
              {CATEGORIAS_FORMACAO.map((c) => <option key={c.valor} value={c.valor}>{c.label}</option>)}
            </SelectField>
          </Campo>

          <Campo label="Nome"><TextField required value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} /></Campo>

          <Campo label="Descrição">
            <textarea
              rows={2}
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              className="w-full resize-none rounded-xl border border-border px-3.5 py-2 text-[13px] outline-none focus:border-[#111827]"
            />
          </Campo>

          <Linha2>
            <Campo label="Carga horária (h)"><TextField type="number" min="0" value={form.carga_horaria} onChange={(e) => setForm((f) => ({ ...f, carga_horaria: e.target.value }))} /></Campo>
            <Campo label="Público-alvo"><TextField value={form.publico_alvo} onChange={(e) => setForm((f) => ({ ...f, publico_alvo: e.target.value }))} /></Campo>
          </Linha2>

          <Linha2>
            <Campo label="Mínimo de participantes"><TextField type="number" min="0" value={form.minimo_participantes} onChange={(e) => setForm((f) => ({ ...f, minimo_participantes: e.target.value }))} /></Campo>
            <Campo label="Máximo de participantes"><TextField type="number" min="0" value={form.maximo_participantes} onChange={(e) => setForm((f) => ({ ...f, maximo_participantes: e.target.value }))} /></Campo>
          </Linha2>

          <Campo label="Pré-requisito (opcional)">
            <SelectField
              value={form.pre_requisito_id === '' ? '' : String(form.pre_requisito_id)}
              onChange={(e) => setForm((f) => ({ ...f, pre_requisito_id: e.target.value === '' ? '' : Number(e.target.value) }))}
            >
              <option value="">Nenhum</option>
              {opcoesPreRequisito.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
            </SelectField>
          </Campo>

          {item && <MateriaisFormacao catalogoId={item.id} />}

          <div className="flex gap-3 pt-2">
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
