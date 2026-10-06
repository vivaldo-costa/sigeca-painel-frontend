import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Plus, Loader2, Download, Users } from 'lucide-react'
import { usePagamentosCenso, usePagamentoCensoDetalhe, useValidarPagamentoCenso, useRejeitarPagamentoCenso } from '@/hooks/usePagamentoCenso'
import { usePermissao } from '@/hooks/usePermissao'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { ModalSubmeterRegularizacao } from '@/components/pagamentoCenso/ModalSubmeterRegularizacao'
import { baixarFicheiroProtegido } from '@/lib/download'
import { getApiErrorMessage } from '@/lib/api'
import { notificar } from '@/lib/notificar'
import type { EstadoPagamentoCenso, MembroPagamentoCenso, PagamentoCensoPainel } from '@/types/pagamentoCenso'

const CORES_ESTADO: Record<EstadoPagamentoCenso, string> = {
  pendente: 'bg-badge-orange-bg text-badge-orange-text',
  validado: 'bg-badge-green-bg text-badge-green-text',
  rejeitado: 'bg-badge-red-bg text-badge-red-text',
}

export function RegularizacaoCensoLista() {
  const [estado, setEstado] = useState<EstadoPagamentoCenso | ''>('pendente')
  const { data, isLoading } = usePagamentosCenso(undefined, estado)
  const validar = useValidarPagamentoCenso()
  const rejeitar = useRejeitarPagamentoCenso()
  const { criar: podeCriar, editar: podeEditar } = usePermissao('Finanças')

  const [modalAberto, setModalAberto] = useState(false)
  const [aRejeitar, setARejeitar] = useState<number | null>(null)
  const [motivo, setMotivo] = useState('')
  const [membrosAbertos, setMembrosAbertos] = useState<number | null>(null)

  async function confirmarRejeicao(id: number) {
    if (!motivo.trim()) return
    try {
      await rejeitar.mutateAsync({ id, motivo })
      setARejeitar(null)
      setMotivo('')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível rejeitar o pagamento.'))
    }
  }

  async function baixarComErro(url: string, nomeFicheiro: string) {
    try {
      await baixarFicheiroProtegido(url, nomeFicheiro)
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível descarregar o comprovativo.'))
    }
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-7">
      <Link to="/financas" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-text">
        <ChevronLeft className="size-3.5" /> Voltar a Finanças
      </Link>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-text">Regularização / Censo Escutista</h1>
        <div className="flex items-center gap-2">
          <ExportarBotoes
            tamanho="sm"
            nomeFicheiro="regularizacao-censo"
            titulo="Regularização / Censo Escutista"
            colunas={[
              { titulo: 'Diocese', valor: (p: PagamentoCensoPainel) => p.diocese_nome ?? '—' },
              { titulo: 'Agrupamentos', valor: (p) => p.agrupamentos_nomes ?? '—' },
              { titulo: 'Período', valor: (p) => p.periodo_titulo },
              { titulo: 'Valor/membro (Kz)', valor: (p) => Number(p.valor_por_membro) },
              { titulo: 'Membros', valor: (p) => p.num_membros },
              { titulo: 'Valor total (Kz)', valor: (p) => Number(p.valor_total) },
              { titulo: 'Estado', valor: (p) => p.estado },
              { titulo: 'Submetido por', valor: (p) => p.submetido_por_nome ?? '—' },
              { titulo: 'Data', valor: (p) => new Date(p.created_at).toLocaleDateString('pt-PT') },
            ]}
            linhas={data ?? []}
          />
          {podeCriar && (
            <button onClick={() => setModalAberto(true)} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-black">
              <Plus className="size-3.5" /> Submeter Regularização
            </button>
          )}
        </div>
      </div>

      <Card className="mb-5 flex flex-wrap gap-2 p-4">
        {(['pendente', 'validado', 'rejeitado', ''] as (EstadoPagamentoCenso | '')[]).map((e) => (
          <button
            key={e || 'todos'}
            onClick={() => setEstado(e)}
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition ${estado === e ? 'bg-[#111827] text-white' : 'bg-bg text-muted hover:bg-border'}`}
          >
            {e || 'Todos'}
          </button>
        ))}
      </Card>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <div className="space-y-3">
        {data?.map((p) => (
          <Card key={p.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-text">{p.diocese_nome ?? '—'}</p>
                <p className="text-[12px] text-muted">{p.agrupamentos_nomes ?? '—'}</p>
                <p className="mt-1 text-[12.5px] text-muted">
                  {p.periodo_titulo} · {p.num_membros} membro(s) · {Number(p.valor_por_membro).toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz/membro · total {Number(p.valor_total).toLocaleString('pt-PT')} Kz
                </p>
                <p className="mt-1 text-[11px] text-subtle">
                  Submetido por {p.submetido_por_nome ?? '—'} em {new Date(p.created_at).toLocaleDateString('pt-PT')}
                </p>
                {p.motivo_rejeicao && <p className="mt-1 text-[11.5px] text-badge-red-text">Rejeitado: {p.motivo_rejeicao}</p>}
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CORES_ESTADO[p.estado]}`}>{p.estado}</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
              <button
                onClick={() => setMembrosAbertos(membrosAbertos === p.id ? null : p.id)}
                className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11.5px] font-medium text-text transition hover:bg-bg"
              >
                <Users className="size-3" /> {membrosAbertos === p.id ? 'Esconder membros' : 'Ver membros'}
              </button>
              {p.comprovativo_path && (
                <button
                  onClick={() => baixarComErro(`/regularizacao-censo/${p.id}/comprovativo`, p.comprovativo_nome || 'comprovativo')}
                  className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11.5px] font-medium text-text transition hover:bg-bg"
                >
                  <Download className="size-3" /> Comprovativo
                </button>
              )}
              {podeEditar && p.estado === 'pendente' && (
                <>
                  <button onClick={() => validar.mutate(p.id)} disabled={validar.isPending} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[11.5px] font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50">
                    Validar
                  </button>
                  <button onClick={() => setARejeitar(p.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-[11.5px] font-medium text-red-500 transition hover:bg-red-50">
                    Rejeitar
                  </button>
                </>
              )}
            </div>
            {membrosAbertos === p.id && <MembrosRegularizacao pagamento={p} />}
          </Card>
        ))}
      </div>

      {!isLoading && data?.length === 0 && <p className="py-16 text-center text-sm text-subtle">Nenhum pagamento encontrado.</p>}

      {aRejeitar !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={() => setARejeitar(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 font-bold text-text">Rejeitar pagamento</h3>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo da rejeição..."
              rows={3}
              className="mb-3 w-full resize-none rounded-lg border border-border px-3 py-2 text-[13px] outline-none focus:border-[#111827]"
            />
            <div className="flex gap-2">
              <button onClick={() => setARejeitar(null)} className="flex-1 rounded-lg border border-border py-2 text-[13px] font-medium text-text transition-colors hover:bg-bg">Cancelar</button>
              <button onClick={() => confirmarRejeicao(aRejeitar)} disabled={!motivo.trim() || rejeitar.isPending} className="flex-1 rounded-lg bg-badge-red-text py-2 text-[13px] font-semibold text-white disabled:opacity-50">
                Rejeitar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalAberto && <ModalSubmeterRegularizacao onClose={() => setModalAberto(false)} />}
    </div>
  )
}

/** Membros abrangidos por uma regularização — com Nº SIGECA, Secção e Agrupamento. */
function MembrosRegularizacao({ pagamento }: { pagamento: PagamentoCensoPainel }) {
  const { data, isLoading } = usePagamentoCensoDetalhe(pagamento.id)
  const membros = data?.membros ?? []
  return (
    <div className="mt-3 rounded-lg border border-border">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <p className="text-[12px] font-semibold text-text">{membros.length} membro(s)</p>
        <ExportarBotoes
          tamanho="sm"
          nomeFicheiro={`regularizacao-${pagamento.id}-membros`}
          titulo={`Regularização #${pagamento.id} — ${pagamento.diocese_nome ?? ''}`}
          subtitulo={`${pagamento.periodo_titulo} · ${pagamento.agrupamentos_nomes ?? ''}`}
          colunas={[
            { titulo: 'Nome', valor: (m: MembroPagamentoCenso) => m.nome },
            { titulo: 'Nº SIGECA', valor: (m) => m.codigo_associado },
            { titulo: 'Secção', valor: (m) => m.seccao_nome ?? '—' },
            { titulo: 'Agrupamento', valor: (m) => [m.ab_agrupamento, m.agrupamento_nome].filter(Boolean).join(' - ') || '—' },
          ]}
          linhas={membros}
        />
      </div>
      {isLoading ? (
        <div className="flex justify-center py-6"><Loader2 className="size-4 animate-spin text-subtle" /></div>
      ) : (
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="sticky top-0 bg-bg text-[10.5px] uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Nome</th>
                <th className="px-3 py-2 font-medium">Nº SIGECA</th>
                <th className="px-3 py-2 font-medium">Secção</th>
                <th className="px-3 py-2 font-medium">Agrupamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {membros.map((m) => (
                <tr key={m.id}>
                  <td className="px-3 py-1.5 text-text">{m.nome}</td>
                  <td className="px-3 py-1.5 font-mono text-[11px] text-muted">
                    <Link to={`/utilizadores/${m.utilizador_id}`} className="hover:underline">{m.codigo_associado}</Link>
                  </td>
                  <td className="px-3 py-1.5 text-muted">{m.seccao_nome ?? '—'}</td>
                  <td className="px-3 py-1.5 text-muted">{[m.ab_agrupamento, m.agrupamento_nome].filter(Boolean).join(' - ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
