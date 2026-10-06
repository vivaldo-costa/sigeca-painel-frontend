import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCriarUtilizador } from '@/hooks/useUtilizadores'
import { useOpcoesFiltro } from '@/hooks/useDashboardPainel'
import axios from 'axios'
import { getApiErrorMessage } from '@/lib/api'
import { formatarAgrupamento } from '@/lib/formatadores'
import { Campo, Linha2, TextField, SelectField } from '@/components/crud/FormShell'
import { Button } from '@/components/ui/Button'
import {
  SeccaoIdentificacao, SeccaoEscutismo, SeccaoEncarregado, SeccaoEndereco, SeccaoDocumentos,
} from '@/components/utilizadores/CamposAdicionaisUtilizador'
import { CAMPOS_ADICIONAIS_VAZIO, limparDatasOpcionais, type UtilizadorFormPayload } from '@/types/utilizador'
import { notificar } from '@/lib/notificar'
import { cn } from '@/lib/cn'
import { useConfirmar } from '@/components/ui/ConfirmProvider'

// Nunca inclui `codigo_associado` — o Nº SIGECA é sempre gerado
// automaticamente pelo servidor a partir da diocese/agrupamento + id, e
// deixou de existir campo nenhum no formulário para o preencher à mão.
const VAZIO: UtilizadorFormPayload = {
  nome: '', genero: 'Masculino', email: '', telefone: '', estado: 'VALIDATION',
  perfil_id: 2, // ESCUTEIRO
  diocese_id: null, vigararia_id: null, paroquia_id: null, agrupamento_id: null, seccao_id: null,
  data_nascimento: '',
  ...CAMPOS_ADICIONAIS_VAZIO,
}

interface Passo {
  titulo: string
  icone: string
  obrigatorio?: boolean
}

const PASSOS: Passo[] = [
  { titulo: 'Dados Pessoais', icone: 'fa-solid fa-user', obrigatorio: true },
  { titulo: 'Estrutura', icone: 'fa-solid fa-sitemap', obrigatorio: true },
  { titulo: 'Identificação', icone: 'fa-solid fa-id-card' },
  { titulo: 'Escutismo', icone: 'fa-solid fa-scroll' },
  { titulo: 'Endereço', icone: 'fa-solid fa-location-dot' },
]

export function UtilizadorNovoForm() {
  const navigate = useNavigate()
  const criar = useCriarUtilizador()
  const [form, setForm] = useState<UtilizadorFormPayload>(VAZIO)
  const [passo, setPasso] = useState(0)
  const [tentouAvancar, setTentouAvancar] = useState(false)
  const confirmar = useConfirmar()

  const dioceses = useOpcoesFiltro('dioceses')
  const vigararias = useOpcoesFiltro('vigararias', form.diocese_id ?? undefined)
  const paroquias = useOpcoesFiltro('paroquias', form.vigararia_id ?? undefined)
  const agrupamentos = useOpcoesFiltro('agrupamentos', form.paroquia_id ?? undefined)
  const seccoes = useOpcoesFiltro('seccoes')

  const ultimoPasso = passo === PASSOS.length - 1

  function passoValido(indice: number) {
    if (indice === 0) return form.nome.trim() !== '' && form.data_nascimento !== ''
    if (indice === 1) return Boolean(form.diocese_id && form.vigararia_id && form.paroquia_id && form.agrupamento_id && form.seccao_id)
    return true
  }

  function irParaPasso(indice: number) {
    // Só deixa saltar para a frente se os passos obrigatórios anteriores já estiverem OK.
    for (let i = 0; i < indice; i++) {
      if (PASSOS[i].obrigatorio && !passoValido(i)) {
        setPasso(i)
        setTentouAvancar(true)
        return
      }
    }
    setTentouAvancar(false)
    setPasso(indice)
  }

  function seguinte() {
    if (PASSOS[passo].obrigatorio && !passoValido(passo)) {
      setTentouAvancar(true)
      return
    }
    setTentouAvancar(false)
    setPasso((p) => Math.min(p + 1, PASSOS.length - 1))
  }

  function voltar() {
    setTentouAvancar(false)
    setPasso((p) => Math.max(p - 1, 0))
  }

  // O formulário NUNCA grava sozinho: Enter num campo ou a mudança do
  // botão "Seguinte" → "Criar" no último passo não submetem nada. Só o
  // clique explícito em "Criar Escuteiro", seguido de confirmação, grava.
  function bloquearSubmissao(e: FormEvent) {
    e.preventDefault()
  }

  async function criarEscuteiro() {
    if (!passoValido(0) || !passoValido(1)) {
      setTentouAvancar(true)
      irParaPasso(!passoValido(0) ? 0 : 1)
      return
    }
    const ok = await confirmar({
      titulo: 'Criar escuteiro',
      mensagem: `Confirmas a criação do escuteiro "${form.nome.trim()}"? Revê os dados antes de gravar.`,
      textoConfirmar: 'Sim, criar escuteiro',
    })
    if (!ok) return
    await gravar(false)
  }

  async function gravar(confirmarDuplicado: boolean) {
    try {
      const payload = { ...limparDatasOpcionais(form), ...(confirmarDuplicado ? { confirmar_duplicado: true } : {}) }
      const resposta = await criar.mutateAsync(payload as UtilizadorFormPayload)
      notificar.sucesso('Escuteiro criado com sucesso.')
      navigate(`/utilizadores/${(resposta as { dados?: { id: number } }).dados?.id ?? ''}`)
    } catch (err) {
      // O sistema avisa quando o escuteiro parece já existir (mesmo BI, ou mesmo nome + data de nascimento)
      const detalhes = axios.isAxiosError(err) ? (err.response?.data as { detalhes?: { codigo?: string } } | undefined)?.detalhes : undefined
      if (!confirmarDuplicado && detalhes?.codigo === 'ESCUTEIRO_DUPLICADO') {
        const continuar = await confirmar({
          titulo: 'Este escuteiro já existe?',
          mensagem: `${getApiErrorMessage(err)} Queres mesmo criar um novo registo?`,
          textoConfirmar: 'Criar mesmo assim',
          perigoso: true,
        })
        if (continuar) await gravar(true)
        return
      }
      notificar.erro(getApiErrorMessage(err, 'Não foi possível criar o escuteiro.'))
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <Link to="/utilizadores" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-text">
        <i className="fa-solid fa-chevron-left text-[11px]" /> Voltar
      </Link>
      <h1 className="mb-5 text-xl font-bold text-text">Novo Escuteiro</h1>

      {/* Barra de progresso — passos clicáveis, ícones Font Awesome */}
      <div className="mb-5 flex items-center">
        {PASSOS.map((p, i) => (
          <div key={p.titulo} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              onClick={() => irParaPasso(i)}
              className="flex flex-col items-center gap-1.5"
              title={p.titulo}
            >
              <span
                className={cn(
                  'grid size-9 shrink-0 place-items-center rounded-full text-[13px] transition',
                  i === passo ? 'bg-[#111827] text-white' : i < passo ? 'bg-emerald-500 text-white' : 'bg-bg text-subtle',
                )}
              >
                {i < passo ? <i className="fa-solid fa-check" /> : <i className={p.icone} />}
              </span>
              <span className={cn('hidden text-[10.5px] font-medium sm:block', i === passo ? 'text-text' : 'text-subtle')}>
                {p.titulo}
              </span>
            </button>
            {i < PASSOS.length - 1 && (
              <div className={cn('mx-1.5 h-[2px] flex-1 rounded-full transition', i < passo ? 'bg-emerald-500' : 'bg-bg')} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={bloquearSubmissao} className="space-y-4 rounded-[var(--radius-pn)] border border-border bg-surface p-6 shadow-[var(--shadow-pn)]">

        {passo === 0 && (
          <Passo titulo="Dados Pessoais" descricao="O essencial para identificar o escuteiro.">
            <Campo label="Nome completo">
              <TextField required value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} />
            </Campo>
            <Campo label="Género">
              <SelectField value={form.genero} onChange={(e) => setForm((f) => ({ ...f, genero: e.target.value as UtilizadorFormPayload['genero'] }))}>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </SelectField>
            </Campo>
            <Linha2>
              <Campo label="E-mail">
                <TextField type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </Campo>
              <Campo label="Telefone">
                <TextField type="tel" value={form.telefone} onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))} />
              </Campo>
            </Linha2>
            <Campo label="Data de Nascimento">
              <TextField type="date" required value={form.data_nascimento} onChange={(e) => setForm((f) => ({ ...f, data_nascimento: e.target.value }))} />
            </Campo>
            {tentouAvancar && !passoValido(0) && <AvisoPasso texto="Preenche o nome e a data de nascimento para continuar." />}
          </Passo>
        )}

        {passo === 1 && (
          <Passo titulo="Estrutura Territorial" descricao="Onde este escuteiro fica registado.">
            <Campo label="Diocese">
              <SelectField
                required
                value={form.diocese_id ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, diocese_id: Number(e.target.value) || null, vigararia_id: null, paroquia_id: null, agrupamento_id: null }))}
              >
                <option value="">-- Seleccionar --</option>
                {dioceses.data?.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
              </SelectField>
            </Campo>
            <Campo label="Vigararia">
              <SelectField
                required
                disabled={!form.diocese_id}
                value={form.vigararia_id ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, vigararia_id: Number(e.target.value) || null, paroquia_id: null, agrupamento_id: null }))}
              >
                <option value="">-- Seleccionar --</option>
                {vigararias.data?.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
              </SelectField>
            </Campo>
            <Campo label="Paróquia">
              <SelectField
                required
                disabled={!form.vigararia_id}
                value={form.paroquia_id ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, paroquia_id: Number(e.target.value) || null, agrupamento_id: null }))}
              >
                <option value="">-- Seleccionar --</option>
                {paroquias.data?.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </SelectField>
            </Campo>
            <Campo label="Agrupamento">
              <SelectField
                required
                disabled={!form.paroquia_id}
                value={form.agrupamento_id ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, agrupamento_id: Number(e.target.value) || null }))}
              >
                <option value="">-- Seleccionar --</option>
                {agrupamentos.data?.map((a) => <option key={a.id} value={a.id}>{formatarAgrupamento(a)}</option>)}
              </SelectField>
            </Campo>
            <Campo label="Secção / Categoria">
              <SelectField
                required
                value={form.seccao_id ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, seccao_id: Number(e.target.value) || null }))}
              >
                <option value="">-- Seleccionar --</option>
                {seccoes.data?.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </SelectField>
            </Campo>
            <p className="flex items-start gap-1.5 rounded-lg bg-bg px-3 py-2 text-[11.5px] text-muted">
              <i className="fa-solid fa-circle-info mt-0.5 text-subtle" />
              O Nº SIGECA é gerado automaticamente a partir da diocese e do agrupamento assim que o escuteiro for criado.
            </p>
            {tentouAvancar && !passoValido(1) && <AvisoPasso texto="Selecciona a diocese, vigararia, paróquia, agrupamento e secção/categoria." />}
          </Passo>
        )}

        {passo === 2 && (
          <Passo titulo="Identificação" descricao="Opcional — pode preencher-se mais tarde." opcional>
            <SeccaoIdentificacao valores={form} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} />
          </Passo>
        )}

        {passo === 3 && (
          <Passo titulo="Dados Escutistas e Encarregado" descricao="Opcional — pode preencher-se mais tarde." opcional>
            <SeccaoEscutismo valores={form} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} />
            <div className="border-t border-border pt-4">
              <SeccaoEncarregado valores={form} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} />
            </div>
          </Passo>
        )}

        {passo === 4 && (
          <Passo titulo="Endereço e Documentos" descricao="Opcional — pode preencher-se mais tarde." opcional>
            <SeccaoEndereco valores={form} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} />
            <div className="border-t border-border pt-4">
              <SeccaoDocumentos valores={form} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} />
            </div>
          </Passo>
        )}

        <div className="flex gap-3 border-t border-border pt-4">
          {passo > 0 && (
            <Button type="button" variant="secondary" onClick={voltar} className="flex-1">
              <i className="fa-solid fa-arrow-left" /> Voltar
            </Button>
          )}
          {!ultimoPasso ? (
            <Button key="seguinte" type="button" onClick={seguinte} className="flex-1">
              Seguinte <i className="fa-solid fa-arrow-right" />
            </Button>
          ) : (
            <Button key="criar" type="button" onClick={criarEscuteiro} loading={criar.isPending} className="flex-1">
              <i className="fa-solid fa-check" /> Criar Escuteiro
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

function Passo({ titulo, descricao, children, opcional }: { titulo: string; descricao: string; children: ReactNode; opcional?: boolean }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-[14.5px] font-semibold text-text">{titulo}</h2>
        {opcional && <span className="rounded-full bg-bg px-2 py-0.5 text-[10px] font-semibold text-subtle">Opcional</span>}
      </div>
      <p className="-mt-3 text-[12px] text-subtle">{descricao}</p>
      {children}
    </div>
  )
}

function AvisoPasso({ texto }: { texto: string }) {
  return (
    <p className="flex items-center gap-1.5 rounded-lg bg-badge-red-bg px-3 py-2 text-[11.5px] font-medium text-badge-red-text">
      <i className="fa-solid fa-triangle-exclamation" /> {texto}
    </p>
  )
}
