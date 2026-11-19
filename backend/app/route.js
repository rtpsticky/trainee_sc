import { route } from '@/lib/http'

// GET /trainee_sc — tells whoever opens the base URL that this is the API.
export const { GET, OPTIONS } = route({
    GET: async () => ({ name: 'trainee_sc API', api: '/trainee_sc/api', health: '/trainee_sc/api/health' }),
})
