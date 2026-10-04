import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { UserRound, Search, Plus, Loader2, CircleCheck, CircleX, Trash2, Download } from 'lucide-react'
import { useUtilizadores } from '@/hooks/useUtilizadores'
import { useOpcoesFiltro } from '@/hooks/useDashboardPainel'
import { useAlterarEstadoMassa, useEliminarMassa, useExportarMassa } from '@/hooks/useUtilizadoresMassa'
import { usePermissao } from '@/hooks/usePermissao'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { PaginacaoServidor } from '@/components/crud/PaginacaoServidor'
import { BadgeEstadoUtilizador } from '@/components/crud/BadgesEstado'
import { uploadUrl } from '@/lib/uploads'
import { formatarAgrupamento } from '@/lib/formatadores'
import { useSelecaoMultipla } from '@/hooks/useSelecaoMultipla'
import { SelecaoMultiplaBar } from '@/components/crud/SelecaoMultiplaBar'
import { useConfirmar } from '@/components/ui/ConfirmProvider'
import { notificar } from '@/lib/notificar'
import { getApiErrorMessage } from '@/lib/api'
import { exportarExcel, exportarPdf } from '@/lib/exportar'
import type { FiltrosUtilizadores, EstadoUtilizador, Genero } from '@/types/utilizador'

const COLUNAS_EXPORTACAO_ESCUTEIROS = [
  { titulo: 'Nº SIGECA', valor: (l: any) => l.codigo_associado ?? '—' },
  { titulo: 'Nome', valor: (l: any) => l.nome ?? '—' },
  { titulo: 'Agrupamento', valor: (l: any) => l.agrupamento_nome ? formatarAgrupamento({ nome: l.agrupamento_nome, ab_agrupamento: l.ab_agrupamento }) : '—' },
  { titulo: 'Diocese', valor: (l: any) => l.diocese_nome ?? '—' },
  { titulo: 'Estado', valor: (l: any) => l.estado ?? '—' },
]

const ESTADOS: EstadoUtilizador[] = ['ACTIVO', 'VALIDATION', 'INATIVO', 'TRANSFERIDO', 'FALECIDO', 'PARTIDA']

export function UtilizadoresLista() {
  const [searchParams] = useSearchParams()
  const perfilIdInicial = searchParams.get('perfilId')
  const [filtros, setFiltros] = useState<FiltrosUtilizadores>({
    pagina: 1, porPagina: 25,
    perfilId: perfilIdInicial ? Number(perfilIdInicial) : undefined,
  })
  const [pesquisaRascunho, setPesquisaRascunho] = useState('')

  const dioceses = useOpcoesFiltro('dioceses')
  const vigararias = useOpcoesFiltro('vigararias', filtros.dioceseId)
  const paroquias = useOpcoesFiltro('paroquias', filtros.vigarariaId)
  const agrupamentos = useOpcoesFiltro('agrupamentos', filtros.paroquiaId)

  const permissoes = usePermissao('Escuteiros')
  const { data, isLoading, isFetching } = useUtilizadores(filtros)
  const idsDaPagina = data?.dados.map((u) => u.id) ?? []
  const selecao = useSelecaoMultipla(idsDaPagina, data?.paginacao.total ?? 0)

  const alterarEstadoMassa = useAlterarEstadoMassa()
  const eliminarMassa = useEliminarMassa()
  const exportarMassa = useExportarMassa()
  const confirmar = useConfirmar()

  function construirAlvo() {
    if (selecao.todosOsResultados) {
      const { pagina: _pagina, porPagina: _porPagina, ...filtrosSemPaginacao } = filtros
      return { filtros: filtrosSemPaginacao } as const
    }
    return { ids: selecao.idsSelecionados } as const
  }

  async function handleActivarMassa() {
    try {
      await alterarEstadoMassa.mutateAsync({ acao: 'activar', ...construirAlvo() })
      notificar.sucesso(`${selecao.totalSelecionado} escuteiro(s) activado(s).`)
      selecao.limpar()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível activar os escuteiros seleccionados.'))
    }
  }

  async function handleDesativarMassa() {
    try {
      await alterarEstadoMassa.mutateAsync({ acao: 'desativar', ...construirAlvo() })
      notificar.sucesso(`${selecao.totalSelecionado} escuteiro(s) desactivado(s).`)
      selecao.limpar()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível desactivar os escuteiros seleccionados.'))
    }
  }

  async function handleEliminarMassa() {
    const ok = await confirmar({
      titulo: 'Eliminar escuteiros',
      mensagem: `Eliminar ${selecao.totalSelecionado} escuteiro${selecao.totalSelecionado !== 1 ? 's' : ''}? Esta acção não pode ser desfeita a partir daqui.`,
      textoConfirmar: 'Eliminar',
      perigoso: true,
    })
    if (!ok) return
    try {
      await eliminarMassa.mutateAsync(construirAlvo())
      notificar.sucesso(`${selecao.totalSelecionado} escuteiro(s) eliminado(s).`)
      selecao.limpar()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível eliminar os escuteiros seleccionados.'))
    }
  }

  async function handleExportarMassa(formato: 'excel' | 'pdf') {
    try {
      const linhas = await exportarMassa.mutateAsync(construirAlvo())
      const nomeFicheiro = `escuteiros-${new Date().toISOString().slice(0, 10)}`
      if (formato === 'excel') exportarExcel(nomeFicheiro, COLUNAS_EXPORTACAO_ESCUTEIROS, linhas)
      else exportarPdf(nomeFicheiro, 'Listagem de Escuteiros', COLUNAS_EXPORTACAO_ESCUTEIROS, linhas)
      notificar.sucesso('Exportação concluída.')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível exportar.'))
    }
  }

  function aplicar(parcial: Partial<FiltrosUtilizadores>) {
    setFiltros((f) => ({ ...f, ...parcial, pagina: 1 }))
  }

  function submeterPesquisa(e: React.FormEvent) {
    e.preventDefault()
    aplicar({ pesquisa: pesquisaRascunho })
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-7">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <UserRound className="size-5 text-muted" /> {filtros.perfilId ? 'Dirigentes' : 'Escuteiros'}
          {filtros.perfilId && (
            <button
              onClick={() => setFiltros((f) => ({ ...f, perfilId: undefined, pagina: 1 }))}
              className="rounded-full bg-bg px-2.5 py-0.5 text-[11px] font-medium text-muted hover:bg-border"
            >
              Ver todos ✕
            </button>
          )}
          {data && <span className="text-sm font-normal text-subtle">({data.paginacao.total.toLocaleString('pt-PT')})</span>}
        </h1>
        <div className="flex items-center gap-2">
          <ExportarBotoes
            tamanho="sm"
            nomeFicheiro="escuteiros-pagina-atual"
            titulo="Listagem de Escuteiros"
            subtitulo="Página actual — usa o botão Exportar na barra de selecção para exportar todos os resultados do filtro."
            colunas={COLUNAS_EXPORTACAO_ESCUTEIROS}
            linhas={data?.dados ?? []}
          />
          <Link
            to="/utilizadores/novo"
            className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-black"
          >
            <Plus className="size-3.5" /> Novo Escuteiro
          </Link>
        </div>
      </div>

      <Card className="mb-4 space-y-3 p-4">
        <form onSubmit={submeterPesquisa} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
            <input
              value={pesquisaRascunho}
              onChange={(e) => setPesquisaRascunho(e.target.value)}
              placeholder="Nome ou Nº SIGECA..."
              className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]"
            />
          </div>
          <button type="submit" className="rounded-lg bg-bg px-4 text-[13px] font-medium text-text transition hover:bg-border">
            Pesquisar
          </button>
        </form>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Select label="Diocese" value={filtros.dioceseId} opcoes={dioceses.data}
            onChange={(v) => aplicar({ dioceseId: v, vigarariaId: undefined, paroquiaId: undefined, agrupamentoId: undefined })} />
          <Select label="Vigararia" value={filtros.vigarariaId} opcoes={vigararias.data}
            onChange={(v) => aplicar({ vigarariaId: v, paroquiaId: undefined, agrupamentoId: undefined })} />
          <Select label="Paróquia" value={filtros.paroquiaId} opcoes={paroquias.data}
            onChange={(v) => aplicar({ paroquiaId: v, agrupamentoId: undefined })} />
          <Select label="Agrupamento" value={filtros.agrupamentoId} opcoes={agrupamentos.data}
            onChange={(v) => aplicar({ agrupamentoId: v })} />
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-subtle">Estado</label>
            <select
              value={filtros.estado ?? ''}
              onChange={(e) => aplicar({ estado: e.target.value as EstadoUtilizador | '' })}
              className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]"
            >
              <option value="">Todos os estados</option>
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-subtle">Género</label>
            <select
              value={filtros.genero ?? ''}
              onChange={(e) => aplicar({ genero: e.target.value as Genero | '' })}
              className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]"
            >
              <option value="">Todos</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
          </div>
        </div>
      </Card>

      <SelecaoMultiplaBar
        totalSelecionado={selecao.totalSelecionado}
        todosOsResultados={selecao.todosOsResultados}
        todosDaPaginaSelecionados={selecao.todosDaPaginaSelecionados}
        totalGeral={data?.paginacao.total ?? 0}
        totalNaPagina={idsDaPagina.length}
        onSelecionarTodosOsResultados={selecao.selecionarTodosOsResultados}
        onLimpar={selecao.limpar}
      >
        {permissoes.editar && (
          <>
            <button onClick={handleActivarMassa} disabled={alterarEstadoMassa.isPending} className="flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 text-[12px] font-medium hover:bg-white/20 disabled:opacity-50">
              <CircleCheck className="size-3.5" /> Activar
            </button>
            <button onClick={handleDesativarMassa} disabled={alterarEstadoMassa.isPending} className="flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 text-[12px] font-medium hover:bg-white/20 disabled:opacity-50">
              <CircleX className="size-3.5" /> Desactivar
            </button>
          </>
        )}
        {permissoes.ver && (
          <>
            <button onClick={() => handleExportarMassa('pdf')} disabled={exportarMassa.isPending} className="flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 text-[12px] font-medium hover:bg-white/20 disabled:opacity-50">
              <Download className="size-3.5" /> PDF
            </button>
            <button onClick={() => handleExportarMassa('excel')} disabled={exportarMassa.isPending} className="flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 text-[12px] font-medium hover:bg-white/20 disabled:opacity-50">
              <Download className="size-3.5" /> Excel
            </button>
          </>
        )}
        {permissoes.apagar && (
          <button onClick={handleEliminarMassa} disabled={eliminarMassa.isPending} className="flex items-center gap-1 rounded-md bg-red-500/20 px-2.5 py-1 text-[12px] font-medium text-red-100 hover:bg-red-500/30 disabled:opacity-50">
            <Trash2 className="size-3.5" /> Eliminar
          </button>
        )}
      </SelecaoMultiplaBar>

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="w-10 px-3.5 py-2.5">
                <input
                  type="checkbox"
                  checked={selecao.todosDaPaginaSelecionados}
                  onChange={selecao.alternarPagina}
                  className="size-4"
                  aria-label="Seleccionar todos os desta página"
                />
              </th>
              <th className="px-3.5 py-2.5 font-medium">Escuteiro</th>
              <th className="px-3.5 py-2.5 font-medium">Nº SIGECA</th>
              <th className="px-3.5 py-2.5 font-medium">Agrupamento</th>
              <th className="px-3.5 py-2.5 font-medium">Secção</th>
              <th className="px-3.5 py-2.5 font-medium">Diocese</th>
              <th className="px-3.5 py-2.5 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr><td colSpan={7} className="py-16 text-center text-subtle"><Loader2 className="mx-auto size-5 animate-spin" /></td></tr>
            )}
            {!isLoading && data?.dados.length === 0 && (
              <tr><td colSpan={7} className="py-16 text-center text-subtle">Nenhum escuteiro encontrado.</td></tr>
            )}
            {!isLoading && data?.dados.map((u) => (
              <tr key={u.id} className={`transition-colors hover:bg-bg ${isFetching ? 'opacity-60' : ''} ${selecao.estaSelecionado(u.id) ? 'bg-bg' : ''}`}>
                <td className="px-3.5 py-2.5">
                  <input
                    type="checkbox"
                    checked={selecao.estaSelecionado(u.id)}
                    onChange={() => selecao.alternarItem(u.id)}
                    className="size-4"
                    aria-label={`Seleccionar ${u.nome}`}
                  />
                </td>
                <td className="px-3.5 py-2.5">
                  <Link to={`/utilizadores/${u.id}`} className="flex items-center gap-2.5 hover:underline">
                    <div className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-bg text-[10px] font-semibold text-muted">
                      {u.foto ? (
                        <img src={uploadUrl('avatar', u.foto)!} className="size-full object-cover" alt="" />
                      ) : (
                        u.nome[0]?.toUpperCase()
                      )}
                    </div>
                    <span className="font-medium text-text">{u.nome}</span>
                  </Link>
                </td>
                <td className="px-3.5 py-2.5 font-mono text-muted">{u.codigo_associado}</td>
                <td className="px-3.5 py-2.5 text-muted">{u.agrupamento_nome ? formatarAgrupamento({ nome: u.agrupamento_nome, ab_agrupamento: u.ab_agrupamento }) : '—'}</td>
                <td className="px-3.5 py-2.5 text-muted">{u.seccao_nome ?? '—'}</td>
                <td className="px-3.5 py-2.5 text-muted">{u.diocese_nome ?? '—'}</td>
                <td className="px-3.5 py-2.5"><BadgeEstadoUtilizador estado={u.estado} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-4">
        <PaginacaoServidor paginacao={data?.paginacao} onMudarPagina={(pagina) => setFiltros((f) => ({ ...f, pagina }))} />
      </div>
    </div>
  )
}

function Select({
  label, value, opcoes, onChange,
}: {
  label: string
  value: number | undefined
  opcoes: { id: number; nome: string; ab_agrupamento?: string | null }[] | undefined
  onChange: (v: number | undefined) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-subtle">{label}</label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]"
      >
        <option value="">Todas/os</option>
        {opcoes?.map((o) => <option key={o.id} value={o.id}>{formatarAgrupamento(o)}</option>)}
      </select>
    </div>
  )
}
