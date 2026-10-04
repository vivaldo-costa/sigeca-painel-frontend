import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants = {
  primary: 'bg-[var(--cor-primaria,#111827)] text-white hover:opacity-90 focus-visible:ring-black/20',
  secondary: 'bg-white text-text border border-border hover:border-subtle focus-visible:ring-black/10',
  ghost: 'bg-transparent text-muted hover:bg-bg hover:text-text focus-visible:ring-black/10',
  danger: 'bg-badge-red-text text-white hover:opacity-90 focus-visible:ring-red-300',
}

const sizes = {
  sm: 'h-8 px-3 text-[13px] rounded-lg',
  md: 'h-10 px-4 text-[14px] rounded-[var(--radius-pn)]',
  lg: 'h-12 px-5 text-[15px] rounded-[var(--radius-pn)]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium',
          'transition-all duration-150 outline-none focus-visible:ring-4',
          'disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <i className="fa-solid fa-spinner animate-spin text-[13px]" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
