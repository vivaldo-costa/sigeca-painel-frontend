import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

interface Props {
  editarHref: string
  podeEliminar: boolean
  onEliminar: () => Promise<unknown>
}

/** Réplica do par Editar/Eliminar (com `confirm()`) de cada linha das tabelas actuais. */
export function AcoesLinha({ editarHref, podeEliminar, onEliminar }: Props) {
  const [aEliminar, setAEliminar] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  async function handleEliminar() {
    if (!confirmando) {
      setConfirmando(true)
      setTimeout(() => setConfirmando(false), 3000)
      return
    }
    setAEliminar(true)
    try {
      await onEliminar()
    } finally {
      setAEliminar(false)
      setConfirmando(false)
    }
  }

  return (
    <>
      <Link
        to={editarHref}
        className="whitespace-nowrap rounded-full bg-badge-blue-bg px-3 py-1 text-[11.5px] font-medium text-badge-blue-text transition hover:opacity-80"
      >
        Editar
      </Link>
      {podeEliminar && (
        <button
          onClick={handleEliminar}
          disabled={aEliminar}
          className={`whitespace-nowrap rounded-full px-3 py-1 text-[11.5px] font-medium transition disabled:opacity-60 ${
            confirmando ? 'bg-badge-red-text text-white' : 'bg-badge-red-bg text-badge-red-text hover:opacity-80'
          }`}
        >
          {aEliminar ? <Loader2 className="size-3 animate-spin" /> : confirmando ? 'Confirmar?' : 'Eliminar'}
        </button>
      )}
    </>
  )
}
