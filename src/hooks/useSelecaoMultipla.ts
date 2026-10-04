import { useState, useEffect } from 'react'

/**
 * Selecção múltipla com paginação (secção 2.3): "Seleccionar todos" marca
 * só os itens visíveis na página actual; "Seleccionar todos os N
 * resultados" marca uma flag lógica (não materializa uma lista com
 * milhares de IDs) — quem consome isto trata `todosOsResultados` como
 * "aplicar a tudo o que bate com os filtros actuais", passando os
 * filtros à operação em massa em vez de uma lista de IDs.
 */
export function useSelecaoMultipla(idsDaPaginaActual: number[], totalGeral: number) {
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set())
  const [todosOsResultados, setTodosOsResultados] = useState(false)

  // Muda de filtro/página com "todos os resultados" activo — a selecção
  // deixa de fazer sentido tal como estava; mais seguro limpar do que
  // arrastar uma selecção que já não corresponde ao que se vê.
  useEffect(() => {
    if (todosOsResultados) setTodosOsResultados(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsDaPaginaActual.join(',')])

  const todosDaPaginaSelecionados = todosOsResultados
    || (idsDaPaginaActual.length > 0 && idsDaPaginaActual.every((id) => selecionados.has(id)))
  const totalSelecionado = todosOsResultados ? totalGeral : selecionados.size

  function alternarItem(id: number) {
    setSelecionados((prev) => {
      // Vinha de "todos os resultados" — a selecção por-item de baixo
      // está desactualizada (ou vazia). Recomeça só com este item, em
      // vez de misturar com o que lá estava antes de activar "todos".
      const base = todosOsResultados ? new Set<number>() : prev
      const novo = new Set(base)
      if (novo.has(id)) novo.delete(id)
      else novo.add(id)
      return novo
    })
    setTodosOsResultados(false)
  }

  function alternarPagina() {
    setSelecionados((prev) => {
      const base = todosOsResultados ? new Set<number>() : prev
      const novo = new Set(base)
      if (todosDaPaginaSelecionados) {
        idsDaPaginaActual.forEach((id) => novo.delete(id))
      } else {
        idsDaPaginaActual.forEach((id) => novo.add(id))
      }
      return novo
    })
    setTodosOsResultados(false)
  }

  function selecionarTodosOsResultados() {
    setTodosOsResultados(true)
  }

  function limpar() {
    setSelecionados(new Set())
    setTodosOsResultados(false)
  }

  return {
    todosOsResultados,
    todosDaPaginaSelecionados,
    totalSelecionado,
    idsSelecionados: Array.from(selecionados),
    estaSelecionado: (id: number) => todosOsResultados || selecionados.has(id),
    alternarItem,
    alternarPagina,
    selecionarTodosOsResultados,
    limpar,
  }
}
