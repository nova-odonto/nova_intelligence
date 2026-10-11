import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import bcrypt from 'bcryptjs'

// POST /api/auth/reset-password?step=send — envia codigo
// POST /api/auth/reset-password?step=verify — valida codigo e retorna token
// POST /api/auth/reset-password?step=reset — redefine senha com token

export async function POST(req: NextRequest) {
  const step = req.nextUrl.searchParams.get('step')
  const body = await req.json()

  if (step === 'send') {
    const { email } = body
    if (!email) return NextResponse.json({ error: 'Email obrigatorio' }, { status: 400 })

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, phone: true }
    })

    if (!user) return NextResponse.json({ error: 'Email nao encontrado' }, { status: 404 })
    if (!user.phone) return NextResponse.json({ error: 'Nenhum WhatsApp cadastrado para este email. Entre em contato com o suporte.' }, { status: 400 })

    const phoneClean = user.phone.replace(/\D/g, '')
    const phoneFull = phoneClean.startsWith('55') ? phoneClean : `55${phoneClean}`
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // EVOLUTION_API_URL ("http://evolution:8080") só é alcançável de dentro da
    // rede Docker do n8n — não da Vercel. Por isso o envio passa por um webhook
    // no n8n (que tem acesso a essa rede) em vez de chamar o Evolution direto.
    let sendOk = false
    try {
      const res = await fetch(process.env.N8N_WEBHOOK_SEND_WHATSAPP!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_SECRET! },
        body: JSON.stringify({
          number: phoneFull,
          text: `Seu codigo para redefinir a senha do Nova Intelligence e: *${code}*\n\nValido por 5 minutos. Se nao foi voce, ignore esta mensagem.`,
        }),
      })
      const json = await res.json().catch(() => null)
      sendOk = res.ok && json?.ok === true
    } catch {
      sendOk = false
    }

    if (!sendOk) {
      return NextResponse.json({ error: 'Não foi possível enviar o código pelo WhatsApp agora. Tente novamente em instantes ou contate o suporte.' }, { status: 502 })
    }

    await redis.set(`reset:${email}`, code, { ex: 300 })

    return NextResponse.json({ ok: true, phone: `****${phoneFull.slice(-4)}` })
  }

  if (step === 'verify') {
    const { email, code } = body
    if (!email || !code) return NextResponse.json({ error: 'Dados obrigatorios' }, { status: 400 })

    const stored = await redis.get(`reset:${email}`)
    if (!stored) return NextResponse.json({ error: 'Codigo expirado. Solicite um novo.' }, { status: 400 })
    if (stored.toString() !== code.toString()) return NextResponse.json({ error: 'Codigo incorreto.' }, { status: 400 })

    await redis.del(`reset:${email}`)

    const token = Math.random().toString(36).slice(2) + Date.now().toString(36)
    await redis.set(`resettoken:${email}`, token, { ex: 600 })

    return NextResponse.json({ ok: true, token })
  }

  if (step === 'reset') {
    const { email, token, newPassword } = body
    if (!email || !token || !newPassword) return NextResponse.json({ error: 'Dados obrigatorios' }, { status: 400 })
    if (newPassword.length < 6) return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres' }, { status: 400 })

    const stored = await redis.get(`resettoken:${email}`)
    if (!stored || stored.toString() !== token.toString()) {
      return NextResponse.json({ error: 'Token expirado. Recomece o processo.' }, { status: 401 })
    }

    await redis.del(`resettoken:${email}`)

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { email }, data: { password: hashed } })

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Step invalido' }, { status: 400 })
}