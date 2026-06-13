import { Topbar } from '@/components/layout/topbar'

const users = [
  { name: 'Dra. Tamires Freire', email: 'tamires@novaodontologia.com.br', role: 'Owner' },
  { name: 'Carla Menezes', email: 'carla@novaodontologia.com.br', role: 'Gerente' },
  { name: 'Fernanda Lima', email: 'fernanda@novaodontologia.com.br', role: 'Recepcionista' },
]

export default function SettingsPage() {
  return (
    <>
      <Topbar title="Configurações" subtitle="Clínica e usuários" />
      <main className="p-6 max-w-2xl space-y-6">
        <section className="bg-white rounded-xl border border-zinc-100 p-6">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">Dados da Clínica</h2>
          <div className="space-y-3">
            {[
              { label: 'Nome', value: 'Nova Odontologia' },
              { label: 'Endereço', value: 'Av. Teotônio Segurado, 1234, Taquaralto, Palmas - TO' },
              { label: 'Telefone', value: '(63) 3215-8900' },
              { label: 'E-mail', value: 'contato@novaodontologia.com.br' },
            ].map((field) => (
              <div key={field.label} className="flex gap-4">
                <span className="text-xs font-medium text-zinc-500 w-24 shrink-0 pt-2">{field.label}</span>
                <input
                  defaultValue={field.value}
                  className="flex-1 text-sm border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-zinc-100 p-6">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">Usuários</h2>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.email} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-xs font-semibold text-indigo-700">
                      {user.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{user.name}</p>
                    <p className="text-xs text-zinc-400">{user.email}</p>
                  </div>
                </div>
                <span className="text-xs font-medium bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
