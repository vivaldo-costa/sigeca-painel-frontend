import { useState } from 'react'
import { LayoutDashboard, Loader2 } from 'lucide-react'
import { useDashboardFormacaoDirigente } from '@/hooks/useDashboardFormacaoDirigente'
import { useCatalogoFormacoes } from '@/hooks/useCatalogoFormacoes'
import { useOpcoesFiltro } from '@/hooks/useDashboardPainel'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { getApiErrorMessage } from '@/lib/api'

function Indicador({ label, valor, destaque }: { label: string; valor: number; destaque?: boolean }) {
  return (
    <div className="rounded-xl bg-bg px-4 py-3">
      <p className={`font-mono text-2xl font-bold ${destaque ? 'text-badge-red-text' : 'text-text'}`}>{valor}</p>
      <p className="text-[11.5px] text-muted">{label}</p>
    </div>
  )
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <p className="mb-3 text-[13px] font-semibold text-text">{titulo}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>
    </Card>
  )
}

export function DashboardFormacaoDirigentePage() {
  const [dioceseId, setDioceseId] = useState('')
  const [formacaoId, setFormacaoId] = useState('')
  const { data: dioceses } = useOpcoesFiltro('dioceses')
  const { data: formacoes } = useCatalogoFormacoes('')

  const { data, isLoading, isError, error } = useDashboardFormacaoDirigente({
    dioceseId: dioceseId ? Number(dioceseId) : undefined,
    formacaoId: formacaoId ? Number(formacaoId) : undefined,
  })

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-7">
      <h1 className="mb-5 flex items-center gap-2.5 text-xl font-bold text-text">
        <LayoutDashboard className="size-5 text-muted" /> Dashboard Nacional — Formação de Dirigentes
      </h1>

      <Card className="mb-5 flex flex-wrap items-center gap-3 p-4">
        <select value={dioceseId} onChange={(e) => setDioceseId(e.target.value)} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]">
          <option value="">Todas as dioceses</option>
          {dioceses?.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
        </select>
        <select value={formacaoId} onChange={(e) => setFormacaoId(e.target.value)} className="h-9 rounded-lg border border-border bg-white px-2.5 text-[12.5px] text-text outline-none focus:border-[#111827]">
          <option value="">Todas as formações</option>
          {formacoes?.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </select>
      </Card>

      {isError && <Alert variant="error">{getApiErrorMessage(error, 'Não foi possível carregar o dashboard.')}</Alert>}
      {isLoading && <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

      {data && (
        <div className="space-y-4">
          <Bloco titulo="Candidatos">
            <Indicador label="Registados" valor={data.candidatos.registados} />
            <Indicador label="Em Validação" valor={data.candidatos.em_validacao} />
            <Indicador label="Validados" valor={data.candidatos.validados} />
            <Indicador label="Na Lista de Candidatos" valor={data.candidatos.na_lista_candidatos} />
          </Bloco>

          <Bloco titulo="Turmas">
            <Indicador label="Em Constituição" valor={data.turmas.em_constituicao} />
            <Indicador label="Submetidas" valor={data.turmas.submetidas} />
            <Indicador label="Autorizadas" valor={data.turmas.autorizadas} />
            <Indicador label="Realizadas" valor={data.turmas.realizadas} />
            <Indicador label="Encerradas" valor={data.turmas.encerradas} />
          </Bloco>

          <Bloco titulo="Formação">
            <Indicador label="Candidatos em Formação" valor={data.formacao.candidatos_em_formacao} />
            <Indicador label="Formações Concluídas" valor={data.formacao.formacoes_concluidas} />
          </Bloco>

          <Bloco titulo="Tutoria">
            <Indicador label="Candidatos em Tutoria" valor={data.tutoria.candidatos_em_tutoria} />
            <Indicador label="Tutorias Concluídas" valor={data.tutoria.tutorias_concluidas} />
            <Indicador label="Relatórios Pendentes" valor={data.tutoria.relatorios_pendentes} />
            <Indicador label="Relatórios em Validação" valor={data.tutoria.relatorios_em_validacao} />
            <Indicador label="Tutorias Fora do Prazo" valor={data.tutoria.tutorias_fora_do_prazo} destaque={data.tutoria.tutorias_fora_do_prazo > 0} />
          </Bloco>

          <Bloco titulo="Certificação">
            <Indicador label="Candidatos Aptos" valor={data.certificacao.candidatos_aptos} />
            <Indicador label="Certificados Emitidos" valor={data.certificacao.certificados_emitidos} />
          </Bloco>

          <Bloco titulo="Promessa">
            <Indicador label="A Aguardar Promessa" valor={data.promessa.dirigentes_aguardar_promessa} />
            <Indicador label="Promessas Realizadas" valor={data.promessa.promessas_realizadas} />
            <Indicador label="Processos Concluídos" valor={data.promessa.processos_concluidos} />
          </Bloco>
        </div>
      )}
    </div>
  )
}
