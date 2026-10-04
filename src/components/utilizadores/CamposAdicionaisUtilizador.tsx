import { Campo, Linha2, TextField, SelectField, TextareaField } from '@/components/crud/FormShell'
import { Accordion } from '@/components/ui/Accordion'
import type { CamposAdicionaisUtilizadorValores } from '@/types/utilizador'

const SACRAMENTOS_DISPONIVEIS = ['Baptismo', 'Comunhão', 'Crisma', 'Matrimônio', 'Ordem', 'Consagrada']
const GRUPOS_SANGUINEOS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const DOCS: { chave: keyof CamposAdicionaisUtilizadorValores; label: string; icone: string }[] = [
  { chave: 'docs_bi', label: 'Bilhete de Identidade', icone: 'fa-solid fa-id-card' },
  { chave: 'docs_foto', label: 'Fotografia', icone: 'fa-solid fa-image' },
  { chave: 'docs_matricula', label: 'Comprovativo de matrícula', icone: 'fa-solid fa-graduation-cap' },
  { chave: 'docs_cartao_sacramentos', label: 'Cartão dos sacramentos', icone: 'fa-solid fa-cross' },
  { chave: 'docs_cartao_residente', label: 'Cartão de residente', icone: 'fa-solid fa-house' },
  { chave: 'docs_taxa_pagamento', label: 'Comprovativo de pagamento da taxa', icone: 'fa-solid fa-money-check-dollar' },
]

interface SeccaoProps {
  valores: CamposAdicionaisUtilizadorValores
  onChange: (patch: Partial<CamposAdicionaisUtilizadorValores>) => void
}

export function SeccaoIdentificacao({ valores, onChange }: SeccaoProps) {
  return (
    <>
      <Linha2>
        <Campo label="Tipo de Inscrição">
          <SelectField value={valores.tipo_inscricao} onChange={(e) => onChange({ tipo_inscricao: e.target.value as CamposAdicionaisUtilizadorValores['tipo_inscricao'] })}>
            <option value="">-- Seleccionar --</option>
            <option value="Novo">Novo</option>
            <option value="Antigo">Antigo</option>
          </SelectField>
        </Campo>
        <Campo label="Bilhete de Identidade">
          <TextField value={valores.bilhete_identidade} onChange={(e) => onChange({ bilhete_identidade: e.target.value })} />
        </Campo>
      </Linha2>
      <Linha2>
        <Campo label="Naturalidade">
          <TextField value={valores.naturalidade} onChange={(e) => onChange({ naturalidade: e.target.value })} placeholder="Ex.: Luanda" />
        </Campo>
        <Campo label="Nacionalidade">
          <TextField value={valores.nacionalidade} onChange={(e) => onChange({ nacionalidade: e.target.value })} />
        </Campo>
      </Linha2>
      <Linha2>
        <Campo label="Grupo Sanguíneo">
          <SelectField value={valores.grupo_sanguineo} onChange={(e) => onChange({ grupo_sanguineo: e.target.value })}>
            <option value="">-- Seleccionar --</option>
            {GRUPOS_SANGUINEOS.map((g) => <option key={g} value={g}>{g}</option>)}
          </SelectField>
        </Campo>
        <Campo label="Alergias / Restrições alimentares">
          <TextField value={valores.alergias_restricoes} onChange={(e) => onChange({ alergias_restricoes: e.target.value })} />
        </Campo>
      </Linha2>
    </>
  )
}

export function SeccaoEscutismo({ valores, onChange }: SeccaoProps) {
  const sacramentosSelecionados = valores.sacramento
    ? valores.sacramento.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  function alternarSacramento(s: string) {
    const seleccionados = sacramentosSelecionados.includes(s)
      ? sacramentosSelecionados.filter((x) => x !== s)
      : [...sacramentosSelecionados, s]
    onChange({ sacramento: seleccionados.join(', ') })
  }

  return (
    <>
      <Campo label="Sacramentos recebidos">
        <div className="flex flex-wrap gap-2">
          {SACRAMENTOS_DISPONIVEIS.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => alternarSacramento(s)}
              className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition ${
                sacramentosSelecionados.includes(s)
                  ? 'border-[#111827] bg-[#111827] text-white'
                  : 'border-border text-muted hover:border-[#111827]'
              }`}
            >
              <i className="fa-solid fa-cross mr-1.5 text-[10px]" />
              {s}
            </button>
          ))}
        </div>
      </Campo>
      <Linha2>
        <Campo label="Data da Promessa">
          <TextField type="date" value={valores.data_promessa} onChange={(e) => onChange({ data_promessa: e.target.value })} />
        </Campo>
        <Campo label="Tempo de Permanência">
          <TextField value={valores.tempo_permanencia} onChange={(e) => onChange({ tempo_permanencia: e.target.value })} placeholder="Ex.: 3 anos" />
        </Campo>
      </Linha2>
      <Campo label="Cargo / Função">
        <TextField value={valores.cargo_funcao} onChange={(e) => onChange({ cargo_funcao: e.target.value })} />
      </Campo>
      <Campo label="Participação em Grupos Paroquiais">
        <TextareaField value={valores.participacao_grupos_paroquiais} onChange={(e) => onChange({ participacao_grupos_paroquiais: e.target.value })} />
      </Campo>
    </>
  )
}

export function SeccaoEncarregado({ valores, onChange }: SeccaoProps) {
  return (
    <>
      <Linha2>
        <Campo label="Nome do Encarregado">
          <TextField value={valores.encarregado_nome} onChange={(e) => onChange({ encarregado_nome: e.target.value })} />
        </Campo>
        <Campo label="Grau de Parentesco">
          <TextField value={valores.encarregado_grau_parentesco} onChange={(e) => onChange({ encarregado_grau_parentesco: e.target.value })} placeholder="Ex.: Pai, Mãe, Tio(a)" />
        </Campo>
      </Linha2>
      <Linha2>
        <Campo label="Telefone do Encarregado">
          <TextField type="tel" value={valores.encarregado_telefone} onChange={(e) => onChange({ encarregado_telefone: e.target.value })} />
        </Campo>
        <Campo label="E-mail do Encarregado">
          <TextField type="email" value={valores.encarregado_email} onChange={(e) => onChange({ encarregado_email: e.target.value })} />
        </Campo>
      </Linha2>
      <Campo label="Autorização do Encarregado">
        <SelectField value={valores.autorizacao_encarregado} onChange={(e) => onChange({ autorizacao_encarregado: e.target.value as CamposAdicionaisUtilizadorValores['autorizacao_encarregado'] })}>
          <option value="">-- Seleccionar --</option>
          <option value="Sim">Sim</option>
          <option value="Não">Não</option>
        </SelectField>
      </Campo>
    </>
  )
}

export function SeccaoEndereco({ valores, onChange }: SeccaoProps) {
  return (
    <>
      <Campo label="Morada">
        <TextField value={valores.endereco} onChange={(e) => onChange({ endereco: e.target.value })} />
      </Campo>
      <Linha2>
        <Campo label="Bairro">
          <TextField value={valores.bairro} onChange={(e) => onChange({ bairro: e.target.value })} />
        </Campo>
        <Campo label="Município">
          <TextField value={valores.municipio} onChange={(e) => onChange({ municipio: e.target.value })} />
        </Campo>
      </Linha2>
      <Campo label="Província">
        <TextField value={valores.provincia} onChange={(e) => onChange({ provincia: e.target.value })} />
      </Campo>
    </>
  )
}

export function SeccaoDocumentos({ valores, onChange }: SeccaoProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {DOCS.map(({ chave, label, icone }) => (
          <label key={chave} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-[12.5px] text-text hover:bg-bg">
            <input
              type="checkbox"
              className="size-3.5"
              checked={Boolean(valores[chave])}
              onChange={(e) => onChange({ [chave]: e.target.checked } as Partial<CamposAdicionaisUtilizadorValores>)}
            />
            <i className={`${icone} w-3.5 text-center text-[11px] text-subtle`} />
            {label}
          </label>
        ))}
      </div>
      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-[12.5px] font-medium text-text hover:bg-bg">
        <input
          type="checkbox"
          className="size-3.5"
          checked={valores.termo_compromisso}
          onChange={(e) => onChange({ termo_compromisso: e.target.checked })}
        />
        <i className="fa-solid fa-file-signature w-3.5 text-center text-[11px] text-subtle" />
        Termo de compromisso assinado
      </label>
      <Linha2>
        <Campo label="Assinatura (nome de quem assinou)">
          <TextField value={valores.assinatura} onChange={(e) => onChange({ assinatura: e.target.value })} />
        </Campo>
        <Campo label="Data da Assinatura">
          <TextField type="date" value={valores.data_assinatura} onChange={(e) => onChange({ data_assinatura: e.target.value })} />
        </Campo>
      </Linha2>
    </>
  )
}

function contarPreenchidos(valores: CamposAdicionaisUtilizadorValores, campos: (keyof CamposAdicionaisUtilizadorValores)[]) {
  return campos.filter((c) => {
    const v = valores[c]
    return typeof v === 'boolean' ? v : Boolean(v)
  }).length
}

const CAMPOS_IDENTIFICACAO: (keyof CamposAdicionaisUtilizadorValores)[] = ['tipo_inscricao', 'bilhete_identidade', 'naturalidade', 'nacionalidade', 'grupo_sanguineo', 'alergias_restricoes']
const CAMPOS_ESCUTISMO: (keyof CamposAdicionaisUtilizadorValores)[] = ['sacramento', 'data_promessa', 'tempo_permanencia', 'cargo_funcao', 'participacao_grupos_paroquiais']
const CAMPOS_ENCARREGADO: (keyof CamposAdicionaisUtilizadorValores)[] = ['encarregado_nome', 'encarregado_grau_parentesco', 'encarregado_telefone', 'encarregado_email', 'autorizacao_encarregado']
const CAMPOS_ENDERECO: (keyof CamposAdicionaisUtilizadorValores)[] = ['endereco', 'bairro', 'municipio', 'provincia']
const CAMPOS_DOCUMENTOS: (keyof CamposAdicionaisUtilizadorValores)[] = ['docs_bi', 'docs_foto', 'docs_matricula', 'docs_cartao_sacramentos', 'docs_cartao_residente', 'docs_taxa_pagamento', 'termo_compromisso']

function resumo(n: number, total: number) {
  return n === 0 ? 'Por preencher' : `${n} de ${total} preenchidos`
}

/**
 * As 5 secções acima, cada uma dentro de um accordion fechado por defeito
 * — usada na edição (aba "Dados Pessoais" da ficha), onde faz mais
 * sentido ver tudo numa página só, mas sem a extensão toda visível de
 * uma vez. Para o formulário de criação, as mesmas secções são usadas
 * uma a uma, em passos (ver UtilizadorNovoForm.tsx).
 */
export function CamposAdicionaisAccordion({ valores, onChange }: SeccaoProps) {
  return (
    <div className="space-y-3">
      <Accordion titulo="Identificação" icone="fa-solid fa-id-card" resumo={resumo(contarPreenchidos(valores, CAMPOS_IDENTIFICACAO), CAMPOS_IDENTIFICACAO.length)}>
        <SeccaoIdentificacao valores={valores} onChange={onChange} />
      </Accordion>
      <Accordion titulo="Dados Escutistas" icone="fa-solid fa-scroll" resumo={resumo(contarPreenchidos(valores, CAMPOS_ESCUTISMO), CAMPOS_ESCUTISMO.length)}>
        <SeccaoEscutismo valores={valores} onChange={onChange} />
      </Accordion>
      <Accordion titulo="Encarregado de Educação" icone="fa-solid fa-people-roof" resumo={resumo(contarPreenchidos(valores, CAMPOS_ENCARREGADO), CAMPOS_ENCARREGADO.length)}>
        <SeccaoEncarregado valores={valores} onChange={onChange} />
      </Accordion>
      <Accordion titulo="Endereço" icone="fa-solid fa-location-dot" resumo={resumo(contarPreenchidos(valores, CAMPOS_ENDERECO), CAMPOS_ENDERECO.length)}>
        <SeccaoEndereco valores={valores} onChange={onChange} />
      </Accordion>
      <Accordion titulo="Documentos Entregues" icone="fa-solid fa-file-circle-check" resumo={resumo(contarPreenchidos(valores, CAMPOS_DOCUMENTOS), CAMPOS_DOCUMENTOS.length)}>
        <SeccaoDocumentos valores={valores} onChange={onChange} />
      </Accordion>
    </div>
  )
}
