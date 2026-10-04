import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface OpcoesConfirmacao {
  titulo: string
  mensagem: string
  textoConfirmar?: string
  textoCancelar?: string
  perigoso?: boolean
}

type ConfirmarFn = (opcoes: OpcoesConfirmacao) => Promise<boolean>

const ConfirmContext = createContext<ConfirmarFn | null>(null)

/**
 * Diálogo de confirmação para qualquer decisão importante (eliminar,
 * terminar sessão, etc.) — chamado como uma promise, nunca o
 * `window.confirm()` nativo do browser (feio, não segue o resto do
 * visual, e não dá para personalizar o texto dos botões).
 *
 *   const confirmar = useConfirmar()
 *   const ok = await confirmar({ titulo: 'Eliminar utilizador', mensagem: '...', perigoso: true })
 *   if (!ok) return
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pedido, setPedido] = useState<{ opcoes: OpcoesConfirmacao; resolver: (v: boolean) => void } | null>(null)

  const confirmar = useCallback<ConfirmarFn>((opcoes) => {
    return new Promise((resolve) => {
      setPedido({ opcoes, resolver: resolve })
    })
  }, [])

  function responder(valor: boolean) {
    pedido?.resolver(valor)
    setPedido(null)
  }

  return (
    <ConfirmContext.Provider value={confirmar}>
      {children}
      {pedido && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-center gap-2.5">
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${pedido.opcoes.perigoso ? 'bg-red-50 text-badge-red-text' : 'bg-bg text-muted'}`}>
                <AlertTriangle className="size-4.5" />
              </span>
              <h2 className="text-[15px] font-bold text-text">{pedido.opcoes.titulo}</h2>
            </div>
            <p className="mb-5 text-[13px] leading-relaxed text-muted">{pedido.opcoes.mensagem}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => responder(false)}
                className="rounded-lg border border-border px-3.5 py-2 text-[12.5px] font-semibold text-text hover:bg-bg"
              >
                {pedido.opcoes.textoCancelar ?? 'Cancelar'}
              </button>
              <button
                onClick={() => responder(true)}
                autoFocus
                className={`rounded-lg px-3.5 py-2 text-[12.5px] font-semibold text-white hover:opacity-90 ${pedido.opcoes.perigoso ? 'bg-badge-red-text' : 'bg-[#111827]'}`}
              >
                {pedido.opcoes.textoConfirmar ?? 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirmar(): ConfirmarFn {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirmar() só pode ser usado dentro de <ConfirmProvider>.')
  return ctx
}
