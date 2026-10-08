import { useMemo, useState } from 'react'
import { Loader2, FileText, Check, X, Receipt } from 'lucide-react'
import {
  usePagamentosInscricoes, useDecidirPagamentoInscricao,
  type BasePagamentosInscricoes, type EstadoPagamentoInscricao, type PagamentoInscricao,
} from '@/hooks/usePagamentosInscricoes'
import { usePermissao } from '@/hooks/usePermissao'
import { getApiErrorMessage } from '@/lib/api'
import { notificar } from '@/lib/notificar'
import { cn } from '@/lib/cn'
import { LinkFicheiroProtegido } from '@/components/ui/LinkFicheiroProtegido'

const MODULO: Record<BasePagamentosInscricoes, string> = {
  '/acampamentos': 'Acampamentos',
  '/atividades': 'Actividades',
  '/formacoes': 'Formações',
}

const ESTADO: Record<EstadoPagamentoInscricao, { rotulo: string; cor: string }> = {
  pendente: { rotulo: 'Pendente', cor: 'bg-badge-orange-bg text-badge-orange-text' },
  confirmado: { rotulo: 'Validado', cor: 'bg-badge-green-bg text-badge-green-text' },
  rejeitado: { rotulo: 'Rejeitado', cor: 'bg-red-50 text-red-600' },
}

const FILTROS: Array<{ valor: '' | EstadoPagamentoInscricao; rotulo: string }> = [
  { valor: 'pendente', rotulo: 'Pendentes' },
  { valor: 'confirmado', rotulo: 'Validados' },
  { valor: 'rejeitado', rotulo: 'Rejeitados' },
  { valor: '', rotulo: 'Todos' },
]

const dataCurta = (d: string | null) => (d ? new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')

/**
 * Comprovativos de pagamento que cada membro anexou à sua inscrição (no
 * portal), com Validar / Rejeitar (com motivo). Validar actualiza também a
 * inscrição: "pago" quando está tudo pago, "confirmada" numa prestação
 * intermédia. O servidor só mostra as actividades dentro do âmbito do
 * perfil (ex.: um diocesano só vê as da sua diocese).
 */
export function PagamentosInscricoes({ base, atividadeId }: { base: BasePagamentosInscricoes; atividadeId: number }) {
  const { data, isLoading, error } = usePagamentosInscricoes(base, atividadeId)
  const decidir = useDecidirPagamentoInscricao(base, atividadeId)
  const { editar: podeValidar } = usePermissao(MODULO[base])
  const [filtro, setFiltro] = useState<'' | EstadoPagamentoInscricao>('pendente')
  const [aRejeitar, setARejeitar] = useState<PagamentoInscricao | null>(null)
  const [motivo, setMotivo] = useState('')

  const contagem = useMemo(() => {
    const c: Record<string, number> = { pendente: 0, confirmado: 0, rejeitado: 0, '': data?.length ?? 0 }
    data?.forEach((p) => { c[p.estado] += 1 })
    return c
  }, [data])
  const lista = (data ?? []).filter((p) => !filtro || p.estado === filtro)

  async function validar(p: PagamentoInscricao) {
    try {
      const r = await decidir.mutateAsync({ id: p.id, accao: 'validar' })
      notificar.sucesso(r.mensagem)
    } catch (err) { notificar.erro(getApiErrorMessage(err, 'Não foi possível validar o pagamento.')) }
  }

  async function confirmarRejeicao() {
    if (!aRejeitar) return
    if (motivo.trim().length < 3) { notificar.erro('Indica o motivo da rejeição.'); return }
    try {
      const r = await decidir.mutateAsync({ id: aRejeitar.id, accao: 'rejeitar', motivo: motivo.trim() })
      notificar.sucesso(r.mensagem)
      setARejeitar(null); setMotivo('')
    } catch (err) { notificar.erro(getApiErrorMessage(err, 'Não foi possível rejeitar o pagamento.')) }
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {FILTROS.map((f) => (
          <button
            key={f.valor || 'todos'}
            onClick={() => setFiltro(f.valor)}
            className={cn('rounded-full px-3 py-1 text-[11.5px] font-medium transition', filtro === f.valor ? 'bg-[#111827] text-white' : 'bg-bg text-muted hover:text-text')}
          >
            {f.rotulo} ({contagem[f.valor] ?? 0})
          </button>
        ))}
      </div>

      {isLoading && <div className="flex justify-center py-8"><Loader2 className="size-5 animate-spin text-subtle" /></div>}
      {error && <p className="py-6 text-center text-[12.5px] text-red-600">{getApiErrorMessage(error)}</p>}
      {data && lista.length === 0 && (
        <p className="flex flex-col items-center gap-2 py-8 text-center text-[12.5px] text-subtle">
          <Receipt className="size-5" /> {filtro === 'pendente' ? 'Não há comprovativos por validar.' : 'Sem comprovativos nesta lista.'}
        </p>
      )}

      <div className="space-y-2">
        {lista.map((p) => {
          return (
            <div key={p.id} className="rounded-xl border border-border p-3 text-[12.5px]">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text">{p.utilizador_nome} <span className="font-mono text-[11px] text-subtle">{p.codigo_associado}</span></p>
                  <p className="text-[11.5px] text-subtle">
                    {[
                      p.metodo_pagamento,
                      p.tipo_pagamento === 'prestacao' ? `Prestação ${p.numero_prestacao ?? '?'}${p.num_prestacoes > 1 ? ` de ${p.num_prestacoes}` : ''}` : 'Pagamento completo',
                      p.transacao && `Ref.: ${p.transacao}`,
                      `Enviado a ${dataCurta(p.created_at)}`,
                    ].filter(Boolean).join(' · ')}
                  </p>
                  <p className="text-[11px] text-subtle">Inscrição: {p.inscricao_estado}</p>
                </div>
                <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', ESTADO[p.estado].cor)}>{ESTADO[p.estado].rotulo}</span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {p.comprovativo_path ? (
                  <LinkFicheiroProtegido pasta="comprovativos_inscricao" nome={p.comprovativo_path} nomeFicheiro={p.comprovativo_nome} className="flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-[11.5px] font-medium text-text hover:bg-bg">
                    <FileText className="size-3" /> {p.comprovativo_nome || 'Ver comprovativo'}
                  </LinkFicheiroProtegido>
                ) : <span className="text-[11.5px] text-subtle">Sem comprovativo anexado</span>}
                {p.estado === 'pendente' && podeValidar && (
                  <>
                    <button onClick={() => validar(p)} disabled={decidir.isPending} className="flex items-center gap-1 rounded-md bg-badge-green-bg px-2.5 py-1 text-[11.5px] font-semibold text-badge-green-text disabled:opacity-50">
                      <Check className="size-3" /> Validar
                    </button>
                    <button onClick={() => { setARejeitar(p); setMotivo('') }} disabled={decidir.isPending} className="flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1 text-[11.5px] font-semibold text-red-600 disabled:opacity-50">
                      <X className="size-3" /> Rejeitar
                    </button>
                  </>
                )}
              </div>

              {p.estado !== 'pendente' && (
                <p className="mt-1.5 text-[11px] text-subtle">
                  {p.estado === 'confirmado' ? 'Validado' : 'Rejeitado'}{p.confirmado_por_nome ? ` por ${p.confirmado_por_nome}` : ''} a {dataCurta(p.confirmado_em)}
                  {p.estado === 'rejeitado' && p.motivo_rejeicao && <> — motivo: <span className="text-text">{p.motivo_rejeicao}</span></>}
                </p>
              )}

              {aRejeitar?.id === p.id && (
                <div className="mt-2 space-y-2 rounded-lg bg-bg p-2.5">
                  <textarea
                    autoFocus rows={2} maxLength={255} value={motivo} onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Motivo da rejeição (ex.: comprovativo ilegível, valor não corresponde)"
                    className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-[12.5px] outline-none focus:border-[#111827]"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setARejeitar(null)} className="rounded-md border border-border bg-white px-3 py-1 text-[11.5px] font-medium">Cancelar</button>
                    <button onClick={confirmarRejeicao} disabled={decidir.isPending} className="rounded-md bg-red-600 px-3 py-1 text-[11.5px] font-semibold text-white disabled:opacity-50">Rejeitar pagamento</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
