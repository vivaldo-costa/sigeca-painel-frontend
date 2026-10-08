import { useState } from 'react'
import { Pencil, ChevronRight, Upload, Trash2, FileText } from 'lucide-react'
import { useMudarEstadoEvento, useAdicionarDocumentoEvento, useRemoverDocumentoEvento } from '@/hooks/useAcampamentos'
import { Card } from '@/components/ui/Card'
import { ESTADOS_EVENTO, type EventoDetalhe } from '@/types/acampamento'
import { LinkFicheiroProtegido } from '@/components/ui/LinkFicheiroProtegido'

const LABEL_ESTADO: Record<string, string> = {
  preparacao: 'Preparação', inscricoes_abertas: 'Inscrições abertas', em_curso: 'Em curso',
  encerrado: 'Encerrado', arquivado: 'Arquivado',
}

interface Props { evento: EventoDetalhe; onEditar: () => void }

export function AbaVisaoGeral({ evento, onEditar }: Props) {
  const mudarEstado = useMudarEstadoEvento()
  const adicionarDocumento = useAdicionarDocumentoEvento(evento.id)
  const removerDocumento = useRemoverDocumentoEvento(evento.id)
  const [tipoDocumento, setTipoDocumento] = useState('regulamento')

  const indiceAtual = ESTADOS_EVENTO.indexOf(evento.estado_evento)
  const proximoEstado = ESTADOS_EVENTO[indiceAtual + 1];

  function onEscolherFicheiro(e: React.ChangeEvent<HTMLInputElement>) {
    const ficheiro = e.target.files?.[0]
    if (ficheiro) adicionarDocumento.mutate({ ficheiro, tipo: tipoDocumento })
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[12.5px] font-semibold text-muted">Dados do evento</p>
          <button onClick={onEditar} className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11.5px] font-medium text-text hover:bg-bg">
            <Pencil className="size-3" /> Editar
          </button>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-[12.5px]">
          {evento.descricao && <div className="col-span-2"><dt className="text-subtle">Descrição</dt><dd className="text-text">{evento.descricao}</dd></div>}
          <div><dt className="text-subtle">Local</dt><dd className="text-text">{evento.local ?? '—'}</dd></div>
          <div><dt className="text-subtle">Nível organizador</dt><dd className="text-text">{evento.nivel_organizador ?? '—'}</dd></div>
          <div><dt className="text-subtle">Prazo de inscrição</dt><dd className="text-text">{evento.prazo_inscricao ? new Date(evento.prazo_inscricao).toLocaleDateString('pt-PT') : '—'}</dd></div>
          <div><dt className="text-subtle">Capacidade</dt><dd className="text-text">{evento.capacidade_minima ?? '—'} a {evento.vagas ?? '—'}</dd></div>
          <div><dt className="text-subtle">Taxa de inscrição</dt><dd className="text-text">{Number(evento.valor).toLocaleString('pt-PT')} Kz</dd></div>
          <div><dt className="text-subtle">Director</dt><dd className="text-text">{evento.director_nome ?? '—'}</dd></div>
        </dl>
      </Card>

      <Card className="p-4">
        <p className="mb-3 text-[12.5px] font-semibold text-muted">Fluxo do evento</p>
        <div className="flex flex-wrap items-center gap-2">
          {ESTADOS_EVENTO.map((e, i) => (
            <span key={e} className={`rounded-full px-3 py-1.5 text-[11.5px] font-semibold ${i <= indiceAtual ? 'bg-[#111827] text-white' : 'bg-bg text-subtle'}`}>
              {LABEL_ESTADO[e]}
            </span>
          ))}
        </div>
        {proximoEstado && (
          <button
            onClick={() => mudarEstado.mutate({ id: evento.id, estado_evento: proximoEstado })}
            disabled={mudarEstado.isPending}
            className="mt-3 flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[12.5px] font-semibold text-white disabled:opacity-50"
          >
            Avançar para "{LABEL_ESTADO[proximoEstado]}" <ChevronRight className="size-3.5" />
          </button>
        )}
      </Card>

      <Card className="p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12.5px] font-semibold text-muted">Documentos</p>
          <div className="flex items-center gap-2">
            <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)} className="h-8 rounded-lg border border-border bg-white px-2 text-[11.5px] outline-none focus:border-[#111827]">
              <option value="regulamento">Regulamento</option>
              <option value="programa">Programa</option>
              <option value="lista_material">Lista de material</option>
              <option value="anexo">Anexo</option>
            </select>
            <label className="flex cursor-pointer items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11.5px] font-medium text-text hover:bg-bg">
              <Upload className="size-3" /> Enviar
              <input type="file" className="hidden" onChange={onEscolherFicheiro} />
            </label>
          </div>
        </div>
        <div className="space-y-1.5">
          {evento.documentos.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-[12.5px]">
              <LinkFicheiroProtegido pasta="eventos-documentos" nome={d.path} nomeFicheiro={d.nome_ficheiro} className="flex items-center gap-1.5 text-text hover:underline">
                <FileText className="size-3.5 text-subtle" /> {d.nome_ficheiro} <span className="text-[10.5px] text-subtle">({d.tipo})</span>
              </LinkFicheiroProtegido>
              <button onClick={() => removerDocumento.mutate(d.id)} className="text-red-400 hover:text-red-600"><Trash2 className="size-3.5" /></button>
            </div>
          ))}
          {evento.documentos.length === 0 && <p className="text-[12px] text-subtle">Nenhum documento enviado ainda.</p>}
        </div>
      </Card>
    </div>
  )
}
