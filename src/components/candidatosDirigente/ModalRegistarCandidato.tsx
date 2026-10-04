import { useState, type FormEvent } from 'react'
import { X, Loader2, Search, UserRound } from 'lucide-react'
import { useRegistarCandidato } from '@/hooks/useCandidatosDirigente'
import { useUtilizadores } from '@/hooks/useUtilizadores'
import { useCatalogoFormacoes } from '@/hooks/useCatalogoFormacoes'
import { getApiErrorMessage } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Campo, SelectField } from '@/components/crud/FormShell'
import { notificar } from '@/lib/notificar'

interface Props { onClose: () => void }

export function ModalRegistarCandidato({ onClose }: Props) {
  const [pesquisa, setPesquisa] = useState('')
  const [candidato, setCandidato] = useState<{ id: number; nome: string; agrupamento_id: number | null; diocese_id: number | null; vigararia_id: number | null; paroquia_id: number | null } | null>(null)
  const [formacaoId, setFormacaoId] = useState<number | ''>('')
  const [parecer, setParecer] = useState(false)

  const { data: resultados } = useUtilizadores({ pesquisa, porPagina: 6 })
  const { data: catalogo } = useCatalogoFormacoes('')
  const registar = useRegistarCandidato()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!candidato) { notificar.erro('Escolhe o candidato.'); return }
    if (!candidato.agrupamento_id || !candidato.diocese_id) { notificar.erro('Este utilizador não tem agrupamento/diocese associados — corrige a ficha dele primeiro.'); return }
    if (!formacaoId) { notificar.erro('Escolhe a formação pretendida.'); return }
    if (!parecer) { notificar.erro('Confirma o parecer da Direcção do Agrupamento e a aprovação prévia do Assistente/Pároco.'); return }

    try {
      await registar.mutateAsync({
        utilizador_id: candidato.id, agrupamento_id: candidato.agrupamento_id, diocese_id: candidato.diocese_id,
        vigararia_id: candidato.vigararia_id ?? undefined, paroquia_id: candidato.paroquia_id ?? undefined,
        formacao_pretendida_id: formacaoId, parecer_direccao_agrupamento: parecer,
      })
      onClose()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível registar o candidato.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">Registar Candidato a Dirigente</h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">

          <Campo label="Candidato">
            {candidato ? (
              <div className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-[13px]">
                <span className="flex items-center gap-1.5"><UserRound className="size-3.5 text-subtle" /> {candidato.nome}</span>
                <button type="button" onClick={() => setCandidato(null)} className="text-[11px] text-subtle hover:text-text">Trocar</button>
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
                        onClick={() => {
                          setCandidato({
                            id: u.id, nome: u.nome,
                            agrupamento_id: u.agrupamento_id ?? null, diocese_id: u.diocese_id ?? null,
                            vigararia_id: u.vigararia_id ?? null, paroquia_id: u.paroquia_id ?? null,
                          })
                          setPesquisa('')
                        }}
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

          <Campo label="Formação pretendida">
            <SelectField value={formacaoId} onChange={(e) => setFormacaoId(Number(e.target.value) || '')}>
              <option value="">-- Seleccionar --</option>
              {catalogo?.filter((c) => c.ativo).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </SelectField>
          </Campo>

          <label className="flex items-start gap-2.5 rounded-xl bg-bg px-3.5 py-3">
            <input type="checkbox" checked={parecer} onChange={(e) => setParecer(e.target.checked)} className="mt-0.5 size-4 shrink-0" />
            <span className="text-[12.5px] text-text">
              Confirmo que existe <strong>parecer favorável da Direcção do Agrupamento</strong> e <strong>aprovação prévia do Assistente/Pároco</strong>, conforme exigido antes do registo.
            </span>
          </label>

          <div className="flex gap-3 border-t border-border pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={registar.isPending} className="flex-1">
              {registar.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Registar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
