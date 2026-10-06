import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useUtilizador } from '@/hooks/useUtilizadores'
import { Alert } from '@/components/ui/Alert'
import { BadgeEstadoUtilizador } from '@/components/crud/BadgesEstado'
import { AbaDados } from '@/components/utilizadores/AbaDados'
import { AbaHistorico } from '@/components/utilizadores/AbaHistorico'
import { AbaTransferir } from '@/components/utilizadores/AbaTransferir'
import { uploadUrl } from '@/lib/uploads'
import { cn } from '@/lib/cn'

type Aba = 'dados' | 'historico' | 'transferir'

export function UtilizadorFicha() {
  const { id } = useParams()
  const [aba, setAba] = useState<Aba>('dados')
  const { data: utilizador, isLoading, isError } = useUtilizador(Number(id))

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><i className="fa-solid fa-spinner animate-spin text-lg text-subtle" /></div>
  }
  if (isError || !utilizador) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Alert variant="error">Não foi possível carregar este escuteiro.</Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-7">
      <Link to="/utilizadores" className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-text">
        <i className="fa-solid fa-chevron-left text-[11px]" /> Voltar à lista
      </Link>

      <div className="mb-6 flex items-center gap-4">
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-bg text-lg font-semibold text-muted">
          {utilizador.foto ? (
            <img src={uploadUrl('avatar', utilizador.foto)!} className="size-full object-cover" alt={utilizador.nome} />
          ) : (
            utilizador.nome[0]?.toUpperCase()
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-text">{utilizador.nome}</h1>
          <p className="mt-0.5 flex items-center gap-2 text-[13px] text-muted">
            <span className="font-mono">{utilizador.codigo_associado}</span>
            <BadgeEstadoUtilizador estado={utilizador.estado} />
          </p>
        </div>
      </div>

      <div className="mb-5 flex gap-1 border-b border-border">
        {([
          ['dados', 'Dados Pessoais'],
          ['historico', 'Percurso / Histórico'],
          ['transferir', 'Transferir'],
        ] as [Aba, string][]).map(([valor, label]) => (
          <button
            key={valor}
            onClick={() => setAba(valor)}
            className={cn(
              'border-b-2 px-4 py-2.5 text-[13px] font-medium transition-colors',
              aba === valor ? 'border-[#111827] text-text' : 'border-transparent text-muted hover:text-text'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {aba === 'dados' && <AbaDados utilizador={utilizador} />}
      {aba === 'historico' && <AbaHistorico utilizadorId={utilizador.id} seccaoActualId={utilizador.seccao_id} cargoActual={utilizador.cargo_funcao} />}
      {aba === 'transferir' && <AbaTransferir utilizador={utilizador} />}
    </div>
  )
}
