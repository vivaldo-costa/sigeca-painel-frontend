import { useMemo, useState } from 'react'
import { Users, Pencil, Trash2, Loader2, Check, X, Plus, UserRound, Printer } from 'lucide-react'
import { ModalNovaUnidade, ModalMembrosUnidade } from '@/components/unidadesSeccao/ModaisUnidadeSeccao'
import { usePermissao } from '@/hooks/usePermissao'
import {
  useUnidadesSeccao, useRenomearUnidadeSeccao, useEliminarUnidadeSeccao, obterUnidadesComMembros,
} from '@/hooks/useUnidadesSeccao'
import { imprimirUnidadesSeccao } from '@/lib/imprimirUnidadesSeccao'
import { useAuthStore } from '@/store/auth'
import { useConfirmar } from '@/components/ui/ConfirmProvider'
import { getApiErrorMessage } from '@/lib/api'
import { formatarAgrupamento } from '@/lib/formatadores'
import { notificar } from '@/lib/notificar'
import { Card } from '@/components/ui/Card'
import { LABEL_TIPO_UNIDADE_SECCAO, type TipoUnidadeSeccao, type UnidadeSeccao } from '@/types/unidadeSeccao'

const TIPOS: TipoUnidadeSeccao[] = ['bando', 'patrulha', 'equipa']

const CORES_TIPO: Record<TipoUnidadeSeccao, string> = {
  bando: 'bg-badge-orange-bg text-badge-orange-text',
  patrulha: 'bg-badge-blue-bg text-badge-blue-text',
  equipa: 'bg-badge-violet-bg text-badge-violet-text',
}

/**
 * Visão e controlo geral do catálogo global de Bandos/Patrulhas/Equipas —
 * mostra tudo (todos os Agrupamentos), quem criou cada entrada, e dá ao
 * ADMIN acções de renomear/eliminar. Fora do ADMIN, a lista é só de
 * consulta: quem gere isto no dia-a-dia é cada Agrupamento, a partir da
 * ficha do associado (aba Dados).
 */
export function UnidadesSeccaoLista() {
  const user = useAuthStore((s) => s.user)
  const ehAdmin = user?.perfil_nome === 'ADMIN'

  const { data, isLoading } = useUnidadesSeccao()
  const renomear = useRenomearUnidadeSeccao()
  const eliminar = useEliminarUnidadeSeccao()
  const confirmar = useConfirmar()

  const [filtroTipo, setFiltroTipo] = useState<TipoUnidadeSeccao | ''>('')
  const [filtroNome, setFiltroNome] = useState('')
  const [aEditar, setAEditar] = useState<UnidadeSeccao | null>(null)
  const [novoNome, setNovoNome] = useState('')
  const [criarAberto, setCriarAberto] = useState(false)
  const [membrosDe, setMembrosDe] = useState<UnidadeSeccao | null>(null)
  const { criar: podeCriar } = usePermissao('Escuteiros')
  // 'todos' enquanto gera o PDF de tudo; o id da unidade enquanto gera o PDF de uma só.
  const [aImprimir, setAImprimir] = useState<'todos' | number | null>(null)

  const filtrados = useMemo(() => {
    const termo = filtroNome.trim().toLowerCase()
    return (data ?? []).filter((u) => {
      if (filtroTipo && u.tipo !== filtroTipo) return false
      if (termo && !u.nome.toLowerCase().includes(termo)) return false
      return true
    })
  }, [data, filtroTipo, filtroNome])

  async function handleImprimirTodos() {
    if (!filtrados.length) { notificar.aviso('Não há registos para imprimir.'); return }
    setAImprimir('todos')
    try {
      const unidades = await obterUnidadesComMembros({
        tipo: filtroTipo || undefined,
        // Sem pesquisa, o filtro de tipo já basta (evita mandar centenas de ids no URL).
        ids: filtroNome.trim() ? filtrados.map((u) => u.id) : undefined,
      })
      const comMembros = unidades.filter((u) => u.membros.length > 0)
      if (!comMembros.length) { notificar.aviso('Nenhuma das unidades listadas tem membros na tua área.'); return }
      const rotuloFiltro = filtroTipo ? `${LABEL_TIPO_UNIDADE_SECCAO[filtroTipo]}s` : 'Bandos, Patrulhas e Equipas'
      const semMembros = unidades.length - comMembros.length
      imprimirUnidadesSeccao(comMembros, {
        titulo: `Lista de membros — ${rotuloFiltro}`,
        nomeFicheiro: `lista-${filtroTipo || 'unidades'}-membros`,
        subtitulo: [
          `${comMembros.length} unidade(s) com membros`,
          semMembros > 0 ? `${semMembros} sem membros na tua área (omitida(s))` : '',
          filtroNome.trim() ? `Pesquisa: "${filtroNome.trim()}"` : '',
        ].filter(Boolean).join(' · '),
      })
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível gerar a lista.'))
    } finally {
      setAImprimir(null)
    }
  }

  async function handleImprimirUma(unidade: UnidadeSeccao) {
    setAImprimir(unidade.id)
    try {
      const [u] = await obterUnidadesComMembros({ ids: [unidade.id] })
      if (!u?.membros.length) { notificar.aviso('Não há membros na tua área para imprimir.'); return }
      imprimirUnidadesSeccao([u], {
        titulo: `Lista de membros — ${LABEL_TIPO_UNIDADE_SECCAO[u.tipo]} ${u.nome}`,
        nomeFicheiro: `lista-${u.tipo}-${u.nome}`,
      })
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível gerar a lista.'))
    } finally {
      setAImprimir(null)
    }
  }

  function iniciarEdicao(unidade: UnidadeSeccao) {
    setAEditar(unidade)
    setNovoNome(unidade.nome)
  }

  async function guardarEdicao() {
    if (!aEditar) return
    const nome = novoNome.trim()
    if (!nome) return
    try {
      await renomear.mutateAsync({ id: aEditar.id, nome })
      notificar.sucesso('Renomeado com sucesso.')
      setAEditar(null)
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível renomear.'))
    }
  }

  async function handleEliminar(unidade: UnidadeSeccao) {
    const ok = await confirmar({
      titulo: `Eliminar "${unidade.nome}"`,
      mensagem: `Tens a certeza que queres eliminar este(a) ${LABEL_TIPO_UNIDADE_SECCAO[unidade.tipo].toLowerCase()} do catálogo global? Esta acção não pode ser desfeita.`,
      perigoso: true,
    })
    if (!ok) return
    try {
      await eliminar.mutateAsync(unidade.id)
      notificar.sucesso('Eliminado com sucesso.')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível eliminar.'))
    }
  }

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-7">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2.5 text-xl font-bold text-text">
            <Users className="size-5 text-muted" /> Bandos, Patrulhas e Equipas
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            Bando para os Lobitos, Patrulha para os Exploradores e Equipa para os Caminheiros. O nome é partilhado por todos os agrupamentos; os membros são de cada agrupamento.
            {!ehAdmin && ' Só o Administrador pode mudar o nome ou eliminar.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleImprimirTodos}
            disabled={aImprimir !== null || isLoading}
            title="Imprimir (PDF) as unidades listadas com os respectivos membros"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3.5 py-2 text-[13px] font-semibold text-text hover:bg-bg disabled:opacity-50"
          >
            {aImprimir === 'todos' ? <Loader2 className="size-3.5 animate-spin" /> : <Printer className="size-3.5" />} Imprimir todos
          </button>
        {podeCriar && (
          <button onClick={() => setCriarAberto(true)} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-black">
            <Plus className="size-3.5" /> Novo
          </button>
        )}
        </div>
      </div>

      <Card className="mb-5 flex flex-wrap items-center gap-3 p-4">
        <div className="flex gap-1.5">
          <button
            onClick={() => setFiltroTipo('')}
            className={`rounded-full px-3 py-1.5 text-[12.5px] font-medium transition ${
              filtroTipo === '' ? 'bg-[#111827] text-white' : 'bg-bg text-muted hover:text-text'
            }`}
          >
            Todos
          </button>
          {TIPOS.map((t) => (
            <button
              key={t}
              onClick={() => setFiltroTipo(t)}
              className={`rounded-full px-3 py-1.5 text-[12.5px] font-medium transition ${
                filtroTipo === t ? 'bg-[#111827] text-white' : 'bg-bg text-muted hover:text-text'
              }`}
            >
              {LABEL_TIPO_UNIDADE_SECCAO[t]}
            </button>
          ))}
        </div>
        <input
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
          placeholder="Pesquisar por nome..."
          className="h-9 min-w-[200px] flex-1 rounded-lg border border-border bg-white px-3 text-[12.5px] outline-none focus:border-[#111827]"
        />
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-bg text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3.5 py-2.5 font-medium">Tipo</th>
              <th className="px-3.5 py-2.5 font-medium">Nome</th>
              <th className="px-3.5 py-2.5 font-medium">Agrupamento criador</th>
              <th className="px-3.5 py-2.5 font-medium">Nº de membros</th>
              <th className="px-3.5 py-2.5 font-medium">Criado em</th>
              <th className="px-3.5 py-2.5 text-center font-medium">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-subtle">
                  <Loader2 className="mx-auto size-5 animate-spin" />
                </td>
              </tr>
            )}
            {!isLoading && filtrados.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-subtle">Nenhum registo encontrado.</td>
              </tr>
            )}
            {!isLoading &&
              filtrados.map((u) => {
                const emEdicao = aEditar?.id === u.id
                return (
                  <tr key={u.id} className="hover:bg-bg">
                    <td className="whitespace-nowrap px-3.5 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${CORES_TIPO[u.tipo]}`}>
                        {LABEL_TIPO_UNIDADE_SECCAO[u.tipo]}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-text">
                      {emEdicao ? (
                        <input
                          autoFocus
                          value={novoNome}
                          onChange={(e) => setNovoNome(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') guardarEdicao()
                            if (e.key === 'Escape') setAEditar(null)
                          }}
                          className="h-8 w-full max-w-[220px] rounded-lg border border-border px-2 text-[12.5px] outline-none focus:border-[#111827]"
                        />
                      ) : (
                        <span className="font-medium">{u.nome}</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-2.5 text-muted">
                      {u.agrupamento_criador_nome
                        ? formatarAgrupamento({ nome: u.agrupamento_criador_nome, ab_agrupamento: u.agrupamento_criador_ab_agrupamento })
                        : '—'}
                    </td>
                    <td className="px-3.5 py-2.5 text-muted">{u.total_membros ?? 0}</td>
                    <td className="whitespace-nowrap px-3.5 py-2.5 text-muted">
                      {new Date(u.created_at).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-3.5 py-2.5">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setMembrosDe(u)} title="Membros"
                            className="flex h-7 items-center gap-1 rounded-lg border border-border px-2 text-[11.5px] font-medium text-text hover:bg-bg">
                            <UserRound className="size-3.5" /> Membros
                          </button>
                          <button onClick={() => handleImprimirUma(u)} disabled={aImprimir !== null} title="Imprimir lista de membros (PDF)"
                            className="grid size-7 place-items-center rounded-lg border border-border text-text hover:bg-bg disabled:opacity-50">
                            {aImprimir === u.id ? <Loader2 className="size-3.5 animate-spin" /> : <Printer className="size-3.5" />}
                          </button>
                          {!ehAdmin ? null : emEdicao ? (
                            <>
                              <button
                                onClick={guardarEdicao}
                                disabled={renomear.isPending}
                                className="grid size-7 place-items-center rounded-lg bg-badge-green-bg text-badge-green-text hover:opacity-80 disabled:opacity-50"
                              >
                                {renomear.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                              </button>
                              <button
                                onClick={() => setAEditar(null)}
                                className="grid size-7 place-items-center rounded-lg bg-bg text-muted hover:opacity-80"
                              >
                                <X className="size-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => iniciarEdicao(u)}
                                className="grid size-7 place-items-center rounded-lg bg-badge-blue-bg text-badge-blue-text hover:opacity-80"
                              >
                                <Pencil className="size-3.5" />
                              </button>
                              <button
                                onClick={() => handleEliminar(u)}
                                disabled={eliminar.isPending}
                                className="grid size-7 place-items-center rounded-lg bg-badge-red-bg text-badge-red-text hover:opacity-80 disabled:opacity-50"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </Card>

      {criarAberto && <ModalNovaUnidade onClose={() => setCriarAberto(false)} onCriada={(u) => { setCriarAberto(false); setMembrosDe(u) }} />}
      {membrosDe && <ModalMembrosUnidade unidade={membrosDe} onClose={() => setMembrosDe(null)} />}
    </div>
  )
}
