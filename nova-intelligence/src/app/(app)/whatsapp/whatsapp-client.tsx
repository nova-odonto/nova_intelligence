// src/app/(app)/whatsapp/whatsapp-client.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Topbar } from '@/components/layout/topbar'
import { MessageCircle, Search, Phone, Send, Clock, CheckCheck } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface Conversation {
  id: string
  phone: string
  lastMessage: string
  lastMessageAt: string
  unread: number
  messages: Message[]
}

interface Props {
  conversations: Conversation[]
  role: string
}

function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, '')
  if (d.length === 13) return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`
  if (d.length === 12) return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4, 8)}-${d.slice(8)}`
  return phone
}

function formatTime(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function WhatsappClient({ conversations, role }: Props) {
  const [convList, setConvList] = useState<Conversation[]>(conversations)
  const [selected, setSelected] = useState<Conversation | null>(
    conversations.length > 0 ? conversations[0] : null
  )
  const [search, setSearch] = useState('')
  const [manualMessage, setManualMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Polling a cada 5s
  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch('/api/whatsapp/conversations')
        if (!res.ok) return
        const data: Conversation[] = await res.json()

        setConvList(data)
        setSelected((prev) => {
          if (!prev) return data.length > 0 ? data[0] : null
          const updated = data.find((c) => c.phone === prev.phone)
          return updated ?? prev
        })
      } catch {}
    }

    fetchConversations()
    const interval = setInterval(fetchConversations, 5000)
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll ao receber mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selected?.messages.length])

  const filtered = convList.filter((c) =>
    c.phone.includes(search) || c.lastMessage.toLowerCase().includes(search.toLowerCase())
  )

  const totalUnread = convList.reduce((acc, c) => acc + c.unread, 0)

  function handleSelect(conv: Conversation) {
    setSelected(conv)
    setConvList((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c))
    )
  }

  async function handleSend() {
    if (!manualMessage.trim() || !selected || sending) return
    setSending(true)

    try {
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: selected.phone,
          message: manualMessage.trim(),
        }),
      })

      const newMsg: Message = {
        role: 'assistant',
        content: manualMessage.trim(),
        createdAt: new Date().toISOString(),
      }

      setSelected((prev) =>
        prev ? { ...prev, messages: [...prev.messages, newMsg] } : prev
      )
      setConvList((prev) =>
        prev.map((c) =>
          c.phone === selected.phone
            ? { ...c, lastMessage: manualMessage.trim(), lastMessageAt: newMsg.createdAt }
            : c
        )
      )
      setManualMessage('')
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Topbar title="WhatsApp" subtitle="Conversas da clínica" />
      <main className="p-4 md:p-6 max-w-6xl">
        <div
          className="bg-white rounded-[14px] border border-zinc-100 shadow-xs overflow-hidden"
          style={{ height: 'calc(100vh - 140px)' }}
        >
          <div className="flex h-full">

            {/* Sidebar — lista de conversas */}
            <div className="w-full md:w-80 lg:w-96 border-r border-zinc-100 flex flex-col shrink-0">
              <div className="px-4 py-3.5 border-b border-zinc-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#730021]" />
                    <span className="text-sm font-semibold text-zinc-900">Conversas</span>
                  </div>
                  {totalUnread > 0 && (
                    <span className="text-xs bg-[#730021] text-white font-medium px-2 py-0.5 rounded-full">
                      {totalUnread} novas
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Buscar conversa..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#730021]/30 focus:border-[#730021]/40 placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-zinc-50">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-2">
                    <MessageCircle className="w-8 h-8 text-zinc-200" />
                    <p className="text-sm text-zinc-400">Nenhuma conversa encontrada</p>
                  </div>
                ) : (
                  filtered.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelect(conv)}
                      className={`w-full text-left px-4 py-3.5 hover:bg-zinc-50 transition-colors ${
                        selected?.id === conv.id ? 'bg-zinc-50 border-l-2 border-[#730021]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#730021]/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-[#730021]">
                            {conv.phone.slice(-2)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-zinc-900 truncate">
                              {formatPhone(conv.phone)}
                            </span>
                            <span className="text-[11px] text-zinc-400 shrink-0">
                              {formatTime(conv.lastMessageAt)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <p className="text-xs text-zinc-500 truncate">{conv.lastMessage}</p>
                            {conv.unread > 0 && (
                              <span className="w-4 h-4 bg-[#730021] text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                                {conv.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Área de conversa */}
            {selected ? (
              <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#730021]/10 flex items-center justify-center">
                      <span className="text-xs font-semibold text-[#730021]">
                        {selected.phone.slice(-2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{formatPhone(selected.phone)}</p>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <p className="text-xs text-zinc-400">Via Evolution API</p>
                      </div>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${selected.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    Abrir no WhatsApp
                  </a>
                </div>

                {/* Mensagens */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {selected.messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <MessageCircle className="w-10 h-10 text-zinc-200" />
                      <p className="text-sm text-zinc-400">Nenhuma mensagem ainda</p>
                    </div>
                  ) : (
                    selected.messages.map((msg, i) => {
                      const isBot = msg.role === 'assistant'
                      return (
                        <div key={i} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                          <div
                            className={`max-w-[72%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isBot
                                ? 'bg-zinc-100 text-zinc-800 rounded-tl-sm'
                                : 'bg-[#730021] text-white rounded-tr-sm'
                            }`}
                          >
                            <p>{msg.content}</p>
                            <div className={`flex items-center gap-1 mt-1 ${isBot ? 'justify-start' : 'justify-end'}`}>
                              <span className={`text-[10px] ${isBot ? 'text-zinc-400' : 'text-white/60'}`}>
                                {formatMessageTime(msg.createdAt)}
                              </span>
                              {!isBot && <CheckCheck className="w-3 h-3 text-white/60" />}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Footer — envio manual */}
                <div className="px-4 py-3.5 border-t border-zinc-100 bg-white">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={manualMessage}
                        onChange={(e) => setManualMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="Enviar mensagem manual..."
                        className="w-full px-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#730021]/30 focus:border-[#730021]/40 placeholder:text-zinc-400"
                      />
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={!manualMessage.trim() || sending}
                      className="w-9 h-9 rounded-xl bg-[#730021] hover:bg-[#8a0027] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
                    >
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Envio manual — a Mari continua respondendo automaticamente
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <MessageCircle className="w-12 h-12 text-zinc-200" />
                <p className="text-sm text-zinc-400">Selecione uma conversa para visualizar</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}