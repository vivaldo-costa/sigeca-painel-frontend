import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, Plus, Minus, Trash2, Loader2, UserRound, CircleCheck } from 'lucide-react'
import { useProdutos } from '@/hooks/useProdutosPainel'
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
  const { data: produtos } = useProdutos({ pesquisa: pesquisaProduto, ativo: '1' })

  const [carrinho, setCarrinho] = useState<ItemCarrinhoPos[]>([])

  const [pesquisaComprador, setPesquisaComprador] = useState('')
  const [comprador, setComprador] = useState<{ id: number; nome: string; codigo_associado: string } | null>(null)
  const { data: resultadosComprador } = useUtilizadores({ pesquisa: pesquisaComprador, porPagina: 6 })

  const [metodoPagamento, setMetodoPagamento] = useState('Dinheiro')
  const [sucesso, setSucesso] = useState<string | null>(null)

  const criarVenda = useCriarVenda()

  function adicionarAoCarrinho(produto: { id: number; nome: string; preco: string; stock: number }) {
    setCarrinho((c) => {
      const existente = c.find((i) => i.produto_id === produto.id)
      if (existente) {
        if (existente.quantidade >= produto.stock) return c
        return c.map((i) => (i.produto_id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i))
      }
      if (produto.stock < 1) return c
      return [...c, { produto_id: produto.id, nome: produto.nome, preco: Number(produto.preco), quantidade: 1, stock: produto.stock }]
    })
  }

  function alterarQuantidade(produtoId: number, delta: number) {
    setCarrinho((c) => c
      .map((i) => (i.produto_id === produtoId ? { ...i, quantidade: Math.min(Math.max(i.quantidade + delta, 1), i.stock) } : i)))
  }

  function removerDoCarrinho(produtoId: number) {
    setCarrinho((c) => c.filter((i) => i.produto_id !== produtoId))
  }

  const total = carrinho.reduce((soma, i) => soma + i.preco * i.quantidade, 0)

  async function handleFinalizar() {
    setSucesso(null)
    if (!comprador) { notificar.erro('Escolhe o comprador.'); return }
    if (carrinho.length === 0) { notificar.erro('Adiciona pelo menos um artigo.'); return }

    try {
      const resultado = await criarVenda.mutateAsync({
        utilizador_id: comprador.id,
        metodo_pagamento: metodoPagamento,
        itens: carrinho.map((i) => ({ produto_id: i.produto_id, quantidade: i.quantidade })),
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
            {produtos?.map((p) => (
              <button
                key={p.id}
                onClick={() => adicionarAoCarrinho(p)}
                disabled={p.stock < 1}
                className="flex flex-col items-start rounded-xl border border-border bg-white p-3 text-left transition hover:border-[#111827] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {p.imagem && (
                  <img src={uploadUrl('produtos', p.imagem) ?? undefined} alt={p.nome} className="mb-2 h-20 w-full rounded-lg object-cover" />
                )}
                <p className="line-clamp-2 text-[12.5px] font-medium text-text">{p.nome}</p>
                <p className="mt-1 text-[13px] font-bold text-text">{Number(p.preco).toLocaleString('pt-PT')} Kz</p>
                <p className="text-[10.5px] text-subtle">{p.stock} em stock</p>
              </button>
            ))}
            {produtos?.length === 0 && <p className="col-span-full py-8 text-center text-[12.5px] text-subtle">Nenhum produto encontrado.</p>}
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
                <div key={i.produto_id} className="flex items-center justify-between gap-2 rounded-lg bg-bg px-3 py-2 text-[12.5px]">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-text">{i.nome}</p>
                    <p className="text-[11px] text-subtle">{i.preco.toLocaleString('pt-PT')} Kz cada</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button onClick={() => alterarQuantidade(i.produto_id, -1)} className="rounded-full border border-border p-1 hover:bg-white"><Minus className="size-3" /></button>
                    <span className="w-5 text-center font-semibold text-text">{i.quantidade}</span>
                    <button onClick={() => alterarQuantidade(i.produto_id, 1)} className="rounded-full border border-border p-1 hover:bg-white"><Plus className="size-3" /></button>
                    <button onClick={() => removerDoCarrinho(i.produto_id)} className="ml-1 text-red-400 hover:text-red-600"><Trash2 className="size-3.5" /></button>
                  </div>
                </div>
              ))}
              {carrinho.length === 0 && <p className="py-6 text-center text-[12px] text-subtle">Toca num produto à esquerda para adicionar.</p>}
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
