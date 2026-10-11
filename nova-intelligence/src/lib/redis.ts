import { Redis } from '@upstash/redis'

// Provisionado via Vercel Marketplace (Upstash for Redis), que usa o
// prefixo KV_REST_API_* — a instância antiga (UPSTASH_REDIS_REST_*)
// foi deletada pelo Upstash por inatividade e não existe mais.
export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})