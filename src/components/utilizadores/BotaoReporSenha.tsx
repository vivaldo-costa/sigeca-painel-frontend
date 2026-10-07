import { useState } from 'react'
import { KeyRound, Copy, X } from 'lucide-react'
import { api, getApiErrorMessage } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { useConfirmar } from '@/components/ui/ConfirmProvider'
import { notificar } from '@/lib/notificar'

interface Props { utilizadorId: number; nome: string; codigo: string }

/**
 * Só para o ADMIN: gera uma palavra-passe provisória e mostra-a UMA vez,
 * para ser entregue ao próprio escuteiro (que a deve mudar no 1º acesso).
 */
export function BotaoReporSenha({ utilizadorId, nome, codigo }: Props) {
  const ehAdmin = useAuthStore((s) => s.user?.perfil_nome === 'ADMIN')
  const confirmar = useConfirmar()
  const [senha, setSenha] = useState<string | null>(null)
  const [aRepor, setARepor] = useState(false)
  if (!ehAdmin) return null

  async function repor() {
    const ok = await confirmar({
      titulo: 'Repor palavra-passe',
      mensagem: `Gerar uma nova palavra-passe provisória para ${nome} (${codigo})? A palavra-passe actual deixa de funcionar.`,
      textoConfirmar: 'Repor',
      perigoso: true,
    })
    if (!ok) return
    setARepor(true)
    try {
      const { data } = await api.post<{ dados: { senha_provisoria: string } }>(`/utilizadores/${utilizadorId}/repor-senha`)
      setSenha(data.dados.senha_provisoria)
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível repor a palavra-passe.'))
    } finally {
      setARepor(false)
    }
  }

  return (
    <>
      <button onClick={repor} disabled={aRepor} className="ml-auto flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-medium text-text hover:bg-bg disabled:opacity-50">
        <KeyRound className="size-3.5" /> Repor palavra-passe
      </button>
      {senha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSenha(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-bold text-text">Palavra-passe provisória</h3>
              <button onClick={() => setSenha(null)} className="text-subtle hover:text-text"><X className="size-4" /></button>
            </div>
            <p className="mb-3 text-[12.5px] text-muted">
              Entrega-a só ao próprio ({codigo}). Não volta a ser mostrada — pede-lhe para a mudar no primeiro acesso.
            </p>
            <div className="mb-3 flex items-center justify-between rounded-lg bg-bg px-3 py-2.5">
              <span className="select-all font-mono text-[15px] font-semibold tracking-wide text-text">{senha}</span>
              <button onClick={async () => { await navigator.clipboard.writeText(senha); notificar.sucesso('Copiada.') }} title="Copiar" className="text-muted hover:text-text"><Copy className="size-4" /></button>
            </div>
            <button onClick={() => setSenha(null)} className="w-full rounded-lg bg-[#111827] py-2 text-[13px] font-semibold text-white">Fechar</button>
          </div>
        </div>
      )}
    </>
  )
}
