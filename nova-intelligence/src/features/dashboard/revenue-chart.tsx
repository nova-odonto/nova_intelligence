'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

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
    <div className="bg-white border border-zinc-100 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-zinc-700 mb-2 capitalize">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-zinc-500">{p.name}:</span>
          <span className="font-medium text-zinc-800">
            R$ {p.value.toLocaleString('pt-BR')}
          </span>
        </div>
      ))}
    </div>
  )
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução de Receita</CardTitle>
        <p className="text-xs text-zinc-400">Recuperada vs Perdida vs Potencial</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPotential" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="potential"
              name="Potencial"
              stroke="#6366f1"
              strokeWidth={1.5}
              fill="url(#colorPotential)"
              strokeDasharray="4 4"
            />
            <Area
              type="monotone"
              dataKey="recovered"
              name="Recuperada"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorRecovered)"
            />
            <Area
              type="monotone"
              dataKey="lost"
              name="Perdida"
              stroke="#ef4444"
              strokeWidth={1.5}
              fill="url(#colorLost)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
