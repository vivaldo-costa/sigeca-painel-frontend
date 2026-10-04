import { useState, Fragment } from 'react'
import { ShieldCheck, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuditoria } from '@/hooks/useAuditoria'
import { useAuthStore } from '@/store/auth'
import { getApiErrorMessage } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { LABEL_ACCAO, type AccaoAuditoria, type EntradaAuditoria } from '@/types/auditoria'

const CORES_ACCAO: Partial<Record<AccaoAuditoria, string>> = {
  login: 'bg-badge-green-bg text-badge-green-text',
  login_falhado: 'bg-badge-red-bg text-badge-red-text',
  logout: 'bg-bg text-subtle',
  criacao: 'bg-badge-blue-bg text-badge-blue-text',
  edicao: 'bg-badge-orange-bg text-badge-orange-text',
  eliminacao: 'bg-badge-red-bg text-badge-red-text',
  alteracao_permissao: 'bg-violet-100 text-violet-700',
  alteracao_perfil: 'bg-violet-100 text-violet-700',
}

export function AuditoriaLista() {
  const user = useAuthStore((s) => s.user)
  const [pagina, setPagina] = useState(1)
  const [accao, setAccao] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [linhaAberta, setLinhaAberta] = useState<number | null>(null)

  const { data, isLoading, isError, error } = useAuditoria({ pagina, porPagina: 30, accao: accao || undefined, sucesso: sucesso || undefined })

  if (user?.perfil_nome !== 'ADMIN') {
    return (
      <div className="mx-auto max-w-[700px] px-4 py-10">
        <Alert variant="error">A auditoria é exclusiva do Administrador.</Alert>
      </div>
    )
  }

  const totalPaginas = data ? Math.ceil(data.total / data.porPagina) : 1

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <ShieldCheck className="size-5 text-muted" /> Auditoria
        </h1>
        <ExportarBotoes
          tamanho="sm"
          nomeFicheiro={`auditoria-pagina-${pagina}`}
          titulo="Registo de Auditoria"
          subtitulo={`Página ${pagina} de ${totalPaginas}`}
          colunas={[
            { titulo: 'Data', valor: (e: EntradaAuditoria) => new Date(e.created_at).toLocaleString('pt-PT') },
            { titulo: 'Utilizador', valor: (e) => e.utilizador_nome ?? '—' },
            { titulo: 'Nº SIGECA', valor: (e) => e.codigo_associado ?? '—' },
            { titulo: 'Perfil', valor: (e) => e.perfil_nome ?? '—' },
            { titulo: 'Acção', valor: (e) => LABEL_ACCAO[e.accao] },
            { titulo: 'Módulo', valor: (e) => e.modulo ?? '—' },
            { titulo: 'Resultado', valor: (e) => (e.sucesso ? 'Sucesso' : 'Falhou') },
          ]}
          linhas={data?.dados ?? []}
        />
      </div>

      <Card className="mb-5 flex flex-wrap items-center gap-3 p-4">
        <select value={accao} onChange={(e) => { setAccao(e.target.value); setPagina(1) }} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]">
          <option value="">Todas as acções</option>
          {(Object.keys(LABEL_ACCAO) as AccaoAuditoria[]).map((a) => <option key={a} value={a}>{LABEL_ACCAO[a]}</option>)}
        </select>
        <select value={sucesso} onChange={(e) => { setSucesso(e.target.value); setPagina(1) }} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]">
          <option value="">Sucesso e falhas</option>
          <option value="1">Só sucesso</option>
          <option value="0">Só falhas</option>
        </select>
      </Card>

      {isError && (
        <Alert variant="error">
          {getApiErrorMessage(error, 'Não foi possível carregar a auditoria.')}
        </Alert>
      )}
      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3.5 py-2.5 font-medium">Data</th>
              <th className="px-3.5 py-2.5 font-medium">Utilizador</th>
              <th className="px-3.5 py-2.5 font-medium">Perfil</th>
              <th className="px-3.5 py-2.5 font-medium">Acção</th>
              <th className="px-3.5 py-2.5 font-medium">Módulo</th>
              <th className="px-3.5 py-2.5 font-medium">Resultado</th>
              <th className="px-3.5 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!isLoading && data?.dados.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-subtle">Nenhuma entrada encontrada.</td></tr>}
            {data?.dados.map((entrada) => {
              const aberta = linhaAberta === entrada.id
              const temDetalhe = entrada.antes || entrada.depois || entrada.erro
              return (
                <Fragment key={entrada.id}>
                  <tr className={temDetalhe ? 'cursor-pointer hover:bg-bg' : ''} onClick={() => temDetalhe && setLinhaAberta(aberta ? null : entrada.id)}>
                    <td className="px-3.5 py-2.5 text-muted">{new Date(entrada.created_at).toLocaleString('pt-PT')}</td>
                    <td className="px-3.5 py-2.5">
                      <p className="font-medium text-text">{entrada.utilizador_nome ?? '—'}</p>
                      {entrada.codigo_associado && <p className="font-mono text-[10.5px] text-subtle">{entrada.codigo_associado}</p>}
                    </td>
                    <td className="px-3.5 py-2.5 text-muted">{entrada.perfil_nome ?? '—'}</td>
                    <td className="px-3.5 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${CORES_ACCAO[entrada.accao] ?? 'bg-bg text-subtle'}`}>{LABEL_ACCAO[entrada.accao]}</span>
                    </td>
                    <td className="px-3.5 py-2.5 text-muted">{entrada.modulo ?? '—'}</td>
                    <td className="px-3.5 py-2.5">
                      {entrada.sucesso ? (
                        <span className="text-[11px] font-medium text-emerald-600">Sucesso</span>
                      ) : (
                        <span className="text-[11px] font-medium text-badge-red-text">Falhou</span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 text-subtle">
                      {temDetalhe && (aberta ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />)}
                    </td>
                  </tr>
                  {aberta && temDetalhe && (
                    <tr>
                      <td colSpan={7} className="bg-bg px-3.5 py-3">
                        {entrada.erro && <p className="mb-2 text-[12px] text-badge-red-text">Erro: {entrada.erro}</p>}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {entrada.antes && (
                            <div>
                              <p className="mb-1 text-[10.5px] font-semibold uppercase text-subtle">Antes</p>
                              <pre className="overflow-x-auto rounded-lg bg-white p-2 text-[11px] text-text">{JSON.stringify(entrada.antes, null, 2)}</pre>
                            </div>
                          )}
                          {entrada.depois && (
                            <div>
                              <p className="mb-1 text-[10.5px] font-semibold uppercase text-subtle">Depois</p>
                              <pre className="overflow-x-auto rounded-lg bg-white p-2 text-[11px] text-text">{JSON.stringify(entrada.depois, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </Card>

      {data && totalPaginas > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={pagina === 1} className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] disabled:opacity-40">Anterior</button>
          <span className="text-[12.5px] text-muted">Página {pagina} de {totalPaginas}</span>
          <button onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas} className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] disabled:opacity-40">Seguinte</button>
        </div>
      )}
    </div>
  )
}
