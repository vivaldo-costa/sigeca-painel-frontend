import { useState, type FormEvent } from 'react'
import { X, Loader2, ImagePlus, Images } from 'lucide-react'
import { getApiErrorMessage } from '@/lib/api'
import { uploadUrl } from '@/lib/uploads'
import { CampoAbrangencia } from '@/components/atividades/CampoAbrangencia'
import { CampoCoordenadasBancarias } from '@/components/atividades/CampoCoordenadasBancarias'
import { Button } from '@/components/ui/Button'
import { Campo, Linha2, TextField, SelectField } from '@/components/crud/FormShell'
import type { criarHooksAtividade } from '@/hooks/criarHooksAtividade'
import type { AtividadePainel, AtividadeFormPayload } from '@/types/atividade'
import { notificar } from '@/lib/notificar'
import { useGaleriaAtividade, useAdicionarFotosGaleria, useRemoverFotoGaleria } from '@/hooks/useEventoGaleria'
import { useConfirmar } from '@/components/ui/ConfirmProvider'

const MAX_FOTOS_GALERIA = 40

function GaleriaAtividade({ atividadeId }: { atividadeId: number }) {
  const { data: fotos } = useGaleriaAtividade(atividadeId)
  const adicionar = useAdicionarFotosGaleria()
  const remover = useRemoverFotoGaleria()
  const confirmar = useConfirmar()

  const total = fotos?.length ?? 0
  const atingiuLimite = total >= MAX_FOTOS_GALERIA

  async function onFicheirosChange(e: React.ChangeEvent<HTMLInputElement>) {
    const ficheiros = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (ficheiros.length === 0) return
    try {
      await adicionar.mutateAsync({ id: atividadeId, ficheiros })
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
      await remover.mutateAsync({ id: atividadeId, imagemId })
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível remover a foto.'))
    }
  }

  return (
    <div className="border-t border-border pt-4">
      <div className="mb-2 flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-[13px] font-medium text-muted">
          <Images className="size-3.5" /> Galeria de fotos (pós-evento)
        </label>
        <span className="text-[11.5px] text-subtle">{total}/{MAX_FOTOS_GALERIA} fotos</span>
      </div>

      {total > 0 && (
        <div className="mb-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {fotos!.map((foto) => (
            <div key={foto.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-bg">
              <img src={uploadUrl('eventos-galeria', foto.imagem)!} className="size-full object-cover" alt="" />
              <button
                type="button"
                onClick={() => onRemover(foto.id)}
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
        <p className="text-[12px] text-subtle">Limite de {MAX_FOTOS_GALERIA} fotos atingido.</p>
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

interface Props {
  hooks: ReturnType<typeof criarHooksAtividade>
  atividade: AtividadePainel | null
  tituloModulo: string
  onClose: () => void
}

function paraForm(a: AtividadePainel | null): AtividadeFormPayload {
  return {
    titulo: a?.titulo ?? '',
    descricao: a?.descricao ?? '',
    data_inicio: a?.data_inicio ? a.data_inicio.slice(0, 10) : '',
    data_fim: a?.data_fim ? a.data_fim.slice(0, 10) : '',
    tipo_acesso: a?.tipo_acesso ?? 'Grátis',
    valor: a?.valor ?? '0',
    num_prestacoes: a?.num_prestacoes ? String(a.num_prestacoes) : '1',
    idade_minima: a?.idade_minima !== null && a?.idade_minima !== undefined ? String(a.idade_minima) : '',
    idade_maxima: a?.idade_maxima !== null && a?.idade_maxima !== undefined ? String(a.idade_maxima) : '',
    vagas: a?.vagas !== null && a?.vagas !== undefined ? String(a.vagas) : '',
    local: a?.local ?? '',
    ativo: a ? !!a.ativo : true,
    diocese_id: a?.diocese_id ?? '',
    seccao_id: a?.seccao_id ?? '',
    abrangencia: a?.abrangencia ?? 'nacional',
    dioceses_ids: a?.dioceses_ids ?? [],
    banco: a?.banco ?? '',
    iban: a?.iban ?? '',
    titular_conta: a?.titular_conta ?? '',
  }
}

export function ModalAtividadeForm({ hooks, atividade, tituloModulo, onClose }: Props) {
  const subpastaImagem = tituloModulo === 'Formações' ? 'formacoes' : 'eventos'
  const [form, setForm] = useState<AtividadeFormPayload>(paraForm(atividade))
  const [imagem, setImagem] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const criar = hooks.useCriar()
  const atualizar = hooks.useAtualizar()
  const aGuardar = criar.isPending || atualizar.isPending

  function onImagemChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImagem(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      if (atividade) {
        await atualizar.mutateAsync({ id: atividade.id, payload: form, imagem })
      } else {
        await criar.mutateAsync({ payload: form, imagem })
      }
      onClose()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível guardar.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">{atividade ? `Editar ${tituloModulo.replace(/s$/, '')}` : `Nova ${tituloModulo.replace(/s$/, '')}`}</h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">

          <div className="flex items-center gap-4">
            <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-bg">
              {preview || atividade?.imagem ? (
                <img src={preview ?? uploadUrl(subpastaImagem, atividade!.imagem)!} className="size-full object-cover" alt="" />
              ) : (
                <ImagePlus className="size-6 text-subtle" />
              )}
            </div>
            <label className="cursor-pointer rounded-lg border border-border px-3 py-2 text-[12.5px] font-medium text-text transition hover:bg-bg">
              Escolher imagem
              <input type="file" accept="image/*" className="hidden" onChange={onImagemChange} />
            </label>
          </div>

          <Campo label="Título"><TextField required value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} /></Campo>
          <Campo label="Descrição">
            <textarea
              rows={3}
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              className="w-full resize-none rounded-xl border border-border px-3.5 py-2 text-[13px] outline-none focus:border-[#111827]"
            />
          </Campo>

          <Linha2>
            <Campo label="Data de início"><TextField type="date" required value={form.data_inicio} onChange={(e) => setForm((f) => ({ ...f, data_inicio: e.target.value }))} /></Campo>
            <Campo label="Data de fim"><TextField type="date" value={form.data_fim} onChange={(e) => setForm((f) => ({ ...f, data_fim: e.target.value }))} /></Campo>
          </Linha2>
          <CampoAbrangencia abrangencia={form.abrangencia} diocesesIds={form.dioceses_ids}
            onChange={(v) => setForm((f) => ({ ...f, ...v }))} />

          <Campo label="Local"><TextField value={form.local} onChange={(e) => setForm((f) => ({ ...f, local: e.target.value }))} placeholder="Ex.: Luanda" /></Campo>

          <Linha2>
            <Campo label="Acesso">
              <SelectField value={form.tipo_acesso} onChange={(e) => setForm((f) => ({ ...f, tipo_acesso: e.target.value as AtividadeFormPayload['tipo_acesso'] }))}>
                <option value="Grátis">Grátis</option>
                <option value="Pago">Pago</option>
              </SelectField>
            </Campo>
            {form.tipo_acesso === 'Pago' && (
              <Campo label="Valor (Kz)"><TextField type="number" step="0.01" value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))} /></Campo>
            )}
          </Linha2>
          {form.tipo_acesso === 'Pago' && (
            <Campo label="Nº de prestações permitidas"><TextField type="number" min="1" value={form.num_prestacoes} onChange={(e) => setForm((f) => ({ ...f, num_prestacoes: e.target.value }))} /></Campo>
          )}
          {form.tipo_acesso === 'Pago' && (
            <CampoCoordenadasBancarias valor={form} onChange={(v) => setForm((f) => ({ ...f, ...v }))} />
          )}

          <Linha2>
            <Campo label="Idade mínima"><TextField type="number" value={form.idade_minima} onChange={(e) => setForm((f) => ({ ...f, idade_minima: e.target.value }))} /></Campo>
            <Campo label="Idade máxima"><TextField type="number" value={form.idade_maxima} onChange={(e) => setForm((f) => ({ ...f, idade_maxima: e.target.value }))} /></Campo>
          </Linha2>
          <Linha2>
            <Campo label="Vagas"><TextField type="number" value={form.vagas} onChange={(e) => setForm((f) => ({ ...f, vagas: e.target.value }))} placeholder="Sem limite se vazio" /></Campo>
            <Campo label="Estado">
              <SelectField value={form.ativo ? '1' : '0'} onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.value === '1' }))}>
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </SelectField>
            </Campo>
          </Linha2>

          {atividade && <GaleriaAtividade atividadeId={atividade.id} />}

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
