import { useEffect, useState } from 'react'
import { X, Loader2, LockOpen } from 'lucide-react'
import { usePermissoesPerfil, useGuardarPermissoes } from '@/hooks/usePerfisAcesso'
import { getApiErrorMessage } from '@/lib/api'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import type { MapaPermissoes, AcoesModulo } from '@/types/perfis'
import { notificar } from '@/lib/notificar'

interface Props {
  perfilId: number
  perfilNome: string
  somenteLeitura: boolean // TECNICO pode ver, só ADMIN edita
  onClose: () => void
}

const ACOES: { chave: keyof AcoesModulo; label: string }[] = [
  { chave: 'ver', label: 'Ver' },
  { chave: 'criar', label: 'Criar' },
  { chave: 'editar', label: 'Editar' },
  { chave: 'apagar', label: 'Apagar' },
]

export function ModalPermissoes({ perfilId, perfilNome, somenteLeitura, onClose }: Props) {
  const { data, isLoading } = usePermissoesPerfil(perfilId)
  const guardar = useGuardarPermissoes()
  const [mapa, setMapa] = useState<MapaPermissoes>({})

  useEffect(() => {
    if (!data) return
    const inicial: MapaPermissoes = {}
    data.modulos.forEach((m) => {
      const existente = data.permissoes.find((p) => p.modulo_id === m.id)
      inicial[m.id] = {
        ver: !!existente?.pode_ver,
        criar: !!existente?.pode_criar,
        editar: !!existente?.pode_editar,
        apagar: !!existente?.pode_apagar,
      }
    })
    setMapa(inicial)
  }, [data])

  function alternar(moduloId: number, acao: keyof AcoesModulo) {
    setMapa((m) => {
      const actual = m[moduloId] ?? { ver: false, criar: false, editar: false, apagar: false }
      const novoValor = !actual[acao]
      // Activar criar/editar/apagar implica activar "ver" também.
      const proximo = { ...actual, [acao]: novoValor }
      if (acao !== 'ver' && novoValor) proximo.ver = true
      return { ...m, [moduloId]: proximo }
    })
  }

  async function handleGuardar() {
    try {
      await guardar.mutateAsync({ perfilId, permissoes: mapa })
      notificar.sucesso('Permissões guardadas com sucesso.')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível guardar as permissões.'))
    }
  }

  const gruposOrdenados = data
    ? Array.from(new Set(data.modulos.map((m) => m.grupo)))
    : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-text">
              <LockOpen className="size-4 text-muted" /> Permissões — <span className="text-[#111827]">{perfilNome}</span>
            </h2>
            <p className="mt-0.5 text-xs text-subtle">Activa ou desactiva o acesso a cada módulo do sistema.</p>
          </div>
          <button onClick={onClose} className="text-subtle transition hover:text-text">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading && <div className="flex justify-center py-10"><Loader2 className="size-6 animate-spin text-subtle" /></div>}

          {somenteLeitura && (
            <Alert variant="warning" dismissible={false}>Só o ADMIN pode alterar permissões — estás a ver em modo de leitura.</Alert>
          )}

          {data && gruposOrdenados.map((grupo) => (
            <div key={grupo} className="mb-5">
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">{grupo}</h3>
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-left text-[12.5px]">
                  <thead className="bg-bg text-[10.5px] uppercase tracking-wide text-subtle">
                    <tr>
                      <th className="px-3 py-2 font-medium">Módulo</th>
                      {ACOES.map((a) => <th key={a.chave} className="px-2 py-2 text-center font-medium">{a.label}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.modulos.filter((m) => m.grupo === grupo).map((m) => (
                      <tr key={m.id}>
                        <td className="px-3 py-2 font-medium text-text">{m.label}</td>
                        {ACOES.map((a) => (
                          <td key={a.chave} className="px-2 py-2 text-center">
                            <input
                              type="checkbox"
                              disabled={somenteLeitura}
                              checked={mapa[m.id]?.[a.chave] ?? false}
                              onChange={() => alternar(m.id, a.chave)}
                              className="size-4 accent-[#111827] disabled:opacity-40"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {!somenteLeitura && (
          <div className="flex shrink-0 gap-3 border-t border-border px-6 py-4">
            <Button variant="secondary" onClick={onClose} className="flex-1">Fechar</Button>
            <Button onClick={handleGuardar} loading={guardar.isPending} className="flex-1">
              {guardar.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Guardar Permissões
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
