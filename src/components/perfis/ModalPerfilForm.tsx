import { useState, type FormEvent } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useCriarPerfil, useAtualizarPerfilAcesso } from '@/hooks/usePerfisAcesso'
import { getApiErrorMessage } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { AMBITO_LABEL, type AmbitoPerfil, type PerfilAcesso } from '@/types/perfis'
import { notificar } from '@/lib/notificar'

interface Props {
  perfil: PerfilAcesso | null // null = criar
  onClose: () => void
}

export function ModalPerfilForm({ perfil, onClose }: Props) {
  const criar = useCriarPerfil()
  const atualizar = useAtualizarPerfilAcesso()
  const [nome, setNome] = useState(perfil?.nome ?? '')
  const [descricao, setDescricao] = useState(perfil?.descricao ?? '')
  const [ambito, setAmbito] = useState<AmbitoPerfil>(perfil?.ambito ?? 'agrupamento')
  const sistema = !!perfil?.protegido

  const aGuardar = criar.isPending || atualizar.isPending

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      if (perfil) {
        await atualizar.mutateAsync({ id: perfil.id, payload: { nome, descricao, ambito } })
      } else {
        await criar.mutateAsync({ nome, descricao, ambito })
      }
      onClose()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível guardar o perfil.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">{perfil ? 'Editar Perfil' : 'Novo Perfil'}</h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">

          <div>
            <label className="mb-1 block text-sm font-medium text-muted">
              Nome do Perfil <span className="text-badge-red-text">*</span>
            </label>
            <input
              type="text"
              required
              disabled={sistema}
              maxLength={50}
              value={nome}
              onChange={(e) => setNome(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
              placeholder="Ex.: GESTOR"
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm uppercase outline-none focus:ring-2 focus:ring-[#111827]/30"
            />
            <p className="mt-1 text-xs text-subtle">{sistema ? 'Perfil de sistema — só a visibilidade pode ser alterada.' : 'Só letras maiúsculas e _ (ex.: SECRETARIO_DIOCESANO).'}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-muted">Visibilidade dos dados</label>
            <select value={ambito} onChange={(e) => setAmbito(e.target.value as AmbitoPerfil)}
              className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#111827]/30">
              {(Object.keys(AMBITO_LABEL) as AmbitoPerfil[]).map((a) => <option key={a} value={a}>{AMBITO_LABEL[a]}</option>)}
            </select>
            <p className="mt-1 text-xs text-subtle">
              Quem tem este perfil só vê escuteiros, transferências e restantes dados da sua {ambito === 'global' ? 'organização inteira' : AMBITO_LABEL[ambito].toLowerCase()} (a da sua própria ficha).
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-muted">Descrição</label>
            <textarea
              rows={3}
              disabled={sistema}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreve brevemente o propósito deste perfil..."
              className="w-full resize-none rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#111827]/30"
            />
          </div>

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
