import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nova Intelligence — Plataforma de Recuperação de Receita',
  description: 'Identifique pacientes perdidos, oportunidades esquecidas e receitas em risco.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-zinc-50 text-zinc-900 font-sans">{children}</body>
    </html>
  )
}
