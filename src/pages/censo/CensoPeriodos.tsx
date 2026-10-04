import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Plus, Loader2, Users, Coins } from 'lucide-react'
import { useCensoPeriodos } from '@/hooks/useCenso'
import { usePermissao } from '@/hooks/usePermissao'
import { Card } from '@/components/ui/Card'
import { ModalCensoPeriodoForm } from '@/components/censo/ModalCensoPeriodoForm'

export function CensoPeriodos() {
  const { data, isLoading } = useCensoPeriodos()
  const { criar: podeCriar } = usePermissao('Censo')
  const [modalAberto, setModalAberto] = useState(false)

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6 sm:px-6 sm:py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
          <ClipboardList className="size-5 text-muted" /> Censo
        </h1>
        {podeCriar && (
          <button onClick={() => setModalAberto(true)} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-black">
            <Plus className="size-3.5" /> Novo Período
          </button>
        )}
      </div>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((p, i) => (
          <Link key={p.id} to={`/censo/${p.id}`}>
            <Card className="hover-lift animate-slide-up p-4" style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-text">{p.titulo}</h3>
                {!p.ativo && <span className="rounded-full bg-bg px-2 py-0.5 text-[10px] font-semibold text-muted">Encerrado</span>}
              </div>
              <p className="text-[12px] text-subtle">
                {new Date(p.data_inicio).toLocaleDateString('pt-PT')} – {new Date(p.data_fim).toLocaleDateString('pt-PT')}
              </p>
              <p className="mt-2.5 flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700">
                <Coins className="size-3.5" /> {Number(p.valor_por_membro).toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz / membro
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-muted">
                <Users className="size-3.5" /> {p.total_submetidas} agrupamento{p.total_submetidas !== 1 && 's'} já submeteu/submeteram
              </p>
            </Card>
          </Link>
        ))}
      </div>

      {!isLoading && data?.length === 0 && <p className="py-16 text-center text-sm text-subtle">Nenhum período de censo criado.</p>}

      {modalAberto && <ModalCensoPeriodoForm onClose={() => setModalAberto(false)} />}
    </div>
  )
}
