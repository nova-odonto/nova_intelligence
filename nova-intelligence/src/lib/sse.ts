const clients = new Map<string, Set<ReadableStreamDefaultController<string>>>()

export function notifyClients(clinicId: string, data: object) {
  const set = clients.get(clinicId)
  if (!set) return
  const payload = `data: ${JSON.stringify(data)}\n\n`
  set.forEach((ctrl) => {
    try { ctrl.enqueue(payload) } catch {}
  })
}

export function addClient(clinicId: string, ctrl: ReadableStreamDefaultController<string>) {
  if (!clients.has(clinicId)) clients.set(clinicId, new Set())
  clients.get(clinicId)!.add(ctrl)
}

export function removeClient(clinicId: string, ctrl: ReadableStreamDefaultController<string>) {
  clients.get(clinicId)?.delete(ctrl)
}