import { NextRequest } from 'next/server'
import { addClient, removeClient } from '@/lib/sse'

export async function GET(req: NextRequest) {
  const clinicId = req.nextUrl.searchParams.get('clinicId') ?? 'demo'

  const stream = new ReadableStream<string>({
    start(controller) {
      addClient(clinicId, controller)

      const keepAlive = setInterval(() => {
        try { controller.enqueue(': ping\n\n') } catch {}
      }, 30000)

      req.signal.addEventListener('abort', () => {
        clearInterval(keepAlive)
        removeClient(clinicId, controller)
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}