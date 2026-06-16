import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: LucideIcon
  trend?: number
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'primary'
  className?: string
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
  const isPrimary = variant === 'primary'

  const valueColor = {
    default: 'var(--text)',
    success: '#2D7A47',
    danger: 'var(--primary)',
    warning: '#B45309',
    primary: '#fff',
  }[variant]

  const iconBg = {
    default: 'var(--bg)',
    success: 'rgba(45,122,71,0.08)',
    danger: 'var(--primary-soft)',
    warning: 'rgba(180,83,9,0.08)',
    primary: 'rgba(255,255,255,0.15)',
  }[variant]

  const iconColor = {
    default: 'var(--text-muted)',
    success: '#2D7A47',
    danger: 'var(--primary)',
    warning: '#B45309',
    primary: '#fff',
  }[variant]

  return (
    <div
      className={`flex flex-col gap-3 p-5 ${className ?? ''}`}
      style={{
        background: isPrimary ? 'var(--primary)' : 'var(--card)',
        border: `1px solid ${isPrimary ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-start justify-between">
        <p style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: isPrimary ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)',
        }}>
          {title}
        </p>
        {Icon && (
          <div style={{
            width: '30px',
            height: '30px',
            background: iconBg,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon style={{ width: '14px', height: '14px', color: iconColor }} />
          </div>
        )}
      </div>

      <div>
        <p style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: '34px',
          fontWeight: 400,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          color: valueColor,
        }}>
          {value}
        </p>
        {subtitle && (
          <p style={{
            fontSize: '12px',
            marginTop: '4px',
            color: isPrimary ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)',
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1">
          {trend >= 0
            ? <TrendingUp style={{ width: '12px', height: '12px', color: '#2D7A47' }} />
            : <TrendingDown style={{ width: '12px', height: '12px', color: 'var(--primary)' }} />
          }
          <span style={{
            fontSize: '12px',
            fontWeight: 500,
            color: trend >= 0 ? '#2D7A47' : 'var(--primary)',
          }}>
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}% vs mês anterior
          </span>
        </div>
      )}
    </div>
  )
}