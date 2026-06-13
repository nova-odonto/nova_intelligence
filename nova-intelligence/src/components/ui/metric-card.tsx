import { cn } from '@/lib/utils'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: LucideIcon
  trend?: number // percent change
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'primary'
  className?: string
}

const variantStyles = {
  default: {
    container: 'bg-white border-zinc-100',
    icon: 'bg-zinc-100 text-zinc-500',
    value: 'text-zinc-900',
  },
  success: {
    container: 'bg-white border-zinc-100',
    icon: 'bg-emerald-50 text-emerald-600',
    value: 'text-emerald-700',
  },
  danger: {
    container: 'bg-white border-zinc-100',
    icon: 'bg-red-50 text-red-500',
    value: 'text-red-600',
  },
  warning: {
    container: 'bg-white border-zinc-100',
    icon: 'bg-amber-50 text-amber-600',
    value: 'text-amber-700',
  },
  primary: {
    container: 'bg-indigo-600 border-indigo-600',
    icon: 'bg-indigo-500 text-white',
    value: 'text-white',
  },
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: MetricCardProps) {
  const styles = variantStyles[variant]
  const isPrimary = variant === 'primary'

  return (
    <div
      className={cn(
        'rounded-xl border p-5 flex flex-col gap-3 shadow-sm',
        styles.container,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p
          className={cn(
            'text-xs font-medium uppercase tracking-wide',
            isPrimary ? 'text-indigo-200' : 'text-zinc-500'
          )}
        >
          {title}
        </p>
        {Icon && (
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', styles.icon)}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div>
        <p className={cn('text-2xl font-bold tracking-tight', styles.value)}>{value}</p>
        {subtitle && (
          <p
            className={cn('text-xs mt-0.5', isPrimary ? 'text-indigo-300' : 'text-zinc-400')}
          >
            {subtitle}
          </p>
        )}
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1">
          {trend >= 0 ? (
            <TrendingUp className="w-3 h-3 text-emerald-500" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-400" />
          )}
          <span
            className={cn(
              'text-xs font-medium',
              trend >= 0 ? 'text-emerald-600' : 'text-red-500'
            )}
          >
            {trend >= 0 ? '+' : ''}
            {trend.toFixed(1)}% vs mês anterior
          </span>
        </div>
      )}
    </div>
  )
}
