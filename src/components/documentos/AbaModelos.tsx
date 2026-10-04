import { useState } from 'react'
import { FileSpreadsheet, FileText, File as FileIcon, Plus, Loader2, Download, Trash2 } from 'lucide-react'
import {
  useDocumentoModelos, useRemoverDocumentoModelo, baixarDocumentoModelo,
} from '@/hooks/useDocumentoModelos'
import { usePermissao } from '@/hooks/usePermissao'
import { getApiErrorMessage } from '@/lib/api'
import { notificar } from '@/lib/notificar'
import { Card } from '@/components/ui/Card'
import { ModalNovoModelo } from '@/components/documentos/ModalNovoModelo'
import type { DocumentoModelo } from '@/types/documentoModelo'

const LABEL_CATEGORIA: Record<string, string> = {
  plano_accao: 'Programa / Plano de Acção',
  relatorio_financeiro: 'Relatório de Actividades / Financeiro',
  geral: 'Geral',
}

function IconePorExtensao({ extensao }: { extensao: string }) {
  if (extensao === 'xlsx') return <FileSpreadsheet className="size-5 text-badge-green-text" />
  if (extensao === 'pdf') return <FileText className="size-5 text-badge-red-text" />
  return <FileIcon className="size-5 text-muted" />
}

function formatarTamanho(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AbaModelos() {
  const [modalAberto, setModalAberto] = useState(false)
  const [aBaixar, setABaixar] = useState<number | null>(null)

  const { data, isLoading } = useDocumentoModelos()
  const remover = useRemoverDocumentoModelo()
  const permissao = usePermissao('Documentos')

  async function handleBaixar(modelo: DocumentoModelo) {
    setABaixar(modelo.id)
    try {
      await baixarDocumentoModelo(modelo)
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível descarregar o modelo.'))
    } finally {
      setABaixar(null)
    }
  }

  async function handleRemover(modelo: DocumentoModelo) {
    if (!confirm(`Remover o modelo "${modelo.titulo}"?`)) return
    try {
      await remover.mutateAsync(modelo.id)
      notificar.sucesso('Modelo removido.')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível remover o modelo.'))
    }
  }

  const grupos = (data ?? []).reduce<Record<string, DocumentoModelo[]>>((acc, m) => {
    (acc[m.categoria] ??= []).push(m)
    return acc
  }, {})

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-muted">
          Ficheiros-modelo prontos a descarregar e preencher — Programa/Plano de Acção, Relatório de Actividades e Financeiro, entre outros.
        </p>
        {permissao.criar && (
          <button
            onClick={() => setModalAberto(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-black"
          >
            <Plus className="size-3.5" /> Novo Modelo
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-16"><Loader2 className="size-5 animate-spin text-subtle" /></div>
      )}

      {!isLoading && (data?.length ?? 0) === 0 && (
        <Card className="p-10 text-center text-[13px] text-subtle">Ainda não há modelos disponíveis.</Card>
      )}

      {!isLoading && Object.entries(grupos).map(([categoria, modelos]) => (
        <div key={categoria}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">
            {LABEL_CATEGORIA[categoria] ?? categoria}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {modelos.map((modelo) => (
              <Card key={modelo.id} className="flex items-start gap-3 p-4">
                <IconePorExtensao extensao={modelo.extensao} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-text">{modelo.titulo}</p>
                  {modelo.descricao && <p className="mt-0.5 text-[12px] text-subtle">{modelo.descricao}</p>}
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-subtle">
                    .{modelo.extensao} {modelo.tamanho_bytes ? `· ${formatarTamanho(modelo.tamanho_bytes)}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => handleBaixar(modelo)}
                    disabled={aBaixar === modelo.id}
                    title="Descarregar"
                    className="grid size-8 place-items-center rounded-lg bg-badge-blue-bg text-badge-blue-text transition hover:opacity-80 disabled:opacity-50"
                  >
                    {aBaixar === modelo.id ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                  </button>
                  {permissao.apagar && (
                    <button
                      onClick={() => handleRemover(modelo)}
                      title="Remover"
                      className="grid size-8 place-items-center rounded-lg bg-badge-red-bg text-badge-red-text transition hover:opacity-80"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {modalAberto && <ModalNovoModelo onClose={() => setModalAberto(false)} />}
    </div>
  )
}
