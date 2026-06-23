import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost'
type ButtonSize = 'default' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    'bg-gradient-to-r from-emerald-500 via-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 hover:from-emerald-600 hover:via-sky-600 hover:to-blue-700',
  secondary:
    'bg-gradient-to-r from-amber-300 to-orange-400 text-gray-950 shadow-sm shadow-amber-400/25 hover:from-amber-400 hover:to-orange-500',
  outline:
    'border border-sky-300 bg-white text-sky-800 shadow-sm shadow-sky-100 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800',
  ghost: 'bg-transparent text-gray-700 hover:bg-sky-50 hover:text-sky-800',
}

const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-10 px-4 py-2 text-sm',
  lg: 'h-12 px-6 py-3 text-base',
}

export function Button({
  children,
  className = '',
  variant = 'default',
  size = 'default',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}
