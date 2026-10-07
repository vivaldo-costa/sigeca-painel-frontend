import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { useAcampamento } from '@/hooks/useAcampamentos'
import { AbaVisaoGeral } from '@/components/acampamentos/AbaVisaoGeral'
import { AbaPapeis } from '@/components/acampamentos/AbaPapeis'
import { AbaDelegacoes } from '@/components/acampamentos/AbaDelegacoes'
import { AbaFinancas } from '@/components/acampamentos/AbaFinancas'
import { AbaComissoes } from '@/components/acampamentos/AbaComissoes'
import { AbaInventario } from '@/components/acampamentos/AbaInventario'
import { AbaZonas } from '@/components/acampamentos/AbaZonas'
import { AbaAlimentacao } from '@/components/acampamentos/AbaAlimentacao'
import { AbaPrograma } from '@/components/acampamentos/AbaPrograma'
import { AbaPaineisOficinas } from '@/components/acampamentos/AbaPaineisOficinas'
import { AbaCredenciais } from '@/components/acampamentos/AbaCredenciais'
import { AbaScanQr } from '@/components/acampamentos/AbaScanQr'
import { AbaSaudeOperacional } from '@/components/acampamentos/AbaSaudeOperacional'
import { AbaIndicadores } from '@/components/acampamentos/AbaIndicadores'
import { AbaDocumentos } from '@/components/acampamentos/AbaDocumentos'
import { ModalEventoForm } from '@/components/acampamentos/ModalEventoForm'
import { cn } from '@/lib/cn'

const ABAS = [
  { chave: 'visao-geral', label: 'Visão Geral' },
  { chave: 'papeis', label: 'Papéis' },
  { chave: 'delegacoes', label: 'Delegações e Inscrições' },
  { chave: 'financas', label: 'Finanças' },
  { chave: 'comissoes', label: 'Comissões' },
  { chave: 'inventario', label: 'Inventário' },
  { chave: 'zonas', label: 'Zonas do Campo' },
  { chave: 'alimentacao', label: 'Alimentação' },
  { chave: 'programa', label: 'Programa' },
  { chave: 'paineis-oficinas', label: 'Painéis e Oficinas' },
  { chave: 'documentos', label: 'Documentos' },
  { chave: 'credenciais', label: 'Credenciais' },
  { chave: 'scan-qr', label: 'Scan QR' },
  { chave: 'saude', label: 'Saúde Operacional' },
  { chave: 'indicadores', label: 'Indicadores' },
] as const

type Aba = (typeof ABAS)[number]['chave']

export function EventoDetalhePage() {
  const { id } = useParams()
  const atividadeId = Number(id)
  const { data: evento, isLoading } = useAcampamento(atividadeId)
  const [aba, setAba] = useState<Aba>('visao-geral')
  const [modalEditar, setModalEditar] = useState(false)

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-7">
      <Link to="/acampamentos" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-text">
        <ChevronLeft className="size-3.5" /> Voltar aos eventos
      </Link>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      {evento && (
        <>
          <h1 className="mb-1 text-xl font-bold text-text">{evento.titulo}</h1>
          {evento.lema && <p className="mb-4 text-[13px] italic text-subtle">"{evento.lema}"</p>}

          <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border">
            {ABAS.map((a) => (
              <button
                key={a.chave}
                onClick={() => setAba(a.chave)}
                className={cn(
                  'whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[13px] font-medium transition',
                  aba === a.chave ? 'border-[#111827] text-text' : 'border-transparent text-subtle hover:text-text',
                )}
              >
                {a.label}
              </button>
            ))}
          </div>

          {aba === 'visao-geral' && <AbaVisaoGeral evento={evento} onEditar={() => setModalEditar(true)} />}
          {aba === 'papeis' && <AbaPapeis atividadeId={atividadeId} />}
          {aba === 'delegacoes' && <AbaDelegacoes atividadeId={atividadeId} />}
          {aba === 'financas' && <AbaFinancas atividadeId={atividadeId} />}
          {aba === 'comissoes' && <AbaComissoes atividadeId={atividadeId} />}
          {aba === 'inventario' && <AbaInventario atividadeId={atividadeId} />}
          {aba === 'zonas' && <AbaZonas atividadeId={atividadeId} />}
          {aba === 'alimentacao' && <AbaAlimentacao atividadeId={atividadeId} />}
          {aba === 'programa' && <AbaPrograma atividadeId={atividadeId} />}
          {aba === 'paineis-oficinas' && <AbaPaineisOficinas atividadeId={atividadeId} />}
          {aba === 'documentos' && <AbaDocumentos atividadeId={atividadeId} />}
          {aba === 'credenciais' && <AbaCredenciais atividadeId={atividadeId} />}
          {aba === 'scan-qr' && <AbaScanQr atividadeId={atividadeId} />}
          {aba === 'saude' && <AbaSaudeOperacional atividadeId={atividadeId} />}
          {aba === 'indicadores' && <AbaIndicadores atividadeId={atividadeId} />}

          {modalEditar && <ModalEventoForm evento={evento} onClose={() => setModalEditar(false)} />}
        </>
      )}
    </div>
  )
}
