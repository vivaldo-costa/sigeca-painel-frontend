import { useEffect, useRef, useState } from 'react'

/**
 * Anima um número a subir de 0 até ao valor real, disparado quando o
 * elemento entra no ecrã (Intersection Observer) — usado em estatísticas
 * e KPIs, onde um número estático não transmite tanta energia quanto
 * vê-lo "chegar lá" na primeira vez que aparece.
 */
export function useCountUp(valorFinal: number, duracaoMs = 900) {
  const [valor, setValor] = useState(0)
  const ref = useRef<HTMLElement>(null)
  const jaAnimou = useRef(false)

  useEffect(() => {
    const elemento = ref.current
    if (!elemento) return

    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting && !jaAnimou.current) {
          jaAnimou.current = true
          const inicio = performance.now()

          function passo(agora: number) {
            const progresso = Math.min((agora - inicio) / duracaoMs, 1)
            const suavizado = 1 - (1 - progresso) ** 3 // ease-out cúbico
            setValor(Math.round(suavizado * valorFinal))
            if (progresso < 1) requestAnimationFrame(passo)
          }
          requestAnimationFrame(passo)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(elemento)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valorFinal])

  return { valor, ref }
}
