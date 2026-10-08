import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Loader2 } from 'lucide-react'
import { useCriarTurma } from '@/hooks/useTurmasFormacao'
import { useCatalogoFormacoes } from '@/hooks/useCatalogoFormacoes'
import { useOpcoesFiltro } from '@/hooks/useDashboardPainel'
import { getApiErrorMessage } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Campo, Linha2, TextField, SelectField } from '@/components/crud/FormShell'
import { notificar } from '@/lib/notificar'

interface Props { onClose: () => void }

/** Limite de participantes por turma (pedido da Coordenação) — o máximo do Catálogo prevalece se for menor. */
const LIMITE_PARTICIPANTES_TURMA = 40

export function ModalCriarTurma({ onClose }: Props) {
  const navigate = useNavigate()
  const { data: formacoes } = useCatalogoFormacoes('')
  const { data: dioceses } = useOpcoesFiltro('dioceses')

  const [formacaoId, setFormacaoId] = useState('')
  const [dioceseId, setDioceseId] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [local, setLocal] = useState('')
  const [numeroPrevisto, setNumeroPrevisto] = useState('')
  const formacaoEscolhida = formacoes?.find((f) => String(f.id) === formacaoId)
  const limite = formacaoEscolhida?.maximo_participantes && formacaoEscolhida.maximo_participantes > 0
    ? Math.min(formacaoEscolhida.maximo_participantes, LIMITE_PARTICIPANTES_TURMA)
    : LIMITE_PARTICIPANTES_TURMA

  const criar = useCriarTurma()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!formacaoId || !dioceseId) { notificar.erro('Escolhe a formação e a diocese.'); return }
    if (numeroPrevisto && Number(numeroPrevisto) > limite) {
      notificar.erro(`O número previsto de participantes não pode passar de ${limite} por turma.`)
      return
    }
    try {
      const resultado = await criar.mutateAsync({
        formacao_id: Number(formacaoId), diocese_id: Number(dioceseId),
        data_inicio: dataInicio || undefined, data_fim: dataFim || undefined, local: local || undefined,
        numero_previsto_participantes: numeroPrevisto ? Number(numeroPrevisto) : undefined,
      })
      onClose()
      navigate(`/turmas-formacao/${resultado.dados.id}`)
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível criar a turma.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">Nova Turma</h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">

          <Campo label="Formação">
            <SelectField value={formacaoId} onChange={(e) => setFormacaoId(e.target.value)}>
              <option value="">Escolhe...</option>
              {formacoes?.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </SelectField>
          </Campo>

          <Campo label="Diocese">
            <SelectField value={dioceseId} onChange={(e) => setDioceseId(e.target.value)}>
              <option value="">Escolhe...</option>
              {dioceses?.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </SelectField>
          </Campo>

          <Linha2>
            <Campo label="Data de início"><TextField type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} /></Campo>
            <Campo label="Data de fim"><TextField type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} /></Campo>
          </Linha2>

          <Linha2>
            <Campo label="Local"><TextField value={local} onChange={(e) => setLocal(e.target.value)} /></Campo>
            <Campo label={`Nº previsto de participantes (máx. ${limite})`}>
              <TextField
                type="number" min="1" max={limite}
                value={numeroPrevisto}
                onChange={(e) => setNumeroPrevisto(e.target.value === '' ? '' : String(Math.min(Number(e.target.value), limite)))}
              />
            </Campo>
          </Linha2>

          <p className="text-[11.5px] text-subtle">O código da turma é gerado automaticamente. Participantes, formadores e documentos adicionam-se a seguir, no detalhe da turma — no máximo {limite} participantes por turma.</p>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={criar.isPending} className="flex-1">
              {criar.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Criar Turma
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
