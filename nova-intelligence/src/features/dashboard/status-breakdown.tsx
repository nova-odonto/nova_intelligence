'use client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface StatusBreakdownProps {
  data: Array<{
    status: string
    count: number
    value: number
  }>
}

const COLORS: Record<string, string> = {
  Ativo:      '#730021',
  Ganho:      '#2D7A47',
  Recuperado: '#B45309',
  Perdido:    '#8A8A8A',
}

export function StatusBreakdown({ data }: StatusBreakdownProps) {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-sm)',
      padding: '28px 24px',
      height: '100%',
    }}>
      <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Distribuição</p>
      <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: 16 }}>Status das oportunidades</p>

      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="count">
            {data.map((entry) => (
              <Cell key={entry.status} fill={COLORS[entry.status] ?? '#B8B8B8'} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [value, 'Oportunidades']}
            contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)' }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        {data.map((item) => (
          <div key={item.status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[item.status] ?? '#B8B8B8', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.status}</span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)' }}>
              {item.count} · {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}