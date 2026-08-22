'use client'

import { useEffect, useState } from 'react'
import { Topbar } from '@/components/layout/topbar'
import { Loader2, CheckCircle2, AlertTriangle, XCircle, Clock, ArrowUpRight, Zap, X } from 'lucide-react'
import { PLAN_FEATURES, PLAN_LABELS, PLAN_PRICES } from '@/lib/subscription'

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; message: string }> = {
  TRIAL: {
    label: 'Em trial',
    icon: Clock,
    color: 'text-blue-600 dark:text-blue-400',
    message: 'Você está no período de avaliação gratuita.',
  },
  TRIAL_EXPIRED: {
    label: 'Trial expirado',
    icon: AlertTriangle,
    color: 'text-amber-500',
    message: 'Seu período de trial expirou. Assine um plano para continuar.',
  },
  ACTIVE: {
    label: 'Ativo',
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    message: 'Sua assinatura está ativa.',
  },
  OVERDUE: {
    label: 'Pagamento pendente',
    icon: AlertTriangle,
    color: 'text-orange-500',
    message: 'Há um pagamento em atraso. Regularize em até 7 dias para evitar bloqueio.',
  },
  BLOCKED: {
    label: 'Bloqueado',
    icon: XCircle,
    color: 'text-red-500',
    message: 'Acesso bloqueado. Assine um plano para reativar.',
  },
}

const PLAN_ORDER = ['MASTER', 'PRO', 'ADVANCED'] as const
type PlanKey = typeof PLAN_ORDER[number]

const PLAN_DESCRIPTIONS: Record<PlanKey, string> = {
  MASTER: 'Gestão completa da clínica',
  PRO: 'Gestão + WhatsApp com Mari',
  ADVANCED: 'Tudo + Briefing Executivo',
}

function formatCpfCnpj(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

interface CheckoutModalProps {
  plan: PlanKey
  onClose: () => void
  onConfirm: (cpfCnpj: string) => void
  loading: boolean
}

function CheckoutModal({ plan, onClose, onConfirm, loading }: CheckoutModalProps) {
  const [cpfCnpj, setCpfCnpj] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl border border-zinc-100 dark:border-white/8 p-6 w-full max-w-sm space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Assinar plano {PLAN_LABELS[plan]}
          </p>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
            <X size={16} />
          </button>
        </div>

        <div className="bg-zinc-50 dark:bg-white/4 rounded-xl p-3">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Valor</p>
          <p className="text-xl font-bold text-[#730021] dark:text-[#e05c7a]">
            R$ ***
            <span className="text-xs font-normal text-zinc-400">/mês</span>
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            CPF ou CNPJ da clínica
          </label>
          <input
            type="text"
            value={cpfCnpj}
            onChange={e => setCpfCnpj(formatCpfCnpj(e.target.value))}
            placeholder="000.000.000-00 ou 00.000.000/0001-00"
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-white/8 rounded-lg bg-white dark:bg-[#1c1c1e] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#730021]/20"
          />
          <p className="text-[11px] text-zinc-400">Necessário para emissão da cobrança.</p>
        </div>

        <button
          type="button"
          onClick={() => onConfirm(cpfCnpj)}
          disabled={loading || cpfCnpj.replace(/\D/g, '').length < 11}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#730021] hover:bg-[#8a0027] rounded-lg transition disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
          Gerar link de pagamento
        </button>
      </div>
    </div>
  )
}

export default function BillingPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutPlan, setCheckoutPlan] = useState<PlanKey | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    fetch('/api/subscription/status?self=1')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  async function handleConfirmCheckout(cpfCnpj: string) {
    if (!checkoutPlan) return
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: checkoutPlan, cpfCnpj }),
      })
      const json = await res.json()
      if (json.url) {
        window.open(json.url, '_blank')
        setCheckoutPlan(null)
      } else {
        alert(json.error ?? 'Erro ao gerar link de pagamento.')
      }
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (loading) return (
    <>
      <Topbar title="Plano" subtitle="Sua assinatura" />
      <main className="p-6 flex justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-zinc-300" />
      </main>
    </>
  )

  const plan = data?.plan ?? 'MASTER'
  const status = data?.status ?? 'TRIAL'
  const trialEndsAt = data?.trialEndsAt ? new Date(data.trialEndsAt) : null
  const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.ACTIVE
  const StatusIcon = statusConfig.icon
  const features = PLAN_FEATURES[plan as PlanKey] ?? []
  const showUpgrade = status !== 'ACTIVE' || plan !== 'ADVANCED'

  return (
    <>
      <Topbar title="Plano" subtitle="Sua assinatura" />
      <main className="p-6 space-y-5 max-w-3xl">

        {/* Status banner */}
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${
          status === 'ACTIVE' ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30'
          : status === 'BLOCKED' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30'
          : status === 'OVERDUE' || status === 'TRIAL_EXPIRED' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30'
          : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30'
        }`}>
          <StatusIcon size={18} className={`shrink-0 mt-0.5 ${statusConfig.color}`} />
          <div>
            <p className={`text-sm font-semibold ${statusConfig.color}`}>{statusConfig.label}</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{statusConfig.message}</p>
            {status === 'TRIAL' && trialEndsAt && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Trial expira em <strong>{trialEndsAt.toLocaleDateString('pt-BR')}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Plano atual */}
        <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl border border-zinc-100 dark:border-white/8 p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-1">Plano atual</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{PLAN_LABELS[plan as PlanKey]}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#730021] dark:text-[#e05c7a]">
                R$ ***
              </p>
              <p className="text-xs text-zinc-400">/mês</p>
            </div>
          </div>
          <div className="border-t border-zinc-100 dark:border-white/8 pt-4 space-y-2">
            {features.map(f => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Planos disponíveis */}
        {showUpgrade && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {status === 'ACTIVE' ? 'Fazer upgrade' : 'Escolha um plano'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PLAN_ORDER.map(p => {
                const isCurrentPlan = p === plan && status === 'ACTIVE'
                const isDowngrade = PLAN_ORDER.indexOf(p) < PLAN_ORDER.indexOf(plan as PlanKey)
                const planFeatures = PLAN_FEATURES[p]

                return (
                  <div
                    key={p}
                    className={`relative rounded-2xl border p-4 space-y-3 transition-all ${
                      isCurrentPlan
                        ? 'border-[#730021] dark:border-[#e05c7a] bg-[#730021]/5 dark:bg-[#e05c7a]/5'
                        : 'border-zinc-200 dark:border-white/8 bg-white dark:bg-[#2c2c2e]'
                    }`}
                  >
                    {isCurrentPlan && (
                      <span className="absolute -top-2.5 left-3 text-[10px] font-bold uppercase tracking-wide bg-[#730021] dark:bg-[#e05c7a] text-white px-2 py-0.5 rounded-full">
                        Atual
                      </span>
                    )}
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{PLAN_LABELS[p]}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{PLAN_DESCRIPTIONS[p]}</p>
                    </div>
                    <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      R$ ***
                      <span className="text-xs font-normal text-zinc-400">/mês</span>
                    </p>
                    <div className="space-y-1">
                      {planFeatures.map(f => (
                        <div key={f} className="flex items-center gap-1.5">
                          <CheckCircle2 size={11} className="text-green-500 shrink-0" />
                          <span className="text-xs text-zinc-600 dark:text-zinc-400">{f}</span>
                        </div>
                      ))}
                    </div>
                    {!isCurrentPlan && (
                      <button
                        type="button"
                        onClick={() => setCheckoutPlan(p)}
                        className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition ${
                          isDowngrade
                            ? 'border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/4'
                            : 'bg-[#730021] hover:bg-[#8a0027] dark:bg-[#e05c7a] dark:hover:bg-[#d04a6a] text-white'
                        }`}
                      >
                        {isDowngrade
                          ? <><ArrowUpRight size={12} className="rotate-180" /> Fazer downgrade</>
                          : <><Zap size={12} /> Assinar {PLAN_LABELS[p]}</>
                        }
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Suporte */}
        <div className="bg-zinc-50 dark:bg-white/4 rounded-xl border border-zinc-200 dark:border-white/8 p-4 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Dúvidas ou problemas com pagamento?</p>
          <a
            href="https://wa.me/5563984443330"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-2 px-4 py-2 text-sm font-medium text-white bg-[#25D366] hover:bg-[#1fba59] rounded-lg transition"
          >
            Falar com suporte
          </a>
        </div>
      </main>

      {checkoutPlan && (
        <CheckoutModal
          plan={checkoutPlan}
          onClose={() => setCheckoutPlan(null)}
          onConfirm={handleConfirmCheckout}
          loading={checkoutLoading}
        />
      )}
    </>
  )
}