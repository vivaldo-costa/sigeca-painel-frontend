import { type ReactNode, useState } from 'react'
import { CircleAlert, CircleCheck, TriangleAlert, X } from 'lucide-react'
import { cn } from '@/lib/cn'

interface AlertProps {
  variant: 'error' | 'success' | 'warning'
  title?: string
  children: ReactNode
  dismissible?: boolean
}

const config = {
  error: { icon: CircleAlert, classes: 'bg-badge-red-bg border-red-200 text-badge-red-text', defaultTitle: 'Erro' },
  success: { icon: CircleCheck, classes: 'bg-badge-green-bg border-green-200 text-badge-green-text', defaultTitle: 'Sucesso' },
  warning: { icon: TriangleAlert, classes: 'bg-badge-orange-bg border-orange-200 text-badge-orange-text', defaultTitle: 'Atenção' },
}

export function Alert({ variant, title, children, dismissible = true }: AlertProps) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  const { icon: Icon, classes, defaultTitle } = config[variant]

  return (
    <div className={cn('mb-4 flex items-start gap-2.5 rounded-[var(--radius-pn)] border px-4 py-3 text-sm', classes)}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="flex-1 leading-relaxed">
        <strong>{title ?? defaultTitle}:</strong> {children}
      </div>
      {dismissible && (
        <button onClick={() => setVisible(false)} className="opacity-50 hover:opacity-100">
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
