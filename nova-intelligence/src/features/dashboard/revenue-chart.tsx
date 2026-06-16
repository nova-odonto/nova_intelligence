'use client'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface RevenueChartProps {
  data: Array<{
    month: string
    recovered: number
    lost: number
    potential: number
  }>
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      boxShadow: 'var(--shadow-md)',
      padding: '12px 16px',
      fontSize: '12px',
    }}>
      <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 8, textTransform: 'capitalize' }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ color: 'var(--text-muted)' }}>{p.name}:</span>
          <span style={{ fontWeight: 500, color: 'var(--text)' }}>R$ {p.value.toLocaleString('pt-BR')}</span>
        </div>
      ))}
    </div>
  )
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-sm)',
      padding: '28px 24px',
    }}>
      <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Evolução de Receita</p>
      <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: 24 }}>Recuperada vs Perdida vs Potencial</p>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2D7A47" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2D7A47" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorLost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#730021" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#730021" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPotential" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#730021" stopOpacity={0.06} />
              <stop offset="95%" stopColor="#730021" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#B8B8B8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#B8B8B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="potential" name="Potencial" stroke="#730021" strokeWidth={1.5} fill="url(#colorPotential)" strokeDasharray="4 4" strokeOpacity={0.4} />
          <Area type="monotone" dataKey="recovered" name="Recuperada" stroke="#2D7A47" strokeWidth={2} fill="url(#colorRecovered)" />
          <Area type="monotone" dataKey="lost" name="Perdida" stroke="#730021" strokeWidth={1.5} fill="url(#colorLost)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}