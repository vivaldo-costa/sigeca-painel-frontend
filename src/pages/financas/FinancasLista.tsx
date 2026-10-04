import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Coins, Plus, Loader2, Pencil, Trash2, Search, ClipboardCheck, Wallet } from 'lucide-react'
import { useQuotas, useResumoQuotas, useRemoverQuota } from '@/hooks/useQuotas'
import { usePermissao } from '@/hooks/usePermissao'
import { Card } from '@/components/ui/Card'
import { ExportarBotoes } from '@/components/ui/ExportarBotoes'
import { ModalQuotaForm } from '@/components/quotas/ModalQuotaForm'
import { formatarAgrupamento } from '@/lib/formatadores'
import type { FiltrosQuotas, EstadoQuota, QuotaPainel } from '@/types/quota'

const CORES_ESTADO: Record<EstadoQuota, string> = {
  pendente: 'bg-badge-orange-bg text-badge-orange-text',
  pago: 'bg-badge-green-bg text-badge-green-text',
  isento: 'bg-badge-blue-bg text-badge-blue-text',
}

export function FinancasLista() {
  const periodoAtual = new Date().toISOString().slice(0, 7)
  const [filtros, setFiltros] = useState<FiltrosQuotas>({ periodo: periodoAtual })
  const [pesquisaRascunho, setPesquisaRascunho] = useState('')

  const { data, isLoading } = useQuotas(filtros)
  const { data: resumo } = useResumoQuotas(filtros.periodo)
  const remover = useRemoverQuota()
  const { criar: podeCriar, editar: podeEditar, apagar: podeEliminar } = usePermissao('Finanças')

  const [modalForm, setModalForm] = useState<'novo' | QuotaPainel | null>(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState<number | null>(null)

  async function handleEliminar(id: number) {
    if (confirmarEliminar !== id) {
      setConfirmarEliminar(id)
      setTimeout(() => setConfirmarEliminar(null), 3000)
      return
    }
    await remover.mutateAsync(id)
    setConfirmarEliminar(null)
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <Coins className="size-5 text-muted" /> Finanças
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <ExportarBotoes
            tamanho="sm"
            nomeFicheiro={`financas-${filtros.periodo ?? 'todas'}`}
            titulo="Finanças — Quotas"
            subtitulo={filtros.periodo ? `Período: ${filtros.periodo}` : undefined}
            colunas={[
              { titulo: 'Escuteiro', valor: (q: QuotaPainel) => q.utilizador_nome },
              { titulo: 'Nº SIGECA', valor: (q) => q.codigo_associado },
              { titulo: 'Agrupamento', valor: (q) => q.agrupamento_nome ? formatarAgrupamento({ nome: q.agrupamento_nome, ab_agrupamento: q.ab_agrupamento }) : '—' },
              { titulo: 'Período', valor: (q) => q.periodo },
              { titulo: 'Valor (Kz)', valor: (q) => Number(q.valor) },
              { titulo: 'Estado', valor: (q) => q.estado },
            ]}
            linhas={data ?? []}
          />
          <Link to="/tesouraria" className="flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-[13px] font-semibold text-text transition hover:bg-bg">
            <Wallet className="size-3.5" /> Tesouraria
          </Link>
          <Link to="/financas/regularizacao" className="flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-[13px] font-semibold text-text transition hover:bg-bg">
            <ClipboardCheck className="size-3.5" /> Regularização / Censo
          </Link>
          {podeCriar && (
            <button onClick={() => setModalForm('novo')} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-black">
              <Plus className="size-3.5" /> Registar Quota
            </button>
          )}
        </div>
      </div>

      {resumo && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="p-4"><p className="text-[11px] font-medium uppercase text-subtle">Arrecadado</p><p className="mt-1 text-lg font-bold text-text">{resumo.total_arrecadado.toLocaleString('pt-PT')} Kz</p></Card>
          <Card className="p-4"><p className="text-[11px] font-medium uppercase text-subtle">Em falta</p><p className="mt-1 text-lg font-bold text-text">{resumo.total_em_falta.toLocaleString('pt-PT')} Kz</p></Card>
          <Card className="p-4"><p className="text-[11px] font-medium uppercase text-subtle">Pagos</p><p className="mt-1 text-lg font-bold text-badge-green-text">{resumo.total_pagos}</p></Card>
          <Card className="p-4"><p className="text-[11px] font-medium uppercase text-subtle">Pendentes</p><p className="mt-1 text-lg font-bold text-badge-orange-text">{resumo.total_pendentes}</p></Card>
        </div>
      )}

      <Card className="mb-5 flex flex-wrap items-center gap-3 p-4">
        <form onSubmit={(e) => { e.preventDefault(); setFiltros((f) => ({ ...f, pesquisa: pesquisaRascunho })) }} className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
          <input
            value={pesquisaRascunho}
            onChange={(e) => setPesquisaRascunho(e.target.value)}
            placeholder="Nome ou Nº SIGECA..."
            className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#111827]"
          />
        </form>
        <input
          type="month"
          value={filtros.periodo ?? ''}
          onChange={(e) => setFiltros((f) => ({ ...f, periodo: e.target.value }))}
          className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]"
        />
        <select
          value={filtros.estado ?? ''}
          onChange={(e) => setFiltros((f) => ({ ...f, estado: e.target.value as EstadoQuota | '' }))}
          className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]"
        >
          <option value="">Todos os estados</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="isento">Isento</option>
        </select>
      </Card>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3.5 py-2.5 font-medium">Escuteiro</th>
              <th className="px-3.5 py-2.5 font-medium">Agrupamento</th>
              <th className="px-3.5 py-2.5 font-medium">Período</th>
              <th className="px-3.5 py-2.5 font-medium">Valor</th>
              <th className="px-3.5 py-2.5 font-medium">Estado</th>
              <th className="px-3.5 py-2.5 text-center font-medium">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!isLoading && data?.length === 0 && (
              <tr><td colSpan={6} className="py-16 text-center text-subtle">Nenhum registo encontrado.</td></tr>
            )}
            {data?.map((q) => (
              <tr key={q.id} className="transition-colors hover:bg-bg">
                <td className="px-3.5 py-2.5">
                  <p className="font-medium text-text">{q.utilizador_nome}</p>
                  <p className="font-mono text-[11px] text-subtle">{q.codigo_associado}</p>
                </td>
                <td className="px-3.5 py-2.5 text-muted">{q.agrupamento_nome ? formatarAgrupamento({ nome: q.agrupamento_nome, ab_agrupamento: q.ab_agrupamento }) : '—'}</td>
                <td className="px-3.5 py-2.5 text-muted">{q.periodo}</td>
                <td className="px-3.5 py-2.5 font-medium text-text">{Number(q.valor).toLocaleString('pt-PT')} Kz</td>
                <td className="px-3.5 py-2.5">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CORES_ESTADO[q.estado]}`}>{q.estado}</span>
                </td>
                <td className="px-3.5 py-2.5">
                  <div className="flex items-center justify-center gap-2">
                    {podeEditar && (
                      <button onClick={() => setModalForm(q)} className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-text transition hover:bg-bg">
                        <Pencil className="size-3" />
                      </button>
                    )}
                    {podeEliminar && (
                      <button
                        onClick={() => handleEliminar(q.id)}
                        disabled={remover.isPending}
                        className={`rounded-lg border px-2.5 py-1 text-[11px] transition disabled:opacity-50 ${
                          confirmarEliminar === q.id ? 'border-badge-red-text bg-badge-red-text text-white' : 'border-red-200 text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <Trash2 className="size-3" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {modalForm && <ModalQuotaForm quota={modalForm === 'novo' ? null : modalForm} onClose={() => setModalForm(null)} />}
    </div>
  )
}
