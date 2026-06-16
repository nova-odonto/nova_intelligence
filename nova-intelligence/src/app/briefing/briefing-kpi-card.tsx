// src/app/briefing/briefing-kpi-card.tsx
'use client'

import { useState, useRef } from 'react'

interface BriefingKpiCardProps {
  icon: React.ReactNode
  label: string
  value: string
  period: string
  tooltip: string
  borderClass?: string
  valueClass?: string
}

export function BriefingKpiCard({
  icon,
  label,
  value,
  period,
  tooltip,
  borderClass = 'border-zinc-100',
  valueClass = 'text-zinc-900',
}: BriefingKpiCardProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  function handleMouseMove(e: React.MouseEvent) {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setPos({ x: e.clientX - rect.left + 16, y: e.clientY - rect.top + 16 })
  }

  return (
    <div
      ref={cardRef}
      className={`relative bg-white rounded-[14px] border shadow-sm p-5 cursor-default select-none overflow-visible ${borderClass}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <div className="flex items-center gap-1.5 mb-3">
        {icon}
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">{label}</span>
      </div>
      <p
        style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        className={`text-3xl ${valueClass}`}
      >
        {value}
      </p>
      <p className="text-[11px] text-zinc-400 mt-1">{period}</p>

      {/* Tooltip — segue o mouse, largura fixa, sem quebra de linha */}
      {visible && (
        <div
          className="pointer-events-none absolute z-50 bg-white border border-zinc-100 shadow-lg rounded-xl px-4 py-3"
          style={{
            left: pos.x,
            top: pos.y,
            width: '260px',
            whiteSpace: 'normal',
          }}
        >
          <p className="text-[10px] font-semibold text-[#730021] uppercase tracking-wider mb-1">{label}</p>
          <p className="text-xs text-zinc-500 leading-relaxed">{tooltip}</p>
        </div>
      )}
    </div>
  )
}