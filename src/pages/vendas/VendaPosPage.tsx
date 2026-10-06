import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, Plus, Minus, Trash2, Loader2, UserRound, CircleCheck } from 'lucide-react'
import { useVariantesVenda } from '@/hooks/useStock'
import { useConfirmar } from '@/components/ui/ConfirmProvider'
import { descreverVariante, type LinhaInventario } from '@/types/stock'
import { useUtilizadores } from '@/hooks/useUtilizadores'
import { useCriarVenda } from '@/hooks/useVendas'
import { getApiErrorMessage } from '@/lib/api'
import { notificar } from '@/lib/notificar'
import { Card } from '@/components/ui/Card'
import { uploadUrl } from '@/lib/uploads'
import { METODOS_PAGAMENTO, type ItemCarrinhoPos } from '@/types/venda'

export function VendaPosPage() {
  const navigate = useNavigate()
  const [pesquisaProduto, setPesquisaProduto] = useState('')
  const { data: variantes } = useVariantesVenda(pesquisaProduto)
  const confirmar = useConfirmar()

  // Agrupa as variantes por produto (o POS escolhe sempre a VARIANTE: tamanho/cor/modelo)
  const produtos = useMemo(() => {
    const mapa = new Map<number, { id: number; nome: string; imagem: string | null; variantes: LinhaInventario[] }>()
    for (const v of variantes ?? []) {
      if (!mapa.has(v.produto_id)) mapa.set(v.produto_id, { id: v.produto_id, nome: v.produto_nome, imagem: v.produto_imagem, variantes: [] })
      mapa.get(v.produto_id)!.variantes.push(v)
    }
    return [...mapa.values()]
  }, [variantes])

  const [carrinho, setCarrinho] = useState<ItemCarrinhoPos[]>([])

  const [pesquisaComprador, setPesquisaComprador] = useState('')
  const [comprador, setComprador] = useState<{ id: number; nome: string; codigo_associado: string } | null>(null)
  const { data: resultadosComprador } = useUtilizadores({ pesquisa: pesquisaComprador, porPagina: 6 })

  const [metodoPagamento, setMetodoPagamento] = useState('Dinheiro')
  const [sucesso, setSucesso] = useState<string | null>(null)

  const criarVenda = useCriarVenda()

  function quantidadeNoCarrinho(variacaoId: number) {
    return carrinho.find((i) => i.variacao_id === variacaoId)?.quantidade ?? 0
  }

  function adicionarAoCarrinho(v: LinhaInventario) {
    if (quantidadeNoCarrinho(v.variacao_id) >= v.stock_disponivel) {
      notificar.aviso(`Stock insuficiente. Existem apenas ${v.stock_disponivel} unidades disponíveis.`)
      return
    }
    setCarrinho((c) => {
      const existente = c.find((i) => i.variacao_id === v.variacao_id)
      if (existente) return c.map((i) => (i.variacao_id === v.variacao_id ? { ...i, quantidade: i.quantidade + 1, stock: v.stock_disponivel } : i))
      const nome = v.padrao ? v.produto_nome : `${v.produto_nome} — ${descreverVariante(v)}`
      return [...c, {
        produto_id: v.produto_id, variacao_id: v.variacao_id, sku: v.sku, nome, preco: Number(v.preco),
        quantidade: 1, stock: v.stock_disponivel, tamanho: v.tamanho, cor: v.cor,
      }]
    })
  }

  function alterarQuantidade(variacaoId: number, delta: number) {
    setCarrinho((c) => c.map((i) => {
      if (i.variacao_id !== variacaoId) return i
      const nova = i.quantidade + delta
      if (nova > i.stock) {
        notificar.aviso(`Stock insuficiente. Existem apenas ${i.stock} unidades disponíveis.`)
        return i
      }
      return { ...i, quantidade: Math.max(nova, 1) }
    }))
  }

  function removerDoCarrinho(variacaoId: number) {
    setCarrinho((c) => c.filter((i) => i.variacao_id !== variacaoId))
  }

  const total = carrinho.reduce((soma, i) => soma + i.preco * i.quantidade, 0)

  async function handleFinalizar() {
    setSucesso(null)
    if (!comprador) { notificar.erro('Escolhe o comprador.'); return }
    if (carrinho.length === 0) { notificar.erro('Adiciona pelo menos um artigo.'); return }
    const ok = await confirmar({
      titulo: 'Confirmar venda',
      mensagem: `Registar a venda de ${carrinho.reduce((n, i) => n + i.quantidade, 0)} artigo(s) a ${comprador.nome}, no total de ${total.toLocaleString('pt-PT')} Kz (${metodoPagamento})? O stock é baixado de imediato.`,
      textoConfirmar: 'Confirmar venda',
    })
    if (!ok) return

    try {
      const resultado = await criarVenda.mutateAsync({
        utilizador_id: comprador.id,
        metodo_pagamento: metodoPagamento,
        itens: carrinho.map((i) => ({ produto_id: i.produto_id, variacao_id: i.variacao_id, quantidade: i.quantidade })),
      })
      setSucesso(`Venda #${resultado.dados.id} registada — ${total.toLocaleString('pt-PT')} Kz`)
      setCarrinho([])
      setComprador(null)
      setTimeout(() => navigate('/vendas'), 1200)
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível registar a venda.'))
    }
  }

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-6 sm:px-6 sm:py-7">
      <h1 className="mb-5 flex items-center gap-2.5 text-xl font-bold text-text">
        <ShoppingCart className="size-5 text-muted" /> Nova Venda (POS)
      </h1>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Catálogo */}
        <div>
          <Card className="mb-4 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
              <input
                value={pesquisaProduto}
                onChange={(e) => setPesquisaProduto(e.target.value)}
                placeholder="Pesquisar produto..."
                className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]"
                autoFocus
              />
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {produtos.map((p) => {
              const unica = p.variantes.length === 1 ? p.variantes[0] : null
              const totalDisponivel = p.variantes.reduce((n, v) => n + Math.max(v.stock_disponivel, 0), 0)
              return (
                <div key={p.id} className={`flex flex-col rounded-xl border border-border bg-white p-3 text-left ${totalDisponivel < 1 ? 'opacity-50' : ''}`}>
                  <button
                    type="button"
                    onClick={() => unica && adicionarAoCarrinho(unica)}
                    disabled={!unica || unica.stock_disponivel < 1}
                    className="flex flex-col items-start text-left disabled:cursor-default"
                  >
                    {p.imagem && (
                      <img src={uploadUrl('produtos', p.imagem) ?? undefined} alt={p.nome} className="mb-2 h-20 w-full rounded-lg bg-white object-contain" />
                    )}
                    <p className="line-clamp-2 text-[12.5px] font-medium text-text">{p.nome}</p>
                    <p className="mt-1 text-[13px] font-bold text-text">{Number(p.variantes[0]?.preco ?? 0).toLocaleString('pt-PT')} Kz</p>
                    <p className="text-[10.5px] text-subtle">{totalDisponivel} disponível(eis)</p>
                  </button>
                  {!unica && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {p.variantes.map((v) => (
                        <button
                          key={v.variacao_id}
                          type="button"
                          onClick={() => adicionarAoCarrinho(v)}
                          disabled={v.stock_disponivel < 1}
                          title={`${v.sku ?? ''} · ${v.stock_disponivel} disponível(eis) · ${Number(v.preco).toLocaleString('pt-PT')} Kz`}
                          className="rounded-md border border-border px-1.5 py-0.5 text-[10.5px] font-medium text-text hover:border-[#111827] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {descreverVariante(v)} <span className="text-subtle">({v.stock_disponivel})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            {variantes && produtos.length === 0 && <p className="col-span-full py-8 text-center text-[12.5px] text-subtle">Nenhum produto encontrado.</p>}
          </div>
        </div>

        {/* Carrinho da venda */}
        <div>
          <Card className="sticky top-4 p-4">
            <p className="mb-3 text-[12.5px] font-semibold text-muted">Comprador</p>
            {comprador ? (
              <div className="mb-4 flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-[13px]">
                <span className="flex items-center gap-1.5"><UserRound className="size-3.5 text-subtle" /> {comprador.nome}</span>
                <button onClick={() => setComprador(null)} className="text-[11px] text-subtle hover:text-text">Trocar</button>
              </div>
            ) : (
              <div className="relative mb-4">
                <input
                  value={pesquisaComprador}
                  onChange={(e) => setPesquisaComprador(e.target.value)}
                  placeholder="Pesquisar por nome ou Nº SIGECA..."
                  className="w-full rounded-lg border border-border px-3 py-2 text-[13px] outline-none focus:border-[#111827]"
                />
                {pesquisaComprador.length >= 2 && resultadosComprador && resultadosComprador.dados.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-white shadow-lg">
                    {resultadosComprador.dados.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => { setComprador({ id: u.id, nome: u.nome, codigo_associado: u.codigo_associado }); setPesquisaComprador('') }}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-[12.5px] transition-colors hover:bg-bg"
                      >
                        <span>{u.nome}</span>
                        <span className="font-mono text-[11px] text-subtle">{u.codigo_associado}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <p className="mb-2 text-[12.5px] font-semibold text-muted">Artigos</p>
            <div className="mb-4 max-h-[300px] space-y-1.5 overflow-y-auto">
              {carrinho.map((i) => (
                <div key={i.variacao_id} className="flex items-center justify-between gap-2 rounded-lg bg-bg px-3 py-2 text-[12.5px]">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-text">{i.nome}</p>
                    <p className="text-[11px] text-subtle">{i.preco.toLocaleString('pt-PT')} Kz cada · {i.stock} disp.{i.sku ? ` · ${i.sku}` : ''}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button onClick={() => alterarQuantidade(i.variacao_id, -1)} className="rounded-full border border-border p-1 hover:bg-white"><Minus className="size-3" /></button>
                    <span className="w-5 text-center font-semibold text-text">{i.quantidade}</span>
                    <button onClick={() => alterarQuantidade(i.variacao_id, 1)} className="rounded-full border border-border p-1 hover:bg-white"><Plus className="size-3" /></button>
                    <button onClick={() => removerDoCarrinho(i.variacao_id)} className="ml-1 text-red-400 hover:text-red-600"><Trash2 className="size-3.5" /></button>
                  </div>
                </div>
              ))}
              {carrinho.length === 0 && <p className="py-6 text-center text-[12px] text-subtle">Toca num produto (ou no tamanho/cor) à esquerda para adicionar.</p>}
            </div>

            <p className="mb-2 text-[12.5px] font-semibold text-muted">Método de pagamento</p>
            <select value={metodoPagamento} onChange={(e) => setMetodoPagamento(e.target.value)} className="mb-4 h-9 w-full rounded-lg border border-border bg-white px-2.5 text-[12.5px] outline-none focus:border-[#111827]">
              {METODOS_PAGAMENTO.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>

            {sucesso && (
              <p className="mb-3 flex items-center gap-1.5 text-[12.5px] font-medium text-emerald-600">
                <CircleCheck className="size-3.5" /> {sucesso}
              </p>
            )}

            <div className="mb-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-[13px] font-semibold text-muted">Total</span>
              <span className="text-lg font-bold text-text">{total.toLocaleString('pt-PT')} Kz</span>
            </div>

            <button
              onClick={handleFinalizar}
              disabled={criarVenda.isPending || carrinho.length === 0 || !comprador}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#111827] py-2.5 text-[13.5px] font-semibold text-white disabled:opacity-50"
            >
              {criarVenda.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Finalizar Venda
            </button>
          </Card>
        </div>
      </div>
    </div>
  )
}
