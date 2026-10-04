import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, Plus, Search } from 'lucide-react'

export interface OpcaoCombobox {
  id: number
  label: string
}

interface Props {
  value: number | null
  onSelect: (id: number) => void
  opcoes: OpcaoCombobox[]
  onCriar: (nome: string) => void
  placeholder?: string
  aCriar?: boolean
  disabled?: boolean
}

/** Remove acentos para uma comparação insensível a maiúsculas/acentos. */
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

// Mesmas classes do `inputClasses` do FormShell — para o combobox parecer
// nativo do resto do formulário em vez de um componente à parte.
const inputClasses =
  'h-10 w-full rounded-[var(--radius-pn)] border border-border bg-white pl-9 pr-3 text-[13.5px] text-text outline-none transition-colors focus:border-[#111827] focus:shadow-[0_0_0_3px_rgba(17,24,39,0.08)]'

/**
 * Input com autocomplete + "criar novo" — não existia nenhum combobox no
 * código, por isso este é pequeno e autocontido (sem navegação por teclado,
 * é uma ferramenta interna de administração, não precisa de ser exaustivo).
 */
export function ComboboxCriavel({ value, onSelect, opcoes, onCriar, placeholder, aCriar, disabled }: Props) {
  const opcaoSeleccionada = useMemo(() => opcoes.find((o) => o.id === value) ?? null, [opcoes, value])

  const [texto, setTexto] = useState(opcaoSeleccionada?.label ?? '')
  const [aberto, setAberto] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sincroniza o texto mostrado quando o valor controlado muda por fora
  // (ex.: ao trocar de utilizador na ficha, ou após auto-seleccionar a
  // unidade existente devolvida por um 409).
  useEffect(() => {
    setTexto(opcaoSeleccionada?.label ?? '')
  }, [opcaoSeleccionada?.id, opcaoSeleccionada?.label])

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [])

  const filtradas = useMemo(() => {
    const termo = normalizar(texto)
    if (!termo) return opcoes.slice(0, 8)
    return opcoes.filter((o) => normalizar(o.label).includes(termo)).slice(0, 8)
  }, [opcoes, texto])

  const existeExacto = useMemo(
    () => opcoes.some((o) => normalizar(o.label) === normalizar(texto)),
    [opcoes, texto]
  )

  const mostrarCriar = texto.trim().length > 0 && !existeExacto

  function seleccionar(opcao: OpcaoCombobox) {
    setTexto(opcao.label)
    onSelect(opcao.id)
    setAberto(false)
  }

  function criar() {
    const nome = texto.trim()
    if (!nome) return
    onCriar(nome)
    setAberto(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
      <input
        value={texto}
        disabled={disabled || aCriar}
        placeholder={placeholder}
        onFocus={() => setAberto(true)}
        onChange={(e) => {
          setTexto(e.target.value)
          setAberto(true)
        }}
        className={inputClasses}
      />
      {aCriar && <Loader2 className="absolute right-3 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-subtle" />}

      {aberto && !aCriar && (filtradas.length > 0 || mostrarCriar) && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-[var(--radius-pn)] border border-border bg-white py-1 shadow-lg">
          {filtradas.map((opcao) => (
            <button
              key={opcao.id}
              type="button"
              onClick={() => seleccionar(opcao)}
              className={`block w-full px-3 py-2 text-left text-[13px] hover:bg-bg ${
                opcao.id === value ? 'bg-bg font-medium text-text' : 'text-text'
              }`}
            >
              {opcao.label}
            </button>
          ))}
          {mostrarCriar && (
            <button
              type="button"
              onClick={criar}
              className="flex w-full items-center gap-1.5 border-t border-border px-3 py-2 text-left text-[13px] font-medium text-[#111827] hover:bg-bg"
            >
              <Plus className="size-3.5" /> Criar "{texto.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  )
}
