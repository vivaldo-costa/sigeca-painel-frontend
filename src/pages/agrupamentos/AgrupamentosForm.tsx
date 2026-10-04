import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { agrupamentoHooks, vigarariaHooks, paroquiaHooks } from '@/hooks/useEstrutura'
import { getApiErrorMessage } from '@/lib/api'
import { FormShell, Campo, Linha2, TextField, SelectField } from '@/components/crud/FormShell'
import type { Agrupamento } from '@/types/estrutura'

const VAZIO: Omit<Agrupamento, 'id'> = {
  nome: '', ab_agrupamento: '', paroquia_id: 0, vigararia_id: 0,
  chefe_agrupamento: '', chefe_telefone: '', chefe_email: '',
  assistente_espiritual: '', assistente_telefone: '', assistente_email: '',
  secretario: '', secretario_telefone: '', secretario_email: '', data_fundacao: '',
}

export function AgrupamentosForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editando = !!id
  const { data: existente } = agrupamentoHooks.useOne(id ? Number(id) : undefined)
  const { data: vigararias } = vigarariaHooks.useList()
  const { data: paroquias } = paroquiaHooks.useList()
  const criar = agrupamentoHooks.useCreate()
  const actualizar = agrupamentoHooks.useUpdate()

  const [form, setForm] = useState<Omit<Agrupamento, 'id'>>(VAZIO)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (existente) setForm(existente)
  }, [existente])

  // Cascata: so mostra paroquias da vigararia seleccionada (filtro client-side,
  // tal como o form.php actual faz com a lista pre-carregada de paroquias).
  const paroquiasFiltradas = useMemo(
    () => (paroquias ?? []).filter((p) => p.vigararia_id === form.vigararia_id),
    [paroquias, form.vigararia_id]
  )

  function campo(nome: keyof typeof form) {
    return {
      value: (form[nome] as string) ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [nome]: e.target.value })),
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      const payload = { ...form }
      delete (payload as Partial<typeof payload>).vigararia_id // campo auxiliar de UI, nao persistido
      if (editando) await actualizar.mutateAsync({ id: Number(id), payload })
      else await criar.mutateAsync(payload)
      navigate('/agrupamentos')
    } catch (err) {
      setErro(getApiErrorMessage(err, 'Não foi possível guardar o agrupamento.'))
    }
  }

  return (
    <FormShell
      titulo={editando ? 'Editar Agrupamento' : 'Novo Agrupamento'}
      voltarHref="/agrupamentos"
      onSubmit={handleSubmit}
      submitting={criar.isPending || actualizar.isPending}
      erro={erro}
    >
      <Campo label="Nome"><TextField required {...campo('nome')} /></Campo>

      <Linha2>
        <Campo label="Vigararia">
          <SelectField
            required
            value={form.vigararia_id || ''}
            onChange={(e) => setForm((f) => ({ ...f, vigararia_id: Number(e.target.value), paroquia_id: 0 }))}
          >
            <option value="">-- Seleccionar --</option>
            {vigararias?.map((v) => (
              <option key={v.id} value={v.id}>{v.nome}</option>
            ))}
          </SelectField>
        </Campo>
        <Campo label="Paróquia">
          <SelectField
            required
            disabled={!form.vigararia_id}
            value={form.paroquia_id || ''}
            onChange={(e) => setForm((f) => ({ ...f, paroquia_id: Number(e.target.value) }))}
          >
            <option value="">-- Seleccionar --</option>
            {paroquiasFiltradas.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </SelectField>
        </Campo>
      </Linha2>

      <Linha2>
        <Campo label="N° do Agrupamento">
          <TextField required minLength={5} maxLength={5} pattern=".{5}" title="Deve ter exactamente 5 caracteres (ex.: 00001)" {...campo('ab_agrupamento')} />
        </Campo>
        <Campo label="Data de Fundação"><TextField type="date" {...campo('data_fundacao')} /></Campo>
      </Linha2>

      <Campo label="Chefe de Agrupamento"><TextField {...campo('chefe_agrupamento')} /></Campo>
      <Linha2>
        <Campo label="Telefone do Chefe"><TextField type="tel" {...campo('chefe_telefone')} /></Campo>
        <Campo label="E-mail do Chefe"><TextField type="email" {...campo('chefe_email')} /></Campo>
      </Linha2>

      <Campo label="Assistente Espiritual"><TextField {...campo('assistente_espiritual')} /></Campo>
      <Linha2>
        <Campo label="Telefone do Assistente"><TextField type="tel" {...campo('assistente_telefone')} /></Campo>
        <Campo label="E-mail do Assistente"><TextField type="email" {...campo('assistente_email')} /></Campo>
      </Linha2>

      <Campo label="Secretário"><TextField {...campo('secretario')} /></Campo>
      <Linha2>
        <Campo label="Telefone do Secretário"><TextField type="tel" {...campo('secretario_telefone')} /></Campo>
        <Campo label="E-mail do Secretário"><TextField type="email" {...campo('secretario_email')} /></Campo>
      </Linha2>
    </FormShell>
  )
}
