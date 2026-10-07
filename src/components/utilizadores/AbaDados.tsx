import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAtualizarUtilizador } from '@/hooks/useUtilizadores'
import { usePerfisAcesso } from '@/hooks/usePerfisAcesso'
import { useOpcoesFiltro } from '@/hooks/useDashboardPainel'
import { useAuthStore } from '@/store/auth'
import { useCriarUnidadeSeccao, useUnidadesSeccao, extrairUnidadeExistente } from '@/hooks/useUnidadesSeccao'
import { getApiErrorMessage } from '@/lib/api'
import { inferirTipoUnidadeSeccao } from '@/lib/formatadores'
import { Button } from '@/components/ui/Button'
import { Campo, Linha2, TextField, SelectField } from '@/components/crud/FormShell'
import { ComboboxCriavel } from '@/components/ui/ComboboxCriavel'
import { CamposAdicionaisAccordion } from '@/components/utilizadores/CamposAdicionaisUtilizador'
import {
  utilizadorParaCamposAdicionais, limparDatasOpcionais,
  type UtilizadorListagem, type EstadoUtilizador,
} from '@/types/utilizador'
import { LABEL_TIPO_UNIDADE_SECCAO } from '@/types/unidadeSeccao'
import { notificar } from '@/lib/notificar'

const ESTADOS: EstadoUtilizador[] = ['ACTIVO', 'VALIDATION', 'INATIVO', 'TRANSFERIDO', 'FALECIDO', 'PARTIDA']

function montarForm(utilizador: UtilizadorListagem) {
  return {
    nome: utilizador.nome,
    genero: utilizador.genero,
    email: utilizador.email ?? '',
    telefone: utilizador.telefone ?? '',
    estado: utilizador.estado,
    motivo_inativacao: '',
    perfil_id: utilizador.perfil_id,
    seccao_id: utilizador.seccao_id ?? '',
    motivo_mudanca: '',
    data_nascimento: utilizador.data_nascimento ?? '',
    unidade_seccao_id: utilizador.unidade_seccao_id,
    ...utilizadorParaCamposAdicionais(utilizador),
  }
}

export function AbaDados({ utilizador }: { utilizador: UtilizadorListagem }) {
  const actualizar = useAtualizarUtilizador()
  const ehAdmin = useAuthStore((s) => s.user?.perfil_nome === 'ADMIN')
  const { data: perfis } = usePerfisAcesso(ehAdmin)
  const { data: seccoes } = useOpcoesFiltro('seccoes')

  const [form, setForm] = useState(montarForm(utilizador))

  useEffect(() => {
    setForm(montarForm(utilizador))
  }, [utilizador])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const vaiInactivar = form.estado === 'INATIVO' && utilizador.estado !== 'INATIVO'
    if (vaiInactivar && !form.motivo_inativacao.trim()) {
      notificar.aviso('Indica o motivo da inactivação.')
      return
    }
    const { motivo_inativacao: motivo, motivo_mudanca: motivoMudanca, perfil_id: perfilId, seccao_id: seccaoId, ...resto } = form
    const mudouSeccao = Number(seccaoId || 0) !== Number(utilizador.seccao_id || 0)
    const payload = {
      ...resto,
      ...(vaiInactivar ? { motivo_inativacao: motivo.trim() } : {}),
      ...(ehAdmin && perfilId !== utilizador.perfil_id ? { perfil_id: perfilId } : {}),
      ...(mudouSeccao ? { seccao_id: Number(seccaoId) || null, motivo_mudanca: motivoMudanca.trim() || undefined } : {}),
    }
    try {
      await actualizar.mutateAsync({ id: utilizador.id, payload: limparDatasOpcionais(payload) })
      notificar.sucesso('Dados actualizados.')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível guardar as alterações.'))
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-[var(--radius-pn)] border border-border bg-surface p-6 shadow-[var(--shadow-pn)]">

        <Campo label="Nome completo">
          <TextField required value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} />
        </Campo>
        <Linha2>
          <Campo label="Género">
            <SelectField value={form.genero} onChange={(e) => setForm((f) => ({ ...f, genero: e.target.value as typeof form.genero }))}>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </SelectField>
          </Campo>
          <Campo label="Estado">
            <SelectField value={form.estado} onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value as EstadoUtilizador }))}>
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </SelectField>
          </Campo>
        </Linha2>
        <Linha2>
          <Campo label="Secção / Categoria">
            <SelectField value={form.seccao_id ?? ''} onChange={(e) => setForm((f) => ({ ...f, seccao_id: Number(e.target.value) || '' }))}>
              <option value="">— Sem secção —</option>
              {(seccoes ?? []).map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </SelectField>
          </Campo>
          <Campo label={ehAdmin ? 'Perfil de acesso' : 'Perfil de acesso (só o ADMIN altera)'}>
            {ehAdmin ? (
              <SelectField value={form.perfil_id} onChange={(e) => setForm((f) => ({ ...f, perfil_id: Number(e.target.value) }))}>
                {(perfis ?? []).map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                {!perfis?.some((p) => p.id === form.perfil_id) && <option value={form.perfil_id}>{utilizador.perfil_nome}</option>}
              </SelectField>
            ) : (
              <TextField value={utilizador.perfil_nome ?? '—'} disabled readOnly />
            )}
          </Campo>
        </Linha2>
        {Number(form.seccao_id || 0) !== Number(utilizador.seccao_id || 0) && (
          <Campo label="Motivo da mudança de secção (fica no percurso)">
            <TextField maxLength={255} value={form.motivo_mudanca} placeholder="Ex.: passagem de secção por idade"
              onChange={(e) => setForm((f) => ({ ...f, motivo_mudanca: e.target.value }))} />
          </Campo>
        )}
        {form.estado === 'INATIVO' && utilizador.estado !== 'INATIVO' && (
          <Campo label="Motivo da inactivação (obrigatório)">
            <TextField required maxLength={255} value={form.motivo_inativacao} placeholder="Ex.: deixou de frequentar o agrupamento"
              onChange={(e) => setForm((f) => ({ ...f, motivo_inativacao: e.target.value }))} />
          </Campo>
        )}
        {utilizador.estado === 'INATIVO' && utilizador.motivo_inativacao && (
          <p className="rounded-lg bg-bg px-3 py-2 text-[12.5px] text-muted">
            Inactivado{utilizador.inativado_em ? ` em ${new Date(utilizador.inativado_em).toLocaleDateString('pt-PT')}` : ''} — motivo: <span className="font-medium text-text">{utilizador.motivo_inativacao}</span>
          </p>
        )}
        <Linha2>
          <Campo label="E-mail">
            <TextField type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </Campo>
          <Campo label="Telefone">
            <TextField type="tel" value={form.telefone} onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))} />
          </Campo>
        </Linha2>
        <Campo label="Data de Nascimento">
          <TextField type="date" value={form.data_nascimento ?? ''} onChange={(e) => setForm((f) => ({ ...f, data_nascimento: e.target.value }))} />
        </Campo>

        <CampoUnidadeSeccao
          seccaoNome={utilizador.seccao_nome}
          unidadeSeccaoId={form.unidade_seccao_id}
          onChange={(id) => setForm((f) => ({ ...f, unidade_seccao_id: id }))}
        />

        <CamposAdicionaisAccordion valores={form} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} />

        <Button type="submit" loading={actualizar.isPending}>
          Guardar Alterações
        </Button>
      </form>

      <div className="rounded-[var(--radius-pn)] border border-border bg-bg p-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-subtle">
          Estrutura territorial (só muda via Transferência)
        </h3>
        <div className="grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-3">
          <CampoLeitura label="Diocese" valor={utilizador.diocese_nome} />
          <CampoLeitura label="Vigararia" valor={utilizador.vigararia_nome} />
          <CampoLeitura label="Paróquia" valor={utilizador.paroquia_nome} />
          <CampoLeitura label="Agrupamento" valor={utilizador.agrupamento_nome} />
          <CampoLeitura label="Secção" valor={utilizador.seccao_nome} />
          <CampoLeitura label="Perfil" valor={utilizador.perfil_nome} />
        </div>
      </div>
    </div>
  )
}

function CampoLeitura({ label, valor }: { label: string; valor: string | null }) {
  return (
    <div>
      <p className="text-[10.5px] font-medium uppercase tracking-wide text-subtle">{label}</p>
      <p className="mt-0.5 font-medium text-text">{valor ?? '—'}</p>
    </div>
  )
}

/**
 * Campo Bando/Patrulha/Equipa — catálogo global partilhado por todos os
 * Agrupamentos. O `tipo` é deduzido da Secção do associado (best-effort,
 * ver `inferirTipoUnidadeSeccao`); sem correspondência mostra os três
 * tipos juntos, com o tipo de cada opção entre parêntesis, para o campo
 * continuar a funcionar mesmo sem Secção reconhecida.
 */
function CampoUnidadeSeccao({
  seccaoNome, unidadeSeccaoId, onChange,
}: {
  seccaoNome: string | null
  unidadeSeccaoId: number | null
  onChange: (id: number | null) => void
}) {
  const tipo = useMemo(() => inferirTipoUnidadeSeccao(seccaoNome), [seccaoNome])
  const { data: unidades } = useUnidadesSeccao(tipo ?? undefined)
  const criar = useCriarUnidadeSeccao()

  const opcoes = useMemo(
    () =>
      (unidades ?? []).map((u) => ({
        id: u.id,
        label: tipo ? u.nome : `${u.nome} (${LABEL_TIPO_UNIDADE_SECCAO[u.tipo]})`,
      })),
    [unidades, tipo]
  )

  async function handleCriar(nome: string) {
    if (!tipo) {
      // Sem tipo inferido não há como saber se é bando/patrulha/equipa —
      // não deixa criar às cegas.
      notificar.aviso('Define primeiro a Secção do associado para poder criar um novo Bando/Patrulha/Equipa.')
      return
    }
    try {
      const criado = await criar.mutateAsync({ tipo, nome })
      onChange(criado.id)
      notificar.sucesso(`"${criado.nome}" criado e associado.`)
    } catch (err) {
      const existente = extrairUnidadeExistente(err)
      if (existente) {
        onChange(existente.id)
        notificar.info(`"${existente.nome}" já existia — foi seleccionado.`)
        return
      }
      notificar.erro(getApiErrorMessage(err, 'Não foi possível criar.'))
    }
  }

  const label = tipo ? LABEL_TIPO_UNIDADE_SECCAO[tipo] : 'Bando / Patrulha / Equipa'

  return (
    <Campo label={label}>
      <ComboboxCriavel
        value={unidadeSeccaoId}
        onSelect={onChange}
        opcoes={opcoes}
        onCriar={handleCriar}
        aCriar={criar.isPending}
        placeholder={`Pesquisar ou criar ${label.toLowerCase()}...`}
      />
    </Campo>
  )
}
