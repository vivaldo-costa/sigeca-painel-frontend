import { useState, type FormEvent } from 'react'
import { X, Search, Loader2, FileText, CircleCheck } from 'lucide-react'
import { useAtividadesDoUtilizador, useCriarDocumento } from '@/hooks/useDocumentos'
import { getApiErrorMessage } from '@/lib/api'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Campo, TextField, SelectField } from '@/components/crud/FormShell'
import { notificar } from '@/lib/notificar'

export function ModalNovoDocumento({ onClose }: { onClose: () => void }) {
  const [codigoRascunho, setCodigoRascunho] = useState('')
  const [codigoPesquisado, setCodigoPesquisado] = useState<string | null>(null)
  const [atividadeId, setAtividadeId] = useState<number | undefined>()
  const [entidade, setEntidade] = useState('')
  const [sucesso, setSucesso] = useState(false)

  const { data, isLoading, isError } = useAtividadesDoUtilizador(codigoPesquisado)
  const criar = useCriarDocumento()

  function pesquisar(e: FormEvent) {
    e.preventDefault()
    setAtividadeId(undefined)
    setCodigoPesquisado(codigoRascunho.trim())
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!codigoPesquisado || !atividadeId) return
    try {
      await criar.mutateAsync({ codigo_associado: codigoPesquisado, atividade_id: atividadeId, entidade_empregadora: entidade })
      setSucesso(true)
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível gerar a declaração.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-text">
            <FileText className="size-4 text-muted" /> Gerar Declaração de Dispensa
          </h2>
          <button onClick={onClose} className="text-subtle transition hover:text-text"><X className="size-5" /></button>
        </div>

        {sucesso ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <div className="grid size-14 place-items-center rounded-full bg-badge-green-bg">
              <CircleCheck className="size-7 text-badge-green-text" />
            </div>
            <p className="text-sm font-medium text-text">Declaração gerada com sucesso!</p>
            <Button onClick={onClose} className="mt-2 w-full">Fechar</Button>
          </div>
        ) : (
          <div className="px-6 py-5">
            <form onSubmit={pesquisar} className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
                <input
                  value={codigoRascunho}
                  onChange={(e) => setCodigoRascunho(e.target.value)}
                  placeholder="Nº SIGECA (ex: CA00056000001)"
                  className="w-full rounded-lg border border-border py-2.5 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]"
                />
              </div>
              <button type="submit" className="rounded-lg bg-bg px-4 text-[13px] font-medium text-text transition hover:bg-border">
                Procurar
              </button>
            </form>

            {isLoading && <div className="flex justify-center py-6"><Loader2 className="size-5 animate-spin text-subtle" /></div>}
            {isError && <Alert variant="error">Utilizador não encontrado.</Alert>}

            {data && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="rounded-lg bg-bg px-3 py-2.5 text-[13px]">
                  <p className="font-semibold text-text">{data.utilizador.nome}</p>
                  <p className="text-subtle">{data.utilizador.email ?? 'sem e-mail'}</p>
                </div>

                {data.atividades.length === 0 ? (
                  <p className="text-[13px] text-subtle">Este utilizador não está inscrito em nenhuma actividade.</p>
                ) : (
                  <Campo label="Actividade">
                    <SelectField required value={atividadeId ?? ''} onChange={(e) => setAtividadeId(Number(e.target.value) || undefined)}>
                      <option value="">-- Seleccionar --</option>
                      {data.atividades.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.titulo} ({new Date(a.data_inicio).toLocaleDateString('pt-PT')})
                        </option>
                      ))}
                    </SelectField>
                  </Campo>
                )}

                <Campo label="Entidade Empregadora / Instituição">
                  <TextField required value={entidade} onChange={(e) => setEntidade(e.target.value)} placeholder="Ex.: Escola Secundária de..." />
                </Campo>


                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                  <Button type="submit" loading={criar.isPending} disabled={data.atividades.length === 0} className="flex-1">
                    {criar.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                    Gerar PDF
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
