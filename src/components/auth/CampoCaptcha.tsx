import { useEffect, useState, forwardRef } from 'react'
import { RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'

interface Props {
  onToken: (token: string) => void
  resposta: string
  onRespostaChange: (valor: string) => void
}

/**
 * Secção 9 do roteiro — desafio matemático simples, auto-hospedado (sem
 * depender de decidir um fornecedor externo como o Google reCAPTCHA,
 * mesma lição da Fase 4.2 com o SMS). Só aparece a partir do limiar de
 * tentativas falhadas configurado no backend.
 */
export const CampoCaptcha = forwardRef<HTMLInputElement, Props>(({ onToken, resposta, onRespostaChange }, ref) => {
  const [pergunta, setPergunta] = useState<string | null>(null)

  async function pedirNovoDesafio() {
    setPergunta(null)
    const { data } = await api.get<{ dados: { pergunta: string; token: string } }>('/auth/captcha')
    setPergunta(data.dados.pergunta)
    onToken(data.dados.token)
  }

  useEffect(() => {
    pedirNovoDesafio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-[13px] font-medium text-text">Confirmação de segurança</label>
      <div className="flex items-center gap-2">
        <span className="flex h-11 flex-1 items-center rounded-lg border border-border bg-bg px-3 text-[13px] text-text">
          {pergunta ?? 'A carregar...'}
        </span>
        <button type="button" onClick={pedirNovoDesafio} className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border text-muted hover:bg-bg" title="Novo desafio">
          <RefreshCw className="size-4" />
        </button>
      </div>
      <input
        ref={ref}
        value={resposta}
        onChange={(e) => onRespostaChange(e.target.value)}
        type="number"
        placeholder="A tua resposta"
        className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-[13px] outline-none focus:border-[#111827]"
      />
    </div>
  )
})
CampoCaptcha.displayName = 'CampoCaptcha'
