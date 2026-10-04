import { useState, type FormEvent } from 'react'
import { X, Loader2, Search, UserRound } from 'lucide-react'
import { useEmitirCertificado } from '@/hooks/useCertificados'
import { useUtilizadores } from '@/hooks/useUtilizadores'
import { getApiErrorMessage } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Campo, TextField, SelectField } from '@/components/crud/FormShell'
import type { EmitirCertificadoPayload, TipoCertificado } from '@/types/certificado'
import { notificar } from '@/lib/notificar'

interface Props { onClose: () => void }

export function ModalEmitirCertificado({ onClose }: Props) {
  const [form, setForm] = useState<EmitirCertificadoPayload>({ tipo: 'declaracao', titulo: '', utilizador_id: '', validade: '' })
  const [pesquisa, setPesquisa] = useState('')
  const [nomeEscolhido, setNomeEscolhido] = useState('')

  const { data: resultados } = useUtilizadores({ pesquisa, porPagina: 6 })
  const emitir = useEmitirCertificado()

  function escolherUtilizador(id: number, nome: string) {
    setForm((f) => ({ ...f, utilizador_id: id }))
    setNomeEscolhido(nome)
    setPesquisa('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.utilizador_id) { notificar.erro('Escolhe o escuteiro para quem vais emitir o certificado.'); return }
    try {
      await emitir.mutateAsync(form)
      onClose()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível emitir o certificado.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">Emitir Certificado</h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">

          <Campo label="Escuteiro">
            {nomeEscolhido ? (
              <div className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-[13px]">
                <span className="flex items-center gap-1.5"><UserRound className="size-3.5 text-subtle" /> {nomeEscolhido}</span>
                <button type="button" onClick={() => { setForm((f) => ({ ...f, utilizador_id: '' })); setNomeEscolhido('') }} className="text-[11px] text-subtle hover:text-text">
                  Trocar
                </button>
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
                      <button
                        type="button"
                        key={u.id}
                        onClick={() => escolherUtilizador(u.id, u.nome)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-[12.5px] hover:bg-bg"
                      >
                        <span>{u.nome}</span>
                        <span className="font-mono text-[11px] text-subtle">{u.codigo_associado}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Campo>

          <Campo label="Tipo">
            <SelectField value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as TipoCertificado }))}>
              <option value="declaracao">Declaração</option>
              <option value="certificado">Certificado</option>
              <option value="diploma">Diploma</option>
            </SelectField>
          </Campo>

          <Campo label="Título / Descrição">
            <TextField
              required
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              placeholder="Ex: Declaração de Participação no Curso PIF 2026"
            />
          </Campo>

          <Campo label="Validade (opcional)">
            <TextField type="date" value={form.validade} onChange={(e) => setForm((f) => ({ ...f, validade: e.target.value }))} />
          </Campo>

          <div className="flex gap-3 border-t border-border pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={emitir.isPending} className="flex-1">
              {emitir.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Emitir
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
