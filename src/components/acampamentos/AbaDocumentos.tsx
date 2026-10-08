import { useState } from 'react'
import { Upload, Trash2, FileText, Loader2 } from 'lucide-react'
import { useEventoDocumentos, useCriarEventoDocumento, useRemoverEventoDocumento } from '@/hooks/useEventoDocumentos'
import { getApiErrorMessage } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { LABEL_TIPO_DOCUMENTO_EVENTO, type TipoDocumentoEvento } from '@/types/eventoDocumento'
import { notificar } from '@/lib/notificar'
import { LinkFicheiroProtegido } from '@/components/ui/LinkFicheiroProtegido'

export function AbaDocumentos({ atividadeId }: { atividadeId: number }) {
  const { data, isLoading } = useEventoDocumentos(atividadeId)
  const criar = useCriarEventoDocumento(atividadeId)
  const remover = useRemoverEventoDocumento(atividadeId)

  const [tipo, setTipo] = useState<TipoDocumentoEvento>('comprovativo')
  const [descricao, setDescricao] = useState('')
  const [dataDocumento, setDataDocumento] = useState('')

  async function handleEscolherFicheiro(e: React.ChangeEvent<HTMLInputElement>) {
    const ficheiro = e.target.files?.[0]
    if (!ficheiro) return
    try {
      await criar.mutateAsync({ tipo, descricao: descricao || undefined, data_documento: dataDocumento || undefined, ficheiro })
      setDescricao('')
      setDataDocumento('')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível anexar o documento.'))
    }
    e.target.value = ''
  }

  return (
    <div className="space-y-4">

      <Card className="p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Anexar Documento</p>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-[11px] text-subtle">Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoDocumentoEvento)} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] outline-none focus:border-[#111827]">
              {Object.entries(LABEL_TIPO_DOCUMENTO_EVENTO).map(([valor, label]) => <option key={valor} value={valor}>{label}</option>)}
            </select>
          </div>
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-[11px] text-subtle">Descrição (opcional)</label>
            <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex.: Pagamento da renda do campo" className="h-9 w-full rounded-lg border border-border px-3 text-[12.5px] outline-none focus:border-[#111827]" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-subtle">Data do documento (opcional)</label>
            <input type="date" value={dataDocumento} onChange={(e) => setDataDocumento(e.target.value)} className="h-9 rounded-lg border border-border px-3 text-[12.5px] outline-none focus:border-[#111827]" />
          </div>
          <label className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 text-[12.5px] font-semibold text-white hover:bg-black">
            {criar.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
            Anexar Ficheiro
            <input type="file" className="hidden" onChange={handleEscolherFicheiro} disabled={criar.isPending} />
          </label>
        </div>
      </Card>

      <Card className="overflow-x-auto">
        {isLoading && <div className="flex justify-center py-10"><Loader2 className="size-5 animate-spin text-subtle" /></div>}
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3.5 py-2.5 font-medium">Ficheiro</th>
              <th className="px-3.5 py-2.5 font-medium">Tipo</th>
              <th className="px-3.5 py-2.5 font-medium">Descrição</th>
              <th className="px-3.5 py-2.5 font-medium">Data</th>
              <th className="px-3.5 py-2.5 font-medium">Enviado por</th>
              <th className="px-3.5 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!isLoading && data?.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-subtle">Nenhum documento anexado ainda.</td></tr>}
            {data?.map((doc) => (
              <tr key={doc.id} className="hover:bg-bg">
                <td className="px-3.5 py-2.5">
                  <LinkFicheiroProtegido pasta="eventos-documentos" nome={doc.path} nomeFicheiro={doc.nome_ficheiro} className="flex items-center gap-1.5 font-medium text-text hover:underline">
                    <FileText className="size-3.5 text-subtle" /> {doc.nome_ficheiro}
                  </LinkFicheiroProtegido>
                </td>
                <td className="px-3.5 py-2.5 text-muted">{LABEL_TIPO_DOCUMENTO_EVENTO[doc.tipo]}</td>
                <td className="px-3.5 py-2.5 text-muted">{doc.descricao ?? '—'}</td>
                <td className="px-3.5 py-2.5 text-muted">{doc.data_documento ? new Date(doc.data_documento).toLocaleDateString('pt-PT') : '—'}</td>
                <td className="px-3.5 py-2.5 text-muted">{doc.enviado_por_nome ?? '—'}</td>
                <td className="px-3.5 py-2.5">
                  <button onClick={() => remover.mutate(doc.id)} className="text-red-400 hover:text-red-600"><Trash2 className="size-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
