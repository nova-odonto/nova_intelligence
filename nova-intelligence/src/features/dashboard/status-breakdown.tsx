'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface StatusBreakdownProps {
  data: Array<{
    status: string
    count: number
    value: number
  }>
}

const COLORS = {
  Ativo: '#6366f1',
  Ganho: '#10b981',
  Recuperado: '#3b82f6',
  Perdido: '#ef4444',
}

export function StatusBreakdown({ data }: StatusBreakdownProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Distribuição</CardTitle>
        <p className="text-xs text-zinc-400">Status das oportunidades</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={3}
              dataKey="count"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.status}
                  fill={COLORS[entry.status as keyof typeof COLORS] ?? '#a1a1aa'}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [value, 'Oportunidades']}
              contentStyle={{
                fontSize: 11,
                borderRadius: 8,
                border: '1px solid #f4f4f5',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="space-y-2 mt-2">
          {data.map((item) => (
            <div key={item.status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: COLORS[item.status as keyof typeof COLORS] ?? '#a1a1aa',
                  }}
                />
                <span className="text-xs text-zinc-500">{item.status}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-zinc-700">
                  {item.count} · {formatCurrency(item.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
