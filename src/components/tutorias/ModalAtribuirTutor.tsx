import { useState, type FormEvent } from 'react'
import { X, Loader2, Search } from 'lucide-react'
import { useAtribuirTutor } from '@/hooks/useTutorias'
import { useCandidatosDirigente } from '@/hooks/useCandidatosDirigente'
import { useOpcoesFiltro } from '@/hooks/useDashboardPainel'
import { useUtilizadores } from '@/hooks/useUtilizadores'
import { getApiErrorMessage } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Campo, SelectField, TextField } from '@/components/crud/FormShell'
import { notificar } from '@/lib/notificar'

interface Props { onClose: () => void }

export function ModalAtribuirTutor({ onClose }: Props) {
  const [dioceseId, setDioceseId] = useState('')
  const { data: dioceses } = useOpcoesFiltro('dioceses')
  const { data: candidatos } = useCandidatosDirigente(dioceseId ? { dioceseId: Number(dioceseId), estado: 'formacao_concluida_aguardar_tutoria' } : { dioceseId: -1 })

  const [candidatoId, setCandidatoId] = useState('')
  const [pesquisaTutor, setPesquisaTutor] = useState('')
  const [tutor, setTutor] = useState<{ id: number; nome: string } | null>(null)
  const { data: resultadosTutor } = useUtilizadores({ pesquisa: pesquisaTutor, porPagina: 6 })
  const [dataInicio, setDataInicio] = useState('')

  const atribuir = useAtribuirTutor()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!candidatoId || !tutor || !dataInicio) { notificar.erro('Preenche todos os campos.'); return }
    try {
      await atribuir.mutateAsync({ candidato_id: Number(candidatoId), tutor_id: tutor.id, data_inicio: dataInicio })
      onClose()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível atribuir o tutor.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">Atribuir Tutor</h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">

          <Campo label="Diocese">
            <SelectField value={dioceseId} onChange={(e) => { setDioceseId(e.target.value); setCandidatoId('') }}>
              <option value="">Escolhe...</option>
              {dioceses?.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </SelectField>
          </Campo>

          <Campo label="Candidato (a aguardar tutoria)">
            <SelectField value={candidatoId} onChange={(e) => setCandidatoId(e.target.value)} disabled={!dioceseId}>
              <option value="">{dioceseId ? 'Escolhe...' : 'Escolhe primeiro a diocese'}</option>
              {candidatos?.map((c) => <option key={c.id} value={c.id}>{c.nome} — {c.formacao_nome}</option>)}
            </SelectField>
            {dioceseId && candidatos?.length === 0 && <p className="mt-1 text-[11.5px] text-subtle">Nenhum candidato a aguardar tutoria nesta diocese.</p>}
          </Campo>

          <Campo label="Tutor">
            {tutor ? (
              <div className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-[13px]">
                {tutor.nome}
                <button type="button" onClick={() => setTutor(null)} className="text-[11px] text-subtle hover:text-text">Trocar</button>
              </div>
            ) : (
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
                <input value={pesquisaTutor} onChange={(e) => setPesquisaTutor(e.target.value)} placeholder="Pesquisar tutor..." className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]" />
                {pesquisaTutor.length >= 2 && resultadosTutor && resultadosTutor.dados.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-white shadow-lg">
                    {resultadosTutor.dados.map((u) => (
                      <button type="button" key={u.id} onClick={() => { setTutor({ id: u.id, nome: u.nome }); setPesquisaTutor('') }} className="block w-full px-3 py-2 text-left text-[12.5px] hover:bg-bg">{u.nome}</button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Campo>

          <Campo label="Data de início"><TextField type="date" required value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} /></Campo>
          <p className="text-[11.5px] text-subtle">A data de conclusão prevista (3 meses depois) é calculada automaticamente.</p>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={atribuir.isPending} className="flex-1">
              {atribuir.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Atribuir
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
