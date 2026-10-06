import { useMemo, useState } from 'react'
import { formatarAgrupamento } from '@/lib/formatadores'
import { Link } from 'react-router-dom'
import {
  Wallet, ChevronLeft, Loader2, Download, Plus, ArrowDownCircle, ArrowUpCircle, Trash2, ChevronDown, ChevronUp,
} from 'lucide-react'
import { dioceseHooks, vigarariaHooks, agrupamentoHooks } from '@/hooks/useEstrutura'
import {
  useSaldoTesouraria, useMovimentosTesouraria, useRubricasTesouraria, useRelatorioSeccoesTesouraria,
  useRegistarSaldoInicial, useLancarEntrada, useLancarSaida, useRemoverMovimentoTesouraria,
  exportarMapaTesourariaUrl,
} from '@/hooks/useTesouraria'
import { usePermissao } from '@/hooks/usePermissao'
import { baixarFicheiroProtegido } from '@/lib/download'
import { getApiErrorMessage } from '@/lib/api'
import { notificar } from '@/lib/notificar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Campo, TextField, SelectField } from '@/components/crud/FormShell'
import type { NivelTesouraria, TipoMovimentoTesouraria } from '@/types/tesouraria'

const NIVEIS: { valor: NivelTesouraria; label: string }[] = [
  { valor: 'agrupamento', label: 'Agrupamento' },
  { valor: 'vigararia', label: 'Vigararia' },
  { valor: 'diocese', label: 'Diocese' },
  { valor: 'nacional', label: 'Nacional' },
]

const LABEL_TIPO: Record<TipoMovimentoTesouraria, string> = {
  saldo_inicial: 'Saldo Inicial',
  entrada: 'Entrada',
  saida: 'Saída',
}

const SECCOES = ['Alcateia', 'Castores', 'Exploradores Juniores', 'Flotilha', 'Exploradores Seniores', 'Frota', 'Clã', 'Comunidade']

function formatarKz(valor: number) {
  return `${valor.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz`
}

export function TesourariaPage() {
  const [nivel, setNivel] = useState<NivelTesouraria>('agrupamento')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [estruturaId, setEstruturaId] = useState<number | undefined>()
  const [formAberto, setFormAberto] = useState<TipoMovimentoTesouraria | null>(null)
  const [aExportar, setAExportar] = useState(false)
  const [relatorioSeccaoAberto, setRelatorioSeccaoAberto] = useState(false)

  const permissao = usePermissao('Finanças')

  const { data: dioceses } = dioceseHooks.useList()
  const { data: vigararias } = vigarariaHooks.useList()
  const { data: agrupamentos } = agrupamentoHooks.useList()

  const opcoesEstrutura = useMemo(() => {
    if (nivel === 'diocese') return (dioceses ?? []).map((d) => ({ id: d.id, nome: d.nome }))
    if (nivel === 'vigararia') return (vigararias ?? []).map((v) => ({ id: v.id, nome: v.nome }))
    if (nivel === 'agrupamento') {
      return [...(agrupamentos ?? [])]
        .sort((x, y) => (Number(x.ab_agrupamento) || 0) - (Number(y.ab_agrupamento) || 0))
        .map((a) => ({ id: a.id, nome: formatarAgrupamento(a) }))
    }
    return []
  }, [nivel, dioceses, vigararias, agrupamentos])

  const nomeEstrutura = opcoesEstrutura.find((o) => o.id === estruturaId)?.nome

  const contaPronta = nivel === 'nacional' || estruturaId !== undefined
  const conta = contaPronta
    ? { nivel, estruturaId: nivel === 'nacional' ? null : (estruturaId ?? null), dataInicio: dataInicio || undefined, dataFim: dataFim || undefined }
    : null

  const { data: saldo, isLoading: aCarregarSaldo } = useSaldoTesouraria(conta)
  const { data: movimentos, isLoading: aCarregarMovimentos } = useMovimentosTesouraria(conta)
  const { data: rubricas } = useRubricasTesouraria()
  const { data: relatorioSeccoes, isLoading: aCarregarRelatorioSeccoes } = useRelatorioSeccoesTesouraria(
    relatorioSeccaoAberto ? conta : null,
  )

  const registarSaldoInicial = useRegistarSaldoInicial()
  const lancarEntrada = useLancarEntrada()
  const lancarSaida = useLancarSaida()
  const removerMovimento = useRemoverMovimentoTesouraria()

  function handleMudarNivel(novoNivel: NivelTesouraria) {
    setNivel(novoNivel)
    setEstruturaId(undefined)
    setFormAberto(null)
  }

  async function handleExportar() {
    if (!conta) return
    setAExportar(true)
    try {
      await baixarFicheiroProtegido(exportarMapaTesourariaUrl(conta, nomeEstrutura), `mapa-financeiro-${nivel}.xlsx`)
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível exportar o mapa financeiro.'))
    } finally {
      setAExportar(false)
    }
  }

  async function handleRemover(id: number) {
    if (!confirm('Remover este lançamento?')) return
    try {
      await removerMovimento.mutateAsync(id)
      notificar.sucesso('Lançamento removido.')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível remover o lançamento.'))
    }
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-7">
      <Link to="/financas" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-text">
        <ChevronLeft className="size-3.5" /> Voltar a Finanças
      </Link>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <Wallet className="size-5 text-muted" /> Tesouraria
        </h1>
        {conta && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportar}
            loading={aExportar}
            title="Descarrega o mapa financeiro geral e o relatório por Secção num único ficheiro Excel"
          >
            <Download className="size-3.5" /> Exportar Mapa Financeiro
          </Button>
        )}
      </div>

      <Card className="mb-5 flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[160px]">
          <Campo label="Nível">
            <SelectField value={nivel} onChange={(e) => handleMudarNivel(e.target.value as NivelTesouraria)}>
              {NIVEIS.map((n) => <option key={n.valor} value={n.valor}>{n.label}</option>)}
            </SelectField>
          </Campo>
        </div>
        {nivel !== 'nacional' && (
          <div className="min-w-[220px] flex-1">
            <Campo label={NIVEIS.find((n) => n.valor === nivel)?.label ?? ''}>
              <SelectField value={estruturaId ?? ''} onChange={(e) => setEstruturaId(Number(e.target.value) || undefined)}>
                <option value="">-- Seleccionar --</option>
                {opcoesEstrutura.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
              </SelectField>
            </Campo>
          </div>
        )}
        <div className="min-w-[150px]">
          <Campo label="De">
            <TextField type="date" value={dataInicio} max={dataFim || undefined} onChange={(e) => setDataInicio(e.target.value)} />
          </Campo>
        </div>
        <div className="min-w-[150px]">
          <Campo label="Até">
            <TextField type="date" value={dataFim} min={dataInicio || undefined} onChange={(e) => setDataFim(e.target.value)} />
          </Campo>
        </div>
        {(dataInicio || dataFim) && (
          <button type="button" onClick={() => { setDataInicio(''); setDataFim('') }} className="mb-1 text-[12px] font-medium text-muted underline hover:text-text">
            Limpar datas
          </button>
        )}
      </Card>

      {!conta && (
        <Card className="p-10 text-center text-[13px] text-subtle">Selecciona a conta de tesouraria para consultar.</Card>
      )}

      {conta && (
        <>
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card className="p-4">
              <p className="text-[11px] font-medium uppercase text-subtle">Saldo Disponível</p>
              <p className="mt-1 text-xl font-bold text-text">
                {aCarregarSaldo ? <Loader2 className="size-4 animate-spin" /> : formatarKz(saldo?.saldo_disponivel ?? 0)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-[11px] font-medium uppercase text-subtle">Total de Entradas</p>
              <p className="mt-1 text-lg font-bold text-badge-green-text">{formatarKz(saldo?.total_entradas ?? 0)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-[11px] font-medium uppercase text-subtle">Total de Saídas</p>
              <p className="mt-1 text-lg font-bold text-badge-red-text">{formatarKz(saldo?.total_saidas ?? 0)}</p>
            </Card>
          </div>

          {permissao.criar && (
            <div className="mb-4 flex flex-wrap gap-2">
              {!saldo?.tem_saldo_inicial && (
                <button
                  onClick={() => setFormAberto('saldo_inicial')}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-[13px] font-semibold text-text transition hover:bg-bg"
                >
                  <Plus className="size-3.5" /> Registar Saldo Inicial
                </button>
              )}
              <button
                onClick={() => setFormAberto('entrada')}
                className="flex items-center gap-1.5 rounded-lg bg-badge-green-bg px-3.5 py-2 text-[13px] font-semibold text-badge-green-text transition hover:opacity-80"
              >
                <ArrowDownCircle className="size-3.5" /> Lançar Entrada
              </button>
              <button
                onClick={() => setFormAberto('saida')}
                className="flex items-center gap-1.5 rounded-lg bg-badge-red-bg px-3.5 py-2 text-[13px] font-semibold text-badge-red-text transition hover:opacity-80"
              >
                <ArrowUpCircle className="size-3.5" /> Lançar Saída
              </button>
            </div>
          )}

          {formAberto && (
            <FormMovimento
              tipo={formAberto}
              rubricas={rubricas ?? []}
              aGuardar={registarSaldoInicial.isPending || lancarEntrada.isPending || lancarSaida.isPending}
              onCancelar={() => setFormAberto(null)}
              onSubmeter={async (dados) => {
                try {
                  const base = { nivel, estrutura_id: estruturaId, ...dados }
                  if (formAberto === 'saldo_inicial') await registarSaldoInicial.mutateAsync(base)
                  else if (formAberto === 'entrada') await lancarEntrada.mutateAsync(base)
                  else await lancarSaida.mutateAsync(base)
                  notificar.sucesso('Lançamento registado.')
                  setFormAberto(null)
                } catch (err) {
                  notificar.erro(getApiErrorMessage(err, 'Não foi possível registar o lançamento.'))
                }
              }}
            />
          )}

          <Card className="mb-5 overflow-hidden">
            <button
              onClick={() => setRelatorioSeccaoAberto((v) => !v)}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
            >
              <span className="text-sm font-semibold text-text">Relatório por Secção</span>
              {relatorioSeccaoAberto ? <ChevronUp className="size-4 text-muted" /> : <ChevronDown className="size-4 text-muted" />}
            </button>
            {relatorioSeccaoAberto && (
              <div className="overflow-x-auto border-t border-border">
                <table className="w-full text-left text-[12.5px]">
                  <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-3.5 py-2.5 font-medium">Secção</th>
                      <th className="px-3.5 py-2.5 font-medium">Entradas</th>
                      <th className="px-3.5 py-2.5 font-medium">Saídas</th>
                      <th className="px-3.5 py-2.5 font-medium">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {aCarregarRelatorioSeccoes && (
                      <tr><td colSpan={4} className="py-10 text-center text-subtle"><Loader2 className="mx-auto size-5 animate-spin" /></td></tr>
                    )}
                    {!aCarregarRelatorioSeccoes && relatorioSeccoes?.length === 0 && (
                      <tr><td colSpan={4} className="py-10 text-center text-subtle">Sem movimentos com Secção nesta conta.</td></tr>
                    )}
                    {relatorioSeccoes?.map((r) => (
                      <tr key={r.seccao ?? '__sem_seccao__'} className="transition-colors hover:bg-bg">
                        <td className="px-3.5 py-2.5 text-text">{r.seccao ?? '— Sem Secção —'}</td>
                        <td className="px-3.5 py-2.5 text-badge-green-text">{formatarKz(r.total_entradas)}</td>
                        <td className="px-3.5 py-2.5 text-badge-red-text">{formatarKz(r.total_saidas)}</td>
                        <td className="px-3.5 py-2.5 font-medium text-text">{formatarKz(r.saldo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3.5 py-2.5 font-medium">Data</th>
                  <th className="px-3.5 py-2.5 font-medium">Tipo</th>
                  <th className="px-3.5 py-2.5 font-medium">Rubrica</th>
                  <th className="px-3.5 py-2.5 font-medium">Secção</th>
                  <th className="px-3.5 py-2.5 font-medium">Descrição</th>
                  <th className="px-3.5 py-2.5 font-medium">Valor</th>
                  <th className="px-3.5 py-2.5 font-medium">Por</th>
                  {permissao.apagar && <th className="px-3.5 py-2.5 text-center font-medium">Acções</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {aCarregarMovimentos && (
                  <tr><td colSpan={8} className="py-16 text-center text-subtle"><Loader2 className="mx-auto size-5 animate-spin" /></td></tr>
                )}
                {!aCarregarMovimentos && movimentos?.length === 0 && (
                  <tr><td colSpan={8} className="py-16 text-center text-subtle">Sem lançamentos nesta conta.</td></tr>
                )}
                {movimentos?.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-bg">
                    <td className="px-3.5 py-2.5 text-muted">{new Date(m.data_movimento).toLocaleDateString('pt-PT')}</td>
                    <td className="px-3.5 py-2.5">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        m.tipo === 'entrada' ? 'bg-badge-green-bg text-badge-green-text'
                          : m.tipo === 'saida' ? 'bg-badge-red-bg text-badge-red-text'
                          : 'bg-badge-blue-bg text-badge-blue-text'
                      }`}>
                        {LABEL_TIPO[m.tipo]}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-muted">{m.rubrica_nome ?? '—'}</td>
                    <td className="px-3.5 py-2.5 text-muted">{m.seccao ?? '—'}</td>
                    <td className="px-3.5 py-2.5 text-muted">{m.descricao ?? '—'}</td>
                    <td className="px-3.5 py-2.5 font-medium text-text">{formatarKz(Number(m.valor))}</td>
                    <td className="px-3.5 py-2.5 text-muted">{m.criado_por_nome ?? '—'}</td>
                    {permissao.apagar && (
                      <td className="px-3.5 py-2.5 text-center">
                        <button onClick={() => handleRemover(m.id)} className="rounded-lg border border-red-200 px-2.5 py-1 text-[11px] text-red-500 transition hover:bg-red-50">
                          <Trash2 className="size-3" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  )
}

function FormMovimento({
  tipo, rubricas, aGuardar, onCancelar, onSubmeter,
}: {
  tipo: TipoMovimentoTesouraria
  rubricas: { id: number; tipo: 'receita' | 'despesa'; nome: string }[]
  aGuardar: boolean
  onCancelar: () => void
  onSubmeter: (dados: { valor: number; descricao?: string; data_movimento: string; rubrica_id?: number; seccao?: string }) => void
}) {
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [dataMovimento, setDataMovimento] = useState(new Date().toISOString().slice(0, 10))
  const [rubricaId, setRubricaId] = useState<number | undefined>()
  const [seccao, setSeccao] = useState('')

  const rubricasFiltradas = rubricas.filter((r) => r.tipo === (tipo === 'entrada' ? 'receita' : 'despesa'))

  return (
    <Card className="mb-4 space-y-3 p-4">
      <h3 className="text-sm font-semibold text-text">
        {tipo === 'saldo_inicial' ? 'Registar Saldo Inicial' : tipo === 'entrada' ? 'Lançar Entrada' : 'Lançar Saída'}
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Campo label="Valor (Kz)">
          <TextField type="number" min="0" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} />
        </Campo>
        <Campo label="Data">
          <TextField type="date" value={dataMovimento} onChange={(e) => setDataMovimento(e.target.value)} />
        </Campo>
        {tipo !== 'saldo_inicial' && (
          <Campo label="Rubrica">
            <SelectField value={rubricaId ?? ''} onChange={(e) => setRubricaId(Number(e.target.value) || undefined)}>
              <option value="">-- Seleccionar --</option>
              {rubricasFiltradas.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}
            </SelectField>
          </Campo>
        )}
        {tipo !== 'saldo_inicial' && (
          <Campo label="Secção (opcional)">
            <SelectField value={seccao} onChange={(e) => setSeccao(e.target.value)}>
              <option value="">— Sem Secção —</option>
              {SECCOES.map((s) => <option key={s} value={s}>{s}</option>)}
            </SelectField>
          </Campo>
        )}
        <Campo label={tipo === 'saldo_inicial' ? 'Descrição (opcional)' : 'Descrição'}>
          <TextField value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </Campo>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="secondary" size="sm" onClick={onCancelar}>Cancelar</Button>
        <Button
          size="sm"
          loading={aGuardar}
          onClick={() => onSubmeter({
            valor: Number(valor), descricao: descricao || undefined, data_movimento: dataMovimento, rubrica_id: rubricaId, seccao: seccao || undefined,
          })}
        >
          Guardar
        </Button>
      </div>
    </Card>
  )
}
