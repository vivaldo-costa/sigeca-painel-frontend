import { useState } from 'react'
import { FileText, Plus, Loader2, Download, Search, Files } from 'lucide-react'
import { useDocumentos, useCancelarDocumento, baixarDocumentoPdf } from '@/hooks/useDocumentos'
import { getApiErrorMessage } from '@/lib/api'
import { notificar } from '@/lib/notificar'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { ModalNovoDocumento } from '@/components/documentos/ModalNovoDocumento'
import { AbaModelos } from '@/components/documentos/AbaModelos'
import type { FiltrosDocumentos, EstadoDocumento, DocumentoOficial } from '@/types/documento'

type Aba = 'declaracoes' | 'modelos'

const CORES_ESTADO: Record<EstadoDocumento, string> = {
  pendente: 'bg-badge-orange-bg text-badge-orange-text',
  gerado: 'bg-badge-green-bg text-badge-green-text',
  cancelado: 'bg-bg text-muted',
}

export function DocumentosLista() {
  const [aba, setAba] = useState<Aba>('declaracoes')
  const [filtros, setFiltros] = useState<FiltrosDocumentos>({})
  const [pesquisaRascunho, setPesquisaRascunho] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [aBaixar, setABaixar] = useState<number | null>(null)

  const { data, isLoading } = useDocumentos(filtros)
  const cancelar = useCancelarDocumento()

  async function handleBaixar(doc: DocumentoOficial) {
    setABaixar(doc.id)
    try {
      await baixarDocumentoPdf(doc)
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível descarregar o documento.'))
    } finally {
      setABaixar(null)
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-7">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <FileText className="size-5 text-muted" /> Documentos
        </h1>
        {aba === 'declaracoes' && (
          <div className="flex items-center gap-2">
            <ExportarBotoes
              tamanho="sm"
              nomeFicheiro="documentos"
              titulo="Documentos"
              colunas={[
                { titulo: 'Utilizador', valor: (d: DocumentoOficial) => d.nome_utilizador || '—' },
                { titulo: 'Nº SIGECA', valor: (d) => d.codigo_associado },
                { titulo: 'Actividade', valor: (d) => d.atividade_titulo ?? '—' },
                { titulo: 'Entidade', valor: (d) => d.entidade_empregadora || '—' },
                { titulo: 'Início', valor: (d) => new Date(d.data_inicio).toLocaleDateString('pt-PT') },
                { titulo: 'Fim', valor: (d) => new Date(d.data_fim).toLocaleDateString('pt-PT') },
                { titulo: 'Estado', valor: (d) => d.estado },
              ]}
              linhas={data ?? []}
            />
            <button
              onClick={() => setModalAberto(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-black"
            >
              <Plus className="size-3.5" /> Gerar Documento
            </button>
          </div>
        )}
      </div>

      <div className="mb-5 flex gap-1 border-b border-border">
        {([
          ['declaracoes', 'Declarações', FileText],
          ['modelos', 'Modelos', Files],
        ] as [Aba, string, typeof FileText][]).map(([valor, label, Icon]) => (
          <button
            key={valor}
            onClick={() => setAba(valor)}
            className={cn(
              'flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-[13px] font-medium transition-colors',
              aba === valor ? 'border-[#111827] text-text' : 'border-transparent text-muted hover:text-text'
            )}
          >
            <Icon className="size-3.5" /> {label}
          </button>
        ))}
      </div>

      {aba === 'modelos' ? (
        <AbaModelos />
      ) : (
        <>
      <Card className="mb-4 flex flex-wrap items-center gap-3 p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); setFiltros((f) => ({ ...f, pesquisa: pesquisaRascunho })) }}
          className="relative flex-1 min-w-[220px]"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
          <input
            value={pesquisaRascunho}
            onChange={(e) => setPesquisaRascunho(e.target.value)}
            placeholder="Nome ou Nº SIGECA..."
            className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]"
          />
        </form>
        <div className="flex gap-1">
          {(['', 'gerado', 'pendente', 'cancelado'] as (EstadoDocumento | '')[]).map((e) => (
            <button
              key={e || 'todos'}
              onClick={() => setFiltros((f) => ({ ...f, estado: e }))}
              className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition ${
                (filtros.estado ?? '') === e ? 'bg-[#111827] text-white' : 'bg-bg text-muted hover:bg-border'
              }`}
            >
              {e || 'Todos'}
            </button>
          ))}
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3.5 py-2.5 font-medium">Utilizador</th>
              <th className="px-3.5 py-2.5 font-medium">Actividade</th>
              <th className="px-3.5 py-2.5 font-medium">Entidade</th>
              <th className="px-3.5 py-2.5 font-medium">Período</th>
              <th className="px-3.5 py-2.5 font-medium">Estado</th>
              <th className="px-3.5 py-2.5 text-center font-medium">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr><td colSpan={6} className="py-16 text-center text-subtle"><Loader2 className="mx-auto size-5 animate-spin" /></td></tr>
            )}
            {!isLoading && data?.length === 0 && (
              <tr><td colSpan={6} className="py-16 text-center text-subtle">Nenhum documento encontrado.</td></tr>
            )}
            {!isLoading && data?.map((doc) => (
              <tr key={doc.id} className="transition-colors hover:bg-bg">
                <td className="px-3.5 py-2.5">
                  <p className="font-medium text-text">{doc.nome_utilizador}</p>
                  <p className="font-mono text-[11px] text-subtle">{doc.codigo_associado}</p>
                </td>
                <td className="px-3.5 py-2.5 text-muted">{doc.atividade_titulo ?? '—'}</td>
                <td className="px-3.5 py-2.5 text-muted">{doc.entidade_empregadora ?? '—'}</td>
                <td className="px-3.5 py-2.5 text-muted">
                  {new Date(doc.data_inicio).toLocaleDateString('pt-PT')} – {new Date(doc.data_fim).toLocaleDateString('pt-PT')}
                </td>
                <td className="px-3.5 py-2.5">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CORES_ESTADO[doc.estado]}`}>
                    {doc.estado}
                  </span>
                </td>
                <td className="px-3.5 py-2.5">
                  <div className="flex items-center justify-center gap-2">
                    {doc.pdf_path && doc.estado !== 'cancelado' && (
                      <button
                        onClick={() => handleBaixar(doc)}
                        disabled={aBaixar === doc.id}
                        className="flex items-center gap-1 rounded-full bg-badge-blue-bg px-3 py-1 text-[11.5px] font-medium text-badge-blue-text transition hover:opacity-80 disabled:opacity-50"
                      >
                        {aBaixar === doc.id ? <Loader2 className="size-3 animate-spin" /> : <Download className="size-3" />} PDF
                      </button>
                    )}
                    {doc.estado !== 'cancelado' && (
                      <button
                        onClick={() => cancelar.mutate(doc.id)}
                        disabled={cancelar.isPending}
                        className="rounded-full bg-badge-red-bg px-3 py-1 text-[11.5px] font-medium text-badge-red-text transition hover:opacity-80 disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
        </>
      )}

      {modalAberto && <ModalNovoDocumento onClose={() => setModalAberto(false)} />}
    </div>
  )
}
