@AGENTS.md

# Nova Intelligence — Documentação do Projeto

## Visão Geral

SaaS para clínicas odontológicas focado em **recuperação de receita e gestão de oportunidades**. Identifica pacientes perdidos, oportunidades sem follow-up e receita em risco.

- **Clínica demo**: Nova Odontologia · Taquaralto, Palmas
- **Owner demo**: Dra. Tamires Freire
- **Idioma da UI**: Português (pt-BR)

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 18 + Tailwind CSS 3 + Radix UI |
| Banco de dados | PostgreSQL via Prisma 6 |
| Estado global | Zustand 4 |
| Validação | Zod 3 |
| Gráficos | Recharts 2 |
| Animações | Framer Motion 11 |
| Ícones | Lucide React |
| Linguagem | TypeScript 5 |

> **Importante**: Leia `node_modules/next/dist/docs/` antes de usar APIs do Next.js — esta versão tem breaking changes.

---

## Estrutura de Diretórios

```
src/
  app/
    layout.tsx              # Root layout (html, body, metadata)
    globals.css
    page.tsx                # Redirect para /dashboard
    briefing/page.tsx       # Briefing executivo (dark theme, fora do app layout)
    (app)/
      layout.tsx            # App layout com <Sidebar /> fixa
      dashboard/page.tsx    # Visão geral — 4 métricas + 2 gráficos
      patients/page.tsx     # Tabela de pacientes com risco
      opportunities/page.tsx# Kanban 4 colunas (ACTIVE/WON/RECOVERED/LOST)
      sources/page.tsx      # Cards + tabela de canais de aquisição
      revenue/page.tsx      # Receita
      settings/page.tsx     # Configurações
  components/
    layout/
      sidebar.tsx           # Sidebar fixa 240px, navegação principal
      topbar.tsx            # Header de página com title + subtitle
    ui/
      button.tsx
      card.tsx
      badge.tsx             # Variants: default, active, won, lost, warning, recovered
      metric-card.tsx       # Variants: default, success, danger, warning, primary
  features/
    dashboard/
      revenue-chart.tsx     # Gráfico de barras mensal (Recharts)
      status-breakdown.tsx  # Pizza/donut de status de oportunidades
  lib/
    prisma.ts               # Singleton do Prisma client
    utils.ts                # cn(), formatCurrency(), formatPercent(), getInitials(), relativeTime()
  services/
    dashboard.service.ts    # getDashboardMetrics(clinicId)
    briefing.service.ts     # getBriefingData(clinicId)
  types/
    index.ts                # DashboardMetrics, BriefingData, enums de tipo
prisma/
  schema.prisma             # Schema do banco
  seed.ts                   # Dados de seed
```

**Alias**: `@/` → `src/`

---

## Modelos do Banco (Prisma)

```
Clinic          — clínica odontológica (root entity)
User            — roles: OWNER | MANAGER | DENTIST | RECEPTIONIST
Patient         — tem leadSourceId, lastVisitAt, ligado à Clinic
LeadSource      — canal de aquisição (MedPrev, Instagram, Google, Indicação, Site)
Opportunity     — status: ACTIVE | WON | LOST | RECOVERED; campos: treatmentName, estimatedValue, lastContactAt
Interaction     — tipos: WHATSAPP | PHONE | VISIT | EMAIL; liga Patient + Opportunity + User
```

---

## Estado Atual do Projeto

- **Todos os dados são mockados** — nenhuma página consulta o banco ainda.
- Aguardando `prisma migrate dev` para conectar os services ao banco real.
- Autenticação/sessão ainda não implementada — `clinicId` é hardcoded como `'demo'`.
- A página `/briefing` é de acesso exclusivo ao role `OWNER`.

---

## Convenções

- Componentes Server por padrão; adicionar `'use client'` apenas quando necessário (ex.: hooks de rota, estado interativo).
- Formatação monetária: sempre `formatCurrency()` de `@/lib/utils` (BRL, sem centavos).
- Classes CSS: sempre via `cn()` para merge seguro de Tailwind.
- Cores base: `zinc-*` para neutros, `indigo-*` para primário, `emerald-*` para sucesso, `amber-*` para alerta, `red-*` para perigo.

---

## Comandos

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run lint         # ESLint
npm run db:seed      # Popular banco com dados de seed
npx prisma migrate dev   # Criar e aplicar migrations
npx prisma studio        # Interface visual do banco
```
