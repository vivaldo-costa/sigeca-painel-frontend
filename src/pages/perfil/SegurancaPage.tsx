import { useState } from 'react'
import { ShieldCheck, Loader2, Copy, Check } from 'lucide-react'
import { useEstadoTotp, useIniciarTotp, useConfirmarTotp, useDesactivarTotp } from '@/hooks/useTotp'
import { getApiErrorMessage } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import type { ActivacaoTotp } from '@/types/totp'
import { notificar } from '@/lib/notificar'

export function SegurancaPage() {
  const { data: estado, isLoading } = useEstadoTotp()
  const iniciar = useIniciarTotp()
  const confirmar = useConfirmarTotp()
  const desactivar = useDesactivarTotp()

  const [activacao, setActivacao] = useState<ActivacaoTotp | null>(null)
  const [codigoConfirmacao, setCodigoConfirmacao] = useState('')
  const [codigosRecuperacao, setCodigosRecuperacao] = useState<string[] | null>(null)
  const [passwordDesactivar, setPasswordDesactivar] = useState('')
  const [mostrarDesactivar, setMostrarDesactivar] = useState(false)
  const [copiado, setCopiado] = useState(false)

  async function handleIniciar() {
    try {
      const dados = await iniciar.mutateAsync()
      setActivacao(dados)
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível iniciar a activação.'))
    }
  }

  async function handleConfirmar(e: React.FormEvent) {
    e.preventDefault()
    try {
      const resultado = await confirmar.mutateAsync(codigoConfirmacao)
      setCodigosRecuperacao(resultado.codigosRecuperacao)
      setActivacao(null)
      setCodigoConfirmacao('')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Código inválido.'))
    }
  }

  async function handleDesactivar(e: React.FormEvent) {
    e.preventDefault()
    try {
      await desactivar.mutateAsync(passwordDesactivar)
      setMostrarDesactivar(false)
      setPasswordDesactivar('')
    } catch (err) {
      notificar.erro(getApiErrorMessage(err, 'Não foi possível desactivar.'))
    }
  }

  function copiarCodigos() {
    if (!codigosRecuperacao) return
    navigator.clipboard.writeText(codigosRecuperacao.join('\n'))
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-subtle" /></div>

  return (
    <div className="mx-auto max-w-[600px] px-4 py-6 sm:px-6 sm:py-7">
      <h1 className="mb-5 flex items-center gap-2.5 text-xl font-bold text-text">
        <ShieldCheck className="size-5 text-muted" /> Segurança
      </h1>


      {/* Códigos de recuperação, mostrados só uma vez, logo a seguir a activar */}
      {codigosRecuperacao && (
        <Card className="mb-4 border border-amber-200 bg-amber-50 p-4">
          <p className="mb-1 text-[13px] font-semibold text-text">2FA activado — guarda estes códigos de recuperação</p>
          <p className="mb-3 text-[12px] text-muted">
            Cada um só pode ser usado uma vez, e servem para entrares se perderes o acesso à app de autenticação.
            Esta é a única vez que os vais ver.
          </p>
          <div className="mb-3 grid grid-cols-2 gap-1.5 rounded-lg bg-white p-3 font-mono text-[12.5px]">
            {codigosRecuperacao.map((c) => <span key={c}>{c}</span>)}
          </div>
          <button onClick={copiarCodigos} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-text transition-colors hover:bg-bg">
            {copiado ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} {copiado ? 'Copiado' : 'Copiar todos'}
          </button>
        </Card>
      )}

      {/* Já activo */}
      {estado?.ativo && !codigosRecuperacao && (
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-badge-green-bg px-2 py-0.5 text-[10.5px] font-semibold text-badge-green-text">Activo</span>
            <p className="text-[12.5px] text-muted">Desde {estado.ativado_em ? new Date(estado.ativado_em).toLocaleDateString('pt-PT') : '—'}</p>
          </div>
          <p className="mb-4 text-[12.5px] text-muted">{estado.codigos_recuperacao_restantes} código(s) de recuperação por usar.</p>

          {!mostrarDesactivar ? (
            <button onClick={() => setMostrarDesactivar(true)} className="rounded-lg border border-border px-3.5 py-2 text-[12.5px] font-semibold text-text transition-colors hover:bg-bg">
              Desactivar 2FA
            </button>
          ) : (
            <form onSubmit={handleDesactivar} className="flex flex-col gap-2">
              <label className="text-[12px] text-muted">Confirma a tua palavra-passe para desactivar:</label>
              <input
                type="password" value={passwordDesactivar} onChange={(e) => setPasswordDesactivar(e.target.value)}
                className="h-9 rounded-lg border border-border px-3 text-[12.5px] outline-none focus:border-[#111827]"
              />
              <div className="flex gap-2">
                <button type="submit" disabled={desactivar.isPending} className="rounded-lg bg-badge-red-text px-3.5 py-2 text-[12.5px] font-semibold text-white disabled:opacity-50">Confirmar Desactivação</button>
                <button type="button" onClick={() => setMostrarDesactivar(false)} className="rounded-lg border border-border px-3.5 py-2 text-[12.5px] font-semibold text-text transition-colors hover:bg-bg">Cancelar</button>
              </div>
            </form>
          )}
        </Card>
      )}

      {/* Inactivo, sem activação em curso */}
      {!estado?.ativo && !activacao && !codigosRecuperacao && (
        <Card className="p-4">
          <p className="mb-1 text-[13px] font-semibold text-text">Autenticação de dois factores</p>
          <p className="mb-4 text-[12.5px] text-muted">
            Acrescenta uma camada extra de segurança — além da palavra-passe, vais precisar de um código gerado por uma
            app de autenticação (Google Authenticator, Authy, etc.) para entrar.
          </p>
          <button onClick={handleIniciar} disabled={iniciar.isPending} className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50">
            {iniciar.isPending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-3.5" />}
            Activar 2FA
          </button>
        </Card>
      )}

      {/* Activação em curso — mostrar QR code + pedir confirmação */}
      {activacao && (
        <Card className="p-4">
          <p className="mb-3 text-[13px] font-semibold text-text">Digitaliza este código com a tua app de autenticação</p>
          <div className="mb-3 flex justify-center">
            <img src={activacao.qrCodeDataUrl} alt="QR Code do 2FA" className="size-44 rounded-lg border border-border" />
          </div>
          <p className="mb-4 text-center text-[11px] text-subtle">
            Não consegues digitalizar? Introduz manualmente: <span className="font-mono">{activacao.segredo}</span>
          </p>
          <form onSubmit={handleConfirmar} className="flex flex-col gap-2">
            <label className="text-[12px] text-muted">Introduz o código gerado pela app para confirmar:</label>
            <input
              value={codigoConfirmacao} onChange={(e) => setCodigoConfirmacao(e.target.value)}
              placeholder="000000" autoFocus
              className="h-10 rounded-lg border border-border px-3 text-center text-[15px] tracking-widest outline-none focus:border-[#111827]"
            />
            <button type="submit" disabled={confirmar.isPending} className="mt-1 rounded-lg bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50">
              {confirmar.isPending ? 'A confirmar...' : 'Confirmar e Activar'}
            </button>
          </form>
        </Card>
      )}
    </div>
  )
}
