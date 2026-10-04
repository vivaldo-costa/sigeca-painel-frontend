import { useState } from 'react'
import { ChevronDown, Plus, Search } from 'lucide-react'
import { useEventoDelegacoes, useCriarDelegacao, useEventoInscricoes, useAdicionarInscricao } from '@/hooks/useEventoInscricoes'
import { agrupamentoHooks } from '@/hooks/useEstrutura'
import { useUtilizadores } from '@/hooks/useUtilizadores'
import { getApiErrorMessage } from '@/lib/api'
import { notificar } from '@/lib/notificar'
import { Card } from '@/components/ui/Card'
import { formatarAgrupamento } from '@/lib/formatadores'
import { ModalInscricaoDetalhe } from './ModalInscricaoDetalhe'
import { LABEL_ESTADO_INSCRICAO, type EstadoInscricaoEvento } from '@/types/eventoInscricao'

const COR_BADGE_ESTADO: Partial<Record<EstadoInscricaoEvento, string>> = {
  confirmada: 'bg-badge-green-bg text-badge-green-text',
  presenca_registada: 'bg-badge-green-bg text-badge-green-text',
  aguardando_pagamento: 'bg-badge-orange-bg text-badge-orange-text',
  lista_espera: 'bg-badge-orange-bg text-badge-orange-text',
  rejeitada: 'bg-badge-red-bg text-badge-red-text',
  cancelada: 'bg-badge-red-bg text-badge-red-text',
}
import { cn } from '@/lib/cn'

export function AbaDelegacoes({ atividadeId }: { atividadeId: number }) {
  const { data: delegacoes } = useEventoDelegacoes(atividadeId)
  const { data: agrupamentos } = agrupamentoHooks.useList()
  const criarDelegacao = useCriarDelegacao(atividadeId)

  const [agrupamentoId, setAgrupamentoId] = useState<number | ''>('')
  const [chefePesquisa, setChefePesquisa] = useState('')
  const [chefeEscolhido, setChefeEscolhido] = useState<{ id: number; nome: string } | null>(null)
  const [delegacaoAberta, setDelegacaoAberta] = useState<number | null>(null)
  const [inscricaoAberta, setInscricaoAberta] = useState<number | null>(null)

  const { data: resultadosChefe } = useUtilizadores({ pesquisa: chefePesquisa, porPagina: 6 })

  async function handleCriarDelegacao() {
    if (!agrupamentoId || !chefeEscolhido) { notificar.erro('Escolhe o agrupamento e o chefe responsável.'); return }
    try {
      await criarDelegacao.mutateAsync({ agrupamento_id: agrupamentoId, chefe_responsavel_id: chefeEscolhido.id })
      setAgrupamentoId('')
      setChefeEscolhido(null)
      setChefePesquisa('')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível criar a delegação.'))
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Nova delegação</p>
        <div className="flex flex-wrap gap-2">
          <select value={agrupamentoId} onChange={(e) => setAgrupamentoId(Number(e.target.value) || '')} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]">
            <option value="">-- Agrupamento --</option>
            {agrupamentos?.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
          {chefeEscolhido ? (
            <div className="flex items-center gap-2 rounded-lg bg-bg px-3 py-2 text-[13px]">
              {chefeEscolhido.nome}
              <button onClick={() => setChefeEscolhido(null)} className="text-[11px] text-subtle hover:text-text">Trocar</button>
            </div>
          ) : (
            <div className="relative min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
              <input
                value={chefePesquisa}
                onChange={(e) => setChefePesquisa(e.target.value)}
                placeholder="Chefe responsável..."
                className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]"
              />
              {chefePesquisa.length >= 2 && resultadosChefe && resultadosChefe.dados.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-white shadow-lg">
                  {resultadosChefe.dados.map((u) => (
                    <button key={u.id} onClick={() => setChefeEscolhido({ id: u.id, nome: u.nome })} className="block w-full px-3 py-2 text-left text-[12.5px] hover:bg-bg">{u.nome}</button>
                  ))}
                </div>
              )}
            </div>
          )}
          <button onClick={handleCriarDelegacao} disabled={criarDelegacao.isPending} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white disabled:opacity-50">
            <Plus className="size-3.5" /> Criar
          </button>
        </div>
      </Card>

      <div className="space-y-3">
        {delegacoes?.length === 0 && <p className="py-8 text-center text-sm text-subtle">Nenhuma delegação criada ainda.</p>}
        {delegacoes?.map((d) => (
          <Card key={d.id} className="overflow-hidden">
            <button onClick={() => setDelegacaoAberta(delegacaoAberta === d.id ? null : d.id)} className="flex w-full items-center justify-between px-4 py-3 text-left">
              <div>
                <p className="font-semibold text-text">{formatarAgrupamento({ nome: d.agrupamento_nome, ab_agrupamento: d.ab_agrupamento })}</p>
                <p className="text-[11.5px] text-subtle">Chefe: {d.chefe_nome} · {d.total_inscritos} inscrito{d.total_inscritos !== 1 && 's'}</p>
              </div>
              <ChevronDown className={cn('size-4 text-subtle transition-transform', delegacaoAberta === d.id && 'rotate-180')} />
            </button>
            {delegacaoAberta === d.id && (
              <div className="border-t border-border">
                <InscricoesDelegacao delegacaoId={d.id} onAbrirInscricao={setInscricaoAberta} />
              </div>
            )}
          </Card>
        ))}
      </div>

      {inscricaoAberta !== null && delegacaoAberta !== null && (
        <ModalInscricaoDetalhe id={inscricaoAberta} delegacaoId={delegacaoAberta} onClose={() => setInscricaoAberta(null)} />
      )}
    </div>
  )
}

function InscricoesDelegacao({ delegacaoId, onAbrirInscricao }: { delegacaoId: number; onAbrirInscricao: (id: number) => void }) {
  const { data: inscricoes } = useEventoInscricoes(delegacaoId)
  const adicionar = useAdicionarInscricao(delegacaoId)
  const [pesquisa, setPesquisa] = useState('')
  const [escolhido, setEscolhido] = useState<{ id: number; nome: string } | null>(null)
  const [funcao, setFuncao] = useState('')
  const { data: resultados } = useUtilizadores({ pesquisa, porPagina: 6 })

  async function handleAdicionar() {
    if (!escolhido) return
    await adicionar.mutateAsync({ utilizador_id: escolhido.id, funcao })
    setEscolhido(null)
    setPesquisa('')
    setFuncao('')
  }

  return (
    <div className="p-4">
      <div className="mb-3 flex flex-wrap gap-2">
        {escolhido ? (
          <div className="flex items-center gap-2 rounded-lg bg-bg px-3 py-1.5 text-[12.5px]">
            {escolhido.nome}
            <button onClick={() => setEscolhido(null)} className="text-[11px] text-subtle hover:text-text">Trocar</button>
          </div>
        ) : (
          <div className="relative min-w-[180px] flex-1">
            <input
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              placeholder="Adicionar escuteiro..."
              className="w-full rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]"
            />
            {pesquisa.length >= 2 && resultados && resultados.dados.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-white shadow-lg">
                {resultados.dados.map((u) => (
                  <button key={u.id} onClick={() => setEscolhido({ id: u.id, nome: u.nome })} className="block w-full px-3 py-2 text-left text-[12px] hover:bg-bg">{u.nome}</button>
                ))}
              </div>
            )}
          </div>
        )}
        <input value={funcao} onChange={(e) => setFuncao(e.target.value)} placeholder="Função (opcional)" className="w-32 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
        <button onClick={handleAdicionar} disabled={adicionar.isPending || !escolhido} className="rounded-lg bg-[#111827] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50">Adicionar</button>
      </div>

      <div className="space-y-1.5">
        {inscricoes?.map((i) => (
          <button key={i.id} onClick={() => onAbrirInscricao(i.id)} className="flex w-full items-center justify-between rounded-lg bg-bg px-3 py-2 text-left text-[12.5px] hover:bg-border">
            <span>{i.nome} {i.funcao && <span className="text-subtle">· {i.funcao}</span>}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${COR_BADGE_ESTADO[i.estado] ?? 'bg-white text-muted'}`}>{LABEL_ESTADO_INSCRICAO[i.estado]}</span>
          </button>
        ))}
        {inscricoes?.length === 0 && <p className="text-[12px] text-subtle">Ainda sem inscritos nesta delegação.</p>}
      </div>
    </div>
  )
}
