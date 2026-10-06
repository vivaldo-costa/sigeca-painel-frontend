import { type FormEvent, type ReactNode, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { notificar } from '@/lib/notificar'

interface Props {
  titulo: string
  voltarHref: string
  onSubmit: (e: FormEvent) => void
  submitting: boolean
  erro: string | null
  children: ReactNode
}

export function FormShell({ titulo, voltarHref, onSubmit, submitting, erro, children }: Props) {
  const navigate = useNavigate()
  const ultimoErroMostrado = useRef<string | null>(null)

  // Toast em vez de alerta fixo no formulário — cada erro novo dispara
  // um toast; nunca repete o mesmo enquanto a pessoa ainda não tentou
  // de novo (evita duplicar se o componente voltar a renderizar).
  useEffect(() => {
    if (erro && erro !== ultimoErroMostrado.current) {
      notificar.erro(erro)
      ultimoErroMostrado.current = erro
    }
    if (!erro) ultimoErroMostrado.current = null
  }, [erro])

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-5 text-xl font-bold text-text">{titulo}</h1>

      <form onSubmit={onSubmit} className="space-y-4 rounded-[var(--radius-pn)] border border-border bg-surface p-6 shadow-[var(--shadow-pn)]">
        {children}

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={submitting} className="flex-1">
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            Guardar
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(voltarHref)} className="flex-1">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}

export function Campo({ label, children, colSpan }: { label: string; children: ReactNode; colSpan?: boolean }) {
  return (
    <div className={colSpan ? 'sm:col-span-2' : undefined}>
      <label className="mb-1.5 block text-[13px] font-medium text-muted">{label}</label>
      {children}
    </div>
  )
}

export function Linha2({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
}

const inputClasses =
  'h-10 w-full rounded-[var(--radius-pn)] border border-border bg-white px-3 text-[13.5px] text-text outline-none transition-colors focus:border-[#111827] focus:shadow-[0_0_0_3px_rgba(17,24,39,0.08)]'

export function TextField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputClasses} />
}

/**
 * Campo numérico que aceita escrita normal ao teclado (inclusive vírgula
 * decimal, como em "1500,50"). O `<input type="number">` do browser em
 * pt-PT rejeitava vírgulas, repunha 0 ao apagar e mudava com a roda do
 * rato — na prática só dava para usar as setas. Devolve sempre o texto
 * normalizado (ponto decimal) em `onValor`.
 */
export function NumeroField({
  value, onValor, decimal = false, ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
  value: string | number | null | undefined
  onValor: (valor: string) => void
  decimal?: boolean
}) {
  return (
    <input
      {...props}
      type="text"
      inputMode={decimal ? 'decimal' : 'numeric'}
      autoComplete="off"
      value={value === null || value === undefined ? '' : String(value)}
      onChange={(e) => {
        let v = e.target.value.replace(/\s/g, '').replace(',', '.')
        v = decimal ? v.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1') : v.replace(/[^0-9]/g, '')
        onValor(v)
      }}
      className={inputClasses}
    />
  )
}

export function SelectField({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={inputClasses}>
      {children}
    </select>
  )
}

export function TextareaField(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={2} {...props} className={`${inputClasses} h-auto resize-y py-2`} />
}

/** Separador com título, para agrupar secções longas dentro do mesmo formulário. */
export function SecaoTitulo({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-2 border-t border-border pt-4 text-[12px] font-semibold uppercase tracking-wide text-subtle">
      {children}
    </h2>
  )
}
