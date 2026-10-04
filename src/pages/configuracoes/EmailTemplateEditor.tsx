import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Loader2, Save } from 'lucide-react'
import { useEmailTemplate, useAtualizarEmailTemplate } from '@/hooks/useEmailTemplates'
import { getApiErrorMessage } from '@/lib/api'
import { notificar } from '@/lib/notificar'
import { Card } from '@/components/ui/Card'

/** Pré-visualização só no cliente — troca {{variavel}} por um valor de exemplo, para o administrador ver o resultado sem enviar nada. */
function preverComExemplos(texto: string): string {
  return texto.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, chave) => `[${chave}]`)
}

export function EmailTemplateEditor() {
  const { id } = useParams()
  const templateId = Number(id)
  const { data, isLoading } = useEmailTemplate(templateId)
  const atualizar = useAtualizarEmailTemplate(templateId)

  const [assunto, setAssunto] = useState('')
  const [corpoHtml, setCorpoHtml] = useState('')
  const [activo, setActivo] = useState(true)

  useEffect(() => {
    if (data) {
      setAssunto(data.assunto)
      setCorpoHtml(data.corpo_html)
      setActivo(!!data.activo)
    }
  }, [data])

  async function handleGuardar() {
    try {
      await atualizar.mutateAsync({ assunto, corpo_html: corpoHtml, activo })
      notificar.sucesso('Template guardado com sucesso.')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível guardar o template.'))
    }
  }

  if (isLoading || !data) return <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>

  return (
    <div>
      <Link to="/configuracoes/email/templates" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-text">
        <ChevronLeft className="size-3.5" /> Voltar aos templates
      </Link>

      <h1 className="mb-1 text-xl font-bold text-text">{data.nome_exibicao}</h1>
      {data.variaveis_disponiveis && <p className="mb-5 text-[12px] text-subtle">Variáveis disponíveis: {data.variaveis_disponiveis.split(',').map((v) => `{{${v.trim()}}}`).join(', ')}</p>}


      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <Card className="mb-4 p-4">
            <label className="mb-1 block text-[11.5px] font-medium text-subtle">Assunto</label>
            <input
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              className="mb-3 w-full rounded-lg border border-border px-3 py-2 text-[12.5px] outline-none focus:border-[#111827]"
            />
            <label className="mb-1 block text-[11.5px] font-medium text-subtle">Corpo (HTML)</label>
            <textarea
              value={corpoHtml}
              onChange={(e) => setCorpoHtml(e.target.value)}
              rows={14}
              className="w-full resize-none rounded-lg border border-border px-3 py-2 font-mono text-[11.5px] outline-none focus:border-[#111827]"
            />
          </Card>

          <label className="mb-4 flex items-center gap-2 text-[12.5px] font-medium text-text">
            <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="size-4" />
            Template activo (desactivado, o SIGECA usa o texto por omissão)
          </label>

          <button onClick={handleGuardar} disabled={atualizar.isPending} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50">
            {atualizar.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-3.5" />}
            Guardar Template
          </button>
        </div>

        <div>
          <p className="mb-2 text-[11.5px] font-semibold uppercase text-subtle">Pré-visualização</p>
          <Card className="p-4">
            <p className="mb-3 border-b border-border pb-2 text-[13px] font-semibold text-text">{preverComExemplos(assunto)}</p>
            <div className="prose prose-sm max-w-none text-[13px]" dangerouslySetInnerHTML={{ __html: preverComExemplos(corpoHtml) }} />
          </Card>
        </div>
      </div>
    </div>
  )
}
