import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  useResumoFinancasEvento, useEventoRubricas, useCriarRubrica,
  useEventoDespesas, useCriarDespesa, useAtualizarDespesa,
  useEventoReceitas, useCriarReceita, useValidarReceita,
} from '@/hooks/useEventoFinancas'
import { Card } from '@/components/ui/Card'
import { formatarAgrupamento } from '@/lib/formatadores'

export function AbaFinancas({ atividadeId }: { atividadeId: number }) {
  const { data: resumo } = useResumoFinancasEvento(atividadeId)
  const { data: rubricas } = useEventoRubricas(atividadeId)
  const { data: despesas } = useEventoDespesas(atividadeId)
  const { data: receitas } = useEventoReceitas(atividadeId)

  const criarRubrica = useCriarRubrica(atividadeId)
  const criarDespesa = useCriarDespesa(atividadeId)
  const atualizarDespesa = useAtualizarDespesa(atividadeId)
  const criarReceita = useCriarReceita(atividadeId)
  const validarReceita = useValidarReceita(atividadeId)

  const [novaRubrica, setNovaRubrica] = useState({ nome: '', valor_previsto: '' })
  const [novaDespesa, setNovaDespesa] = useState({ rubrica_id: '' as number | '', descricao: '', valor: '', fornecedor: '', estado: 'previsto' });
  const [novaReceita, setNovaReceita] = useState({ delegacao_id: '' as number | '', descricao: '', valor: '' })

  return (
    <div className="space-y-4">
      {resumo && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4"><p className="text-[11px] font-medium uppercase text-subtle">Inscritos</p><p className="mt-1 text-lg font-bold text-text">{resumo.inscritos}</p></Card>
            <Card className="p-4"><p className="text-[11px] font-medium uppercase text-subtle">Pagos</p><p className="mt-1 text-lg font-bold text-badge-green-text">{resumo.pagos}</p></Card>
            <Card className="p-4"><p className="text-[11px] font-medium uppercase text-subtle">Pendentes</p><p className="mt-1 text-lg font-bold text-badge-orange-text">{resumo.pendentes}</p></Card>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="p-4"><p className="text-[11px] font-medium uppercase text-subtle">Previsto</p><p className="mt-1 text-lg font-bold text-text">{resumo.total_previsto.toLocaleString('pt-PT')} Kz</p></Card>
            <Card className="p-4"><p className="text-[11px] font-medium uppercase text-subtle">Despesas Pagas</p><p className="mt-1 text-lg font-bold text-text">{resumo.total_pago.toLocaleString('pt-PT')} Kz</p></Card>
            <Card className="p-4">
              <p className="text-[11px] font-medium uppercase text-subtle">Receitas</p>
              <p className="mt-1 text-lg font-bold text-emerald-600">{resumo.receitas_liquidas.toLocaleString('pt-PT')} Kz</p>
              {resumo.total_estornado > 0 && <p className="text-[10.5px] text-subtle">{resumo.total_receitas.toLocaleString('pt-PT')} bruto · {resumo.total_estornado.toLocaleString('pt-PT')} estornado</p>}
            </Card>
            <Card className="p-4"><p className="text-[11px] font-medium uppercase text-subtle">Saldo</p><p className={`mt-1 text-lg font-bold ${resumo.saldo >= 0 ? 'text-emerald-600' : 'text-badge-red-text'}`}>{resumo.saldo.toLocaleString('pt-PT')} Kz</p></Card>
          </div>
        </>
      )}

      <Card className="p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Rubricas orçamentais</p>
        <div className="mb-3 flex gap-2">
          <input value={novaRubrica.nome} onChange={(e) => setNovaRubrica((f) => ({ ...f, nome: e.target.value }))} placeholder="Nome da rubrica" className="flex-1 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <input type="number" value={novaRubrica.valor_previsto} onChange={(e) => setNovaRubrica((f) => ({ ...f, valor_previsto: e.target.value }))} placeholder="Valor previsto" className="w-36 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <button
            onClick={() => { criarRubrica.mutate(novaRubrica); setNovaRubrica({ nome: '', valor_previsto: '' }) }}
            disabled={!novaRubrica.nome || criarRubrica.isPending}
            className="flex items-center gap-1 rounded-lg bg-[#111827] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
        <div className="space-y-1.5">
          {rubricas?.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-[12.5px]">
              <span>{r.nome}</span>
              <span className="text-muted">{r.valor_realizado.toLocaleString('pt-PT')} / {r.valor_previsto.toLocaleString('pt-PT')} Kz</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Despesas</p>
        <div className="mb-3 flex flex-wrap gap-2">
          <select value={novaDespesa.rubrica_id} onChange={(e) => setNovaDespesa((f) => ({ ...f, rubrica_id: Number(e.target.value) || '' }))} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12px] outline-none focus:border-[#111827]">
            <option value="">-- Rubrica --</option>
            {rubricas?.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}
          </select>
          <input value={novaDespesa.descricao} onChange={(e) => setNovaDespesa((f) => ({ ...f, descricao: e.target.value }))} placeholder="Descrição" className="min-w-[140px] flex-1 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <input type="number" value={novaDespesa.valor} onChange={(e) => setNovaDespesa((f) => ({ ...f, valor: e.target.value }))} placeholder="Valor" className="w-28 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <select value={novaDespesa.estado} onChange={(e) => setNovaDespesa((f) => ({ ...f, estado: e.target.value }))} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12px] outline-none focus:border-[#111827]">
            <option value="previsto">Previsto</option>
            <option value="comprometido">Comprometido</option>
            <option value="pago">Pago</option>
          </select>
          <button
            onClick={() => { criarDespesa.mutate(novaDespesa); setNovaDespesa({ rubrica_id: '', descricao: '', valor: '', fornecedor: '', estado: 'previsto' }) }}
            disabled={!novaDespesa.descricao || !novaDespesa.valor || criarDespesa.isPending}
            className="flex items-center gap-1 rounded-lg bg-[#111827] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
        <div className="space-y-1.5">
          {despesas?.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-[12.5px]">
              <div>
                <p>{d.descricao} {d.rubrica_nome && <span className="text-subtle">({d.rubrica_nome})</span>}</p>
                <p className="text-[10.5px] text-subtle">{d.registado_por_nome} · {new Date(d.created_at).toLocaleDateString('pt-PT')}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text">{d.valor.toLocaleString('pt-PT')} Kz</span>
                {d.estado !== 'pago' && (
                  <button
                    onClick={() => atualizarDespesa.mutate({ id: d.id, descricao: d.descricao, valor: String(d.valor), fornecedor: d.fornecedor ?? '', estado: 'pago' })}
                    className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10.5px] font-semibold text-white"
                  >
                    Marcar pago
                  </button>
                )}
                {d.estado === 'pago' && <span className="rounded-full bg-badge-green-bg px-2 py-0.5 text-[10.5px] font-semibold text-badge-green-text">Pago</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Receitas</p>
        <div className="mb-3 flex flex-wrap gap-2">
          <input value={novaReceita.descricao} onChange={(e) => setNovaReceita((f) => ({ ...f, descricao: e.target.value }))} placeholder="Descrição" className="min-w-[140px] flex-1 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <input type="number" value={novaReceita.valor} onChange={(e) => setNovaReceita((f) => ({ ...f, valor: e.target.value }))} placeholder="Valor" className="w-28 rounded-lg border border-border px-3 py-1.5 text-[12.5px] outline-none focus:border-[#111827]" />
          <button
            onClick={() => { criarReceita.mutate(novaReceita); setNovaReceita({ delegacao_id: '', descricao: '', valor: '' }) }}
            disabled={!novaReceita.descricao || !novaReceita.valor || criarReceita.isPending}
            className="flex items-center gap-1 rounded-lg bg-[#111827] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
        <div className="space-y-1.5">
          {receitas?.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-[12.5px]">
              <div>
                <p>{r.descricao} {r.agrupamento_nome && <span className="text-subtle">({formatarAgrupamento({ nome: r.agrupamento_nome, ab_agrupamento: r.ab_agrupamento })})</span>}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text">{r.valor.toLocaleString('pt-PT')} Kz</span>
                {r.estado === 'pendente' && (
                  <button onClick={() => validarReceita.mutate(r.id)} className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10.5px] font-semibold text-white">Validar</button>
                )}
                {r.estado === 'validado' && <span className="rounded-full bg-badge-green-bg px-2 py-0.5 text-[10.5px] font-semibold text-badge-green-text">Validado</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
