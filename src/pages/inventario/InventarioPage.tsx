import { useMemo, useState } from 'react'
import {
  Boxes, Loader2, Plus, ArrowDownCircle, ArrowUpCircle, AlertTriangle, ArrowLeftRight, History, Trash2, X,
} from 'lucide-react'
import { dioceseHooks, vigarariaHooks, agrupamentoHooks } from '@/hooks/useEstrutura'
import {
  useItensInventario, useMovimentosInventarioItem, useCriarItemInventario, useRemoverItemInventario,
  useEntradaInventario, useSaidaInventario, useBaixaInventario, useTransferirInventario,
} from '@/hooks/useInventario'
import { usePermissao } from '@/hooks/usePermissao'
import { getApiErrorMessage } from '@/lib/api'
import { notificar } from '@/lib/notificar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Campo, TextField, SelectField } from '@/components/crud/FormShell'
import type { EstadoMaterial, ItemInventario, NivelInventario } from '@/types/inventario'

const NIVEIS: { valor: NivelInventario; label: string }[] = [
  { valor: 'agrupamento', label: 'Agrupamento' },
  { valor: 'vigararia', label: 'Vigararia' },
  { valor: 'diocese', label: 'Diocese' },
  { valor: 'sede', label: 'Sede' },
]

const CORES_ESTADO: Record<EstadoMaterial, string> = {
  bom: 'bg-badge-green-bg text-badge-green-text',
  regular: 'bg-badge-orange-bg text-badge-orange-text',
  danificado: 'bg-badge-red-bg text-badge-red-text',
  inutilizado: 'bg-bg text-muted',
}

type Accao = 'entrada' | 'saida' | 'baixa' | 'transferencia'

export function InventarioPage() {
  const [nivel, setNivel] = useState<NivelInventario>('agrupamento')
  const [estruturaId, setEstruturaId] = useState<number | undefined>()
  const [novoAberto, setNovoAberto] = useState(false)
  const [accao, setAccao] = useState<{ item: ItemInventario; tipo: Accao } | null>(null)
  const [historicoItem, setHistoricoItem] = useState<ItemInventario | null>(null)

  const permissao = usePermissao('Inventário')

  const { data: dioceses } = dioceseHooks.useList()
  const { data: vigararias } = vigarariaHooks.useList()
  const { data: agrupamentos } = agrupamentoHooks.useList()

  const opcoesEstrutura = useMemo(() => {
    if (nivel === 'diocese') return (dioceses ?? []).map((d) => ({ id: d.id, nome: d.nome }))
    if (nivel === 'vigararia') return (vigararias ?? []).map((v) => ({ id: v.id, nome: v.nome }))
    if (nivel === 'agrupamento') return (agrupamentos ?? []).map((a) => ({ id: a.id, nome: a.nome }))
    return []
  }, [nivel, dioceses, vigararias, agrupamentos])

  const contaPronta = nivel === 'sede' || estruturaId !== undefined
  const conta = contaPronta ? { nivel, estruturaId: nivel === 'sede' ? null : (estruturaId ?? null) } : null

  const { data: itens, isLoading } = useItensInventario(conta)
  const criarItem = useCriarItemInventario()
  const removerItem = useRemoverItemInventario()

  function handleMudarNivel(novoNivel: NivelInventario) {
    setNivel(novoNivel)
    setEstruturaId(undefined)
  }

  async function handleRemover(item: ItemInventario) {
    if (!confirm(`Remover "${item.nome}" do inventário?`)) return
    try {
      await removerItem.mutateAsync(item.id)
      notificar.sucesso('Material removido.')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível remover o material.'))
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <Boxes className="size-5 text-muted" /> Inventário
        </h1>
        {conta && permissao.criar && (
          <button
            onClick={() => setNovoAberto(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-black"
          >
            <Plus className="size-3.5" /> Novo Material
          </button>
        )}
      </div>

      <Card className="mb-5 flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[160px]">
          <Campo label="Nível">
            <SelectField value={nivel} onChange={(e) => handleMudarNivel(e.target.value as NivelInventario)}>
              {NIVEIS.map((n) => <option key={n.valor} value={n.valor}>{n.label}</option>)}
            </SelectField>
          </Campo>
        </div>
        {nivel !== 'sede' && (
          <div className="min-w-[220px] flex-1">
            <Campo label={NIVEIS.find((n) => n.valor === nivel)?.label ?? ''}>
              <SelectField value={estruturaId ?? ''} onChange={(e) => setEstruturaId(Number(e.target.value) || undefined)}>
                <option value="">-- Seleccionar --</option>
                {opcoesEstrutura.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
              </SelectField>
            </Campo>
          </div>
        )}
      </Card>

      {!conta && <Card className="p-10 text-center text-[13px] text-subtle">Selecciona a estrutura para consultar o inventário.</Card>}

      {conta && (
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3.5 py-2.5 font-medium">Material</th>
                <th className="px-3.5 py-2.5 font-medium">Categoria</th>
                <th className="px-3.5 py-2.5 font-medium">Quantidade</th>
                <th className="px-3.5 py-2.5 font-medium">Localização</th>
                <th className="px-3.5 py-2.5 font-medium">Estado</th>
                <th className="px-3.5 py-2.5 text-center font-medium">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr><td colSpan={6} className="py-16 text-center text-subtle"><Loader2 className="mx-auto size-5 animate-spin" /></td></tr>
              )}
              {!isLoading && itens?.length === 0 && (
                <tr><td colSpan={6} className="py-16 text-center text-subtle">Sem material registado nesta estrutura.</td></tr>
              )}
              {itens?.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-bg">
                  <td className="px-3.5 py-2.5 font-medium text-text">{item.nome}</td>
                  <td className="px-3.5 py-2.5 text-muted">{item.categoria ?? '—'}</td>
                  <td className="px-3.5 py-2.5 font-medium text-text">{item.quantidade}</td>
                  <td className="px-3.5 py-2.5 text-muted">{item.localizacao ?? '—'}</td>
                  <td className="px-3.5 py-2.5">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CORES_ESTADO[item.estado]}`}>{item.estado}</span>
                  </td>
                  <td className="px-3.5 py-2.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button title="Histórico" onClick={() => setHistoricoItem(item)} className="grid size-7 place-items-center rounded-lg border border-border text-muted transition hover:bg-bg">
                        <History className="size-3.5" />
                      </button>
                      {permissao.editar && (
                        <>
                          <button title="Entrada" onClick={() => setAccao({ item, tipo: 'entrada' })} className="grid size-7 place-items-center rounded-lg bg-badge-green-bg text-badge-green-text transition hover:opacity-80">
                            <ArrowDownCircle className="size-3.5" />
                          </button>
                          <button title="Saída" onClick={() => setAccao({ item, tipo: 'saida' })} className="grid size-7 place-items-center rounded-lg bg-badge-orange-bg text-badge-orange-text transition hover:opacity-80">
                            <ArrowUpCircle className="size-3.5" />
                          </button>
                          <button title="Transferir" onClick={() => setAccao({ item, tipo: 'transferencia' })} className="grid size-7 place-items-center rounded-lg bg-badge-blue-bg text-badge-blue-text transition hover:opacity-80">
                            <ArrowLeftRight className="size-3.5" />
                          </button>
                          <button title="Baixa (danificado/inutilizado)" onClick={() => setAccao({ item, tipo: 'baixa' })} className="grid size-7 place-items-center rounded-lg bg-badge-red-bg text-badge-red-text transition hover:opacity-80">
                            <AlertTriangle className="size-3.5" />
                          </button>
                        </>
                      )}
                      {permissao.apagar && (
                        <button title="Remover" onClick={() => handleRemover(item)} className="grid size-7 place-items-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50">
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {novoAberto && conta && (
        <ModalNovoItem
          nivel={nivel}
          estruturaId={estruturaId}
          aGuardar={criarItem.isPending}
          onCancelar={() => setNovoAberto(false)}
          onSubmeter={async (dados) => {
            try {
              await criarItem.mutateAsync(dados)
              notificar.sucesso('Material registado.')
              setNovoAberto(false)
            } catch (err) {
              notificar.erro(getApiErrorMessage(err, 'Não foi possível registar o material.'))
            }
          }}
        />
      )}

      {accao && <ModalAccao item={accao.item} tipo={accao.tipo} onClose={() => setAccao(null)} />}
      {historicoItem && <ModalHistorico item={historicoItem} onClose={() => setHistoricoItem(null)} />}
    </div>
  )
}

function ModalNovoItem({
  nivel, estruturaId, aGuardar, onCancelar, onSubmeter,
}: {
  nivel: NivelInventario
  estruturaId: number | undefined
  aGuardar: boolean
  onCancelar: () => void
  onSubmeter: (dados: { nivel: NivelInventario; estrutura_id?: number; nome: string; categoria?: string; quantidade?: number; localizacao?: string; estado?: EstadoMaterial; observacoes?: string }) => void
}) {
  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState('')
  const [quantidade, setQuantidade] = useState('0')
  const [localizacao, setLocalizacao] = useState('')
  const [estado, setEstado] = useState<EstadoMaterial>('bom')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancelar}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">Novo Material</h2>
          <button onClick={onCancelar} className="text-subtle hover:text-text"><X className="size-5" /></button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <Campo label="Nome do material"><TextField required value={nome} onChange={(e) => setNome(e.target.value)} /></Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Categoria (opcional)"><TextField value={categoria} onChange={(e) => setCategoria(e.target.value)} /></Campo>
            <Campo label="Quantidade"><TextField type="number" min="0" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} /></Campo>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Localização (opcional)"><TextField value={localizacao} onChange={(e) => setLocalizacao(e.target.value)} /></Campo>
            <Campo label="Estado">
              <SelectField value={estado} onChange={(e) => setEstado(e.target.value as EstadoMaterial)}>
                <option value="bom">Bom</option>
                <option value="regular">Regular</option>
                <option value="danificado">Danificado</option>
                <option value="inutilizado">Inutilizado</option>
              </SelectField>
            </Campo>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" size="sm" onClick={onCancelar}>Cancelar</Button>
            <Button
              size="sm"
              loading={aGuardar}
              onClick={() => onSubmeter({
                nivel, estrutura_id: estruturaId, nome, categoria: categoria || undefined,
                quantidade: Number(quantidade) || 0, localizacao: localizacao || undefined, estado,
              })}
            >
              Guardar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ModalAccao({ item, tipo, onClose }: { item: ItemInventario; tipo: Accao; onClose: () => void }) {
  const [quantidade, setQuantidade] = useState('1')
  const [motivo, setMotivo] = useState('')
  const [estadoBaixa, setEstadoBaixa] = useState<'danificado' | 'inutilizado'>('inutilizado')
  const [nivelDestino, setNivelDestino] = useState<NivelInventario>('agrupamento')
  const [estruturaDestinoId, setEstruturaDestinoId] = useState<number | undefined>()

  const { data: dioceses } = dioceseHooks.useList()
  const { data: vigararias } = vigarariaHooks.useList()
  const { data: agrupamentos } = agrupamentoHooks.useList()

  const opcoesDestino = useMemo(() => {
    if (nivelDestino === 'diocese') return (dioceses ?? []).map((d) => ({ id: d.id, nome: d.nome }))
    if (nivelDestino === 'vigararia') return (vigararias ?? []).map((v) => ({ id: v.id, nome: v.nome }))
    if (nivelDestino === 'agrupamento') return (agrupamentos ?? []).map((a) => ({ id: a.id, nome: a.nome }))
    return []
  }, [nivelDestino, dioceses, vigararias, agrupamentos])

  const entrada = useEntradaInventario()
  const saida = useSaidaInventario()
  const baixa = useBaixaInventario()
  const transferir = useTransferirInventario()

  const aGuardar = entrada.isPending || saida.isPending || baixa.isPending || transferir.isPending

  const titulos: Record<Accao, string> = {
    entrada: 'Registar Entrada',
    saida: 'Registar Saída',
    baixa: 'Baixa de Material',
    transferencia: 'Transferir entre Estruturas',
  }

  async function submeter() {
    try {
      const qtd = Number(quantidade)
      if (tipo === 'entrada') await entrada.mutateAsync({ id: item.id, quantidade: qtd, motivo: motivo || undefined })
      else if (tipo === 'saida') await saida.mutateAsync({ id: item.id, quantidade: qtd, motivo: motivo || undefined })
      else if (tipo === 'baixa') await baixa.mutateAsync({ id: item.id, quantidade: qtd, motivo, estado: estadoBaixa })
      else await transferir.mutateAsync({ id: item.id, quantidade: qtd, nivel_destino: nivelDestino, estrutura_destino_id: estruturaDestinoId, motivo: motivo || undefined })
      notificar.sucesso('Movimento registado.')
      onClose()
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível registar o movimento.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-text">{titulos[tipo]} — {item.nome}</h2>
          <button onClick={onClose} className="text-subtle hover:text-text"><X className="size-5" /></button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <p className="text-[12.5px] text-subtle">Disponível: <strong>{item.quantidade}</strong></p>
          <Campo label="Quantidade">
            <TextField type="number" min="1" max={tipo === 'entrada' ? undefined : item.quantidade} value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
          </Campo>

          {tipo === 'transferencia' && (
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Nível de destino">
                <SelectField value={nivelDestino} onChange={(e) => { setNivelDestino(e.target.value as NivelInventario); setEstruturaDestinoId(undefined) }}>
                  {NIVEIS.map((n) => <option key={n.valor} value={n.valor}>{n.label}</option>)}
                </SelectField>
              </Campo>
              {nivelDestino !== 'sede' && (
                <Campo label="Estrutura de destino">
                  <SelectField value={estruturaDestinoId ?? ''} onChange={(e) => setEstruturaDestinoId(Number(e.target.value) || undefined)}>
                    <option value="">-- Seleccionar --</option>
                    {opcoesDestino.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
                  </SelectField>
                </Campo>
              )}
            </div>
          )}

          {tipo === 'baixa' && (
            <Campo label="Estado final">
              <SelectField value={estadoBaixa} onChange={(e) => setEstadoBaixa(e.target.value as 'danificado' | 'inutilizado')}>
                <option value="danificado">Danificado</option>
                <option value="inutilizado">Inutilizado</option>
              </SelectField>
            </Campo>
          )}

          <Campo label={tipo === 'baixa' ? 'Motivo da baixa' : 'Motivo / observações (opcional)'}>
            <TextField required={tipo === 'baixa'} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          </Campo>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
            <Button size="sm" loading={aGuardar} onClick={submeter}>Confirmar</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ModalHistorico({ item, onClose }: { item: ItemInventario; onClose: () => void }) {
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const { data, isLoading } = useMovimentosInventarioItem(item.id, { dataInicio, dataFim })

  const LABEL_TIPO: Record<string, string> = {
    entrada: 'Entrada', saida: 'Saída', baixa: 'Baixa', ajuste: 'Ajuste',
    transferencia_saida: 'Transferência (saída)', transferencia_entrada: 'Transferência (entrada)',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-white px-6 py-4">
          <h2 className="text-lg font-bold text-text">Histórico — {item.nome}</h2>
          <button onClick={onClose} className="text-subtle hover:text-text"><X className="size-5" /></button>
        </div>
        <div className="flex flex-wrap items-end gap-3 border-b border-border bg-surface/40 px-6 py-3">
          <Campo label="De">
            <TextField type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          </Campo>
          <Campo label="Até">
            <TextField type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
          </Campo>
          {(dataInicio || dataFim) && (
            <button
              onClick={() => { setDataInicio(''); setDataFim('') }}
              className="pb-2 text-[12.5px] font-medium text-subtle hover:text-text"
            >
              Limpar filtro
            </button>
          )}
        </div>
        <div className="px-6 py-4">
          {isLoading && <div className="flex justify-center py-10"><Loader2 className="size-5 animate-spin text-subtle" /></div>}
          {!isLoading && data?.length === 0 && <p className="py-10 text-center text-[13px] text-subtle">Sem movimentos registados.</p>}
          <ul className="divide-y divide-border">
            {data?.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2.5 text-[12.5px]">
                <div>
                  <p className="font-medium text-text">{LABEL_TIPO[m.tipo] ?? m.tipo} — {m.quantidade} un.</p>
                  <p className="text-subtle">{m.motivo ?? '—'} {m.atividade_titulo ? `· Evento: ${m.atividade_titulo}` : ''}</p>
                  {m.tipo === 'transferencia_saida' && (
                    <p className="text-subtle">
                      Para: {m.estrutura_destino_nome ?? '—'}
                      {m.item_destino_quantidade_actual !== null && (
                        <> · Stock actual lá: {m.item_destino_quantidade_actual} un.</>
                      )}
                    </p>
                  )}
                  {m.tipo === 'transferencia_entrada' && (
                    <p className="text-subtle">De: {m.estrutura_destino_nome ?? '—'}</p>
                  )}
                </div>
                <div className="text-right text-subtle">
                  <p>{new Date(m.created_at).toLocaleDateString('pt-PT')}</p>
                  <p>{m.criado_por_nome ?? '—'}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
