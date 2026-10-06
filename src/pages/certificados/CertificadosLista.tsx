import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, Plus, Loader2, Search, Ban, Download, Copy, FileBadge2 } from 'lucide-react'
import { useCertificados, useRevogarCertificado } from '@/hooks/useCertificados'
import { usePermissao } from '@/hooks/usePermissao'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { ModalEmitirCertificado } from '@/components/certificados/ModalEmitirCertificado'
import { baixarFicheiroProtegido } from '@/lib/download'
import { getApiErrorMessage } from '@/lib/api'
import { notificar } from '@/lib/notificar'
import type { TipoCertificado, CertificadoPainel } from '@/types/certificado'

const LABEL_TIPO: Record<TipoCertificado, string> = { certificado: 'Certificado', declaracao: 'Declaração', diploma: 'Diploma' }

export function CertificadosLista() {
  const [pesquisaRascunho, setPesquisaRascunho] = useState('')
  const [pesquisa, setPesquisa] = useState('')
  const [tipo, setTipo] = useState('')
  const { data, isLoading } = useCertificados(pesquisa, tipo)
  const revogar = useRevogarCertificado()
  const { criar: podeCriar, editar: podeEditar } = usePermissao('Certificados')

  const [modalAberto, setModalAberto] = useState(false)
  const [aRevogar, setARevogar] = useState<number | null>(null)
  const [motivoRevogacao, setMotivoRevogacao] = useState('')

  async function confirmarRevogacao(id: number) {
    if (!motivoRevogacao.trim()) return
    await revogar.mutateAsync({ id, motivo: motivoRevogacao })
    setARevogar(null)
    setMotivoRevogacao('')
  }

  // Assume o mesmo padrão de subdomínio usado no resto do Painel (painel.aeca.ao -> sigeca.aeca.ao).
  function copiarLinkValidacao(numero: string, codigo: string) {
    const url = `${window.location.origin.replace('painel', 'sigeca')}/verificar?numero=${encodeURIComponent(numero)}&codigo=${codigo}`
    navigator.clipboard.writeText(url)
  }

  async function baixarComErro(url: string, nomeFicheiro: string) {
    try {
      await baixarFicheiroProtegido(url, nomeFicheiro)
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível descarregar o certificado.'))
    }
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <BadgeCheck className="size-5 text-muted" /> Certificação Digital
        </h1>
        <div className="flex items-center gap-2">
          <Link to="/certificados/modelos" className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-[12.5px] font-semibold text-text hover:bg-bg">
            <FileBadge2 className="size-3.5" /> Modelos
          </Link>
          <ExportarBotoes
            tamanho="sm"
            nomeFicheiro="certificados"
            titulo="Certificação Digital"
            colunas={[
              { titulo: 'Nº', valor: (c: CertificadoPainel) => c.numero_unico },
              { titulo: 'Escuteiro', valor: (c) => c.utilizador_nome },
              { titulo: 'Nº SIGECA', valor: (c) => c.codigo_associado },
              { titulo: 'Tipo', valor: (c) => LABEL_TIPO[c.tipo] },
              { titulo: 'Título', valor: (c) => c.titulo },
              { titulo: 'Estado', valor: (c) => (c.ativo ? 'Válido' : 'Revogado') },
            ]}
            linhas={data ?? []}
          />
          {podeCriar && (
            <button onClick={() => setModalAberto(true)} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-black">
              <Plus className="size-3.5" /> Emitir Certificado
            </button>
          )}
        </div>
      </div>

      <Card className="mb-5 flex flex-wrap items-center gap-3 p-4">
        <form onSubmit={(e) => { e.preventDefault(); setPesquisa(pesquisaRascunho) }} className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
          <input
            value={pesquisaRascunho}
            onChange={(e) => setPesquisaRascunho(e.target.value)}
            placeholder="Nome, Nº SIGECA ou número do certificado..."
            className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]"
          />
        </form>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]">
          <option value="">Todos os tipos</option>
          <option value="declaracao">Declaração</option>
          <option value="certificado">Certificado</option>
          <option value="diploma">Diploma</option>
        </select>
      </Card>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3.5 py-2.5 font-medium">Nº</th>
              <th className="px-3.5 py-2.5 font-medium">Escuteiro</th>
              <th className="px-3.5 py-2.5 font-medium">Tipo</th>
              <th className="px-3.5 py-2.5 font-medium">Título</th>
              <th className="px-3.5 py-2.5 font-medium">Estado</th>
              <th className="px-3.5 py-2.5 text-center font-medium">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!isLoading && data?.length === 0 && (
              <tr><td colSpan={6} className="py-16 text-center text-subtle">Nenhum certificado emitido.</td></tr>
            )}
            {data?.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-bg">
                <td className="px-3.5 py-2.5 font-mono text-[11px] text-subtle">{c.numero_unico}</td>
                <td className="px-3.5 py-2.5">
                  <p className="font-medium text-text">{c.utilizador_nome}</p>
                  <p className="font-mono text-[11px] text-subtle">{c.codigo_associado}</p>
                </td>
                <td className="px-3.5 py-2.5 text-muted">{LABEL_TIPO[c.tipo]}</td>
                <td className="px-3.5 py-2.5 text-muted">{c.titulo}</td>
                <td className="px-3.5 py-2.5">
                  {c.ativo ? (
                    <span className="rounded-full bg-badge-green-bg px-2.5 py-0.5 text-[11px] font-semibold text-badge-green-text">Válido</span>
                  ) : (
                    <span className="rounded-full bg-badge-red-bg px-2.5 py-0.5 text-[11px] font-semibold text-badge-red-text">Revogado</span>
                  )}
                </td>
                <td className="px-3.5 py-2.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <button onClick={() => baixarComErro(`/certificados/${c.id}/pdf`, `${c.numero_unico}.pdf`)} className="rounded-lg border border-border p-1.5 text-text transition hover:bg-bg" title="Descarregar PDF">
                      <Download className="size-3.5" />
                    </button>
                    <button onClick={() => copiarLinkValidacao(c.numero_unico, c.codigo_verificacao)} className="rounded-lg border border-border p-1.5 text-text transition hover:bg-bg" title="Copiar link de validação">
                      <Copy className="size-3.5" />
                    </button>
                    {podeEditar && c.ativo && (
                      <button onClick={() => setARevogar(c.id)} className="rounded-lg border border-red-200 p-1.5 text-red-500 transition hover:bg-red-50" title="Revogar">
                        <Ban className="size-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {aRevogar !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={() => setARevogar(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 font-bold text-text">Revogar certificado</h3>
            <textarea
              value={motivoRevogacao}
              onChange={(e) => setMotivoRevogacao(e.target.value)}
              placeholder="Motivo da revogação..."
              rows={3}
              className="mb-3 w-full resize-none rounded-lg border border-border px-3 py-2 text-[13px] outline-none focus:border-[#111827]"
            />
            <div className="flex gap-2">
              <button onClick={() => setARevogar(null)} className="flex-1 rounded-lg border border-border py-2 text-[13px] font-medium text-text transition-colors hover:bg-bg">Cancelar</button>
              <button
                onClick={() => confirmarRevogacao(aRevogar)}
                disabled={!motivoRevogacao.trim() || revogar.isPending}
                className="flex-1 rounded-lg bg-badge-red-text py-2 text-[13px] font-semibold text-white disabled:opacity-50"
              >
                Revogar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalAberto && <ModalEmitirCertificado onClose={() => setModalAberto(false)} />}
    </div>
  )
}
