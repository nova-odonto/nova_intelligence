# Nova Intelligence

**Plataforma de Recuperação de Receita para Clínicas Odontológicas**

> Quanto está perdendo? Quanto pode recuperar? O que fazer agora?

---

## Setup Local

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar ambiente
```bash
cp .env.example .env
# Editar DATABASE_URL com suas credenciais PostgreSQL
```

### 3. Banco de dados
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Seed cria: 1 clínica, 3 usuários, 5 fontes, 100 pacientes, 50 oportunidades, 200 interações.

### 4. Rodar
```bash
npm run dev
# http://localhost:3000
```

**Login:** tamires@novaodontologia.com.br / admin123 (OWNER)

---

## Rotas

| Rota | Descrição |
|---|---|
| `/briefing` | Briefing executivo (Owner only) |
| `/dashboard` | Métricas + gráficos |
| `/patients` | Lista com risco de perda |
| `/opportunities` | Pipeline Kanban |
| `/revenue` | Análise por tratamento |
| `/sources` | Performance por canal |
| `/settings` | Configurações |
