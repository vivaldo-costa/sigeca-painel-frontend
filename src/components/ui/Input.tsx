import { type InputHTMLAttributes, forwardRef, useState, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: ReactNode
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, type, className, id, ...props }, ref) => {
    const [show, setShow] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (show ? 'text' : 'password') : type

    return (
      <div className="mb-4">
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-muted">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle">{icon}</span>}
          <input
            ref={ref}
            id={id}
            type={inputType}
            className={cn(
              'h-11 w-full rounded-[var(--radius-pn)] border border-border bg-white px-3.5 text-[14px] text-text outline-none',
              'placeholder:text-subtle transition-colors focus:border-[#111827] focus:shadow-[0_0_0_3px_rgba(17,24,39,0.08)]',
              icon && 'pl-10',
              isPassword && 'pr-11',
              error && 'border-red-300 bg-red-50',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-subtle hover:text-text"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          )}
        </div>
        {error && <p className="mt-1.5 text-[13px] text-badge-red-text">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
