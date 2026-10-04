import { useState, type FormEvent } from 'react'
import { X, Loader2, Search, UserRound } from 'lucide-react'
import { useCadastrarFormador, useAtualizarFormador } from '@/hooks/useFormadores'
import { useUtilizadores } from '@/hooks/useUtilizadores'
import { getApiErrorMessage } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Campo, TextField } from '@/components/crud/FormShell'
import type { FormadorDetalhe, FormadorFormPayload } from '@/types/formador'
import { notificar } from '@/lib/notificar'

interface Props { formador: FormadorDetalhe | null; onClose: () => void }

export function ModalFormadorForm({ formador, onClose }: Props) {
  const [form, setForm] = useState<FormadorFormPayload>({
    especialidades: formador?.especialidades ?? '',
    certificacoes: formador?.certificacoes ?? '',
    biografia: formador?.biografia ?? '',
    ativo: formador ? !!formador.ativo : true,
  })
  const [pesquisa, setPesquisa] = useState('')
  const [utilizadorEscolhido, setUtilizadorEscolhido] = useState<{ id: number; nome: string } | null>(
    formador ? { id: formador.utilizador_id, nome: formador.nome } : null,
  )

  const { data: resultados } = useUtilizadores({ pesquisa, porPagina: 6 })
  const cadastrar = useCadastrarFormador()
  const atualizar = useAtualizarFormador()
  const aGuardar = cadastrar.isPending || atualizar.isPending

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!utilizadorEscolhido) { notificar.erro('Escolhe o utilizador a cadastrar como formador.'); return }
    try {
      if (formador) await atualizar.mutateAsync({ id: formador.id, payload: form })
      else await cadastrar.mutateAsync({ ...form, utilizador_id: utilizadorEscolhido.id })
      onClose()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível guardar.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">{formador ? 'Editar Formador' : 'Cadastrar Formador'}</h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">

          {!formador && (
            <Campo label="Utilizador">
              {utilizadorEscolhido ? (
                <div className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-[13px]">
                  <span className="flex items-center gap-1.5"><UserRound className="size-3.5 text-subtle" /> {utilizadorEscolhido.nome}</span>
                  <button type="button" onClick={() => setUtilizadorEscolhido(null)} className="text-[11px] text-subtle hover:text-text">Trocar</button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
                  <input
                    value={pesquisa}
                    onChange={(e) => setPesquisa(e.target.value)}
                    placeholder="Pesquisar por nome ou Nº SIGECA..."
                    className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]"
                  />
                  {pesquisa.length >= 2 && resultados && resultados.dados.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-white shadow-lg">
                      {resultados.dados.map((u) => (
                        <button type="button" key={u.id} onClick={() => { setUtilizadorEscolhido({ id: u.id, nome: u.nome }); setPesquisa('') }} className="flex w-full items-center justify-between px-3 py-2 text-left text-[12.5px] hover:bg-bg">
                          <span>{u.nome}</span>
                          <span className="font-mono text-[11px] text-subtle">{u.codigo_associado}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Campo>
          )}

          <Campo label="Especialidades"><TextField value={form.especialidades} onChange={(e) => setForm((f) => ({ ...f, especialidades: e.target.value }))} placeholder="Ex: Pioneirismo, Primeiros Socorros" /></Campo>
          <Campo label="Certificações"><TextField value={form.certificacoes} onChange={(e) => setForm((f) => ({ ...f, certificacoes: e.target.value }))} /></Campo>
          <Campo label="Biografia">
            <textarea
              rows={3}
              value={form.biografia}
              onChange={(e) => setForm((f) => ({ ...f, biografia: e.target.value }))}
              className="w-full resize-none rounded-xl border border-border px-3.5 py-2 text-[13px] outline-none focus:border-[#111827]"
            />
          </Campo>

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
