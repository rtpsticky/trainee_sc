import { route, readForm } from '@/lib/http'
import { login } from '@/lib/services/auth'

export const { POST, OPTIONS } = route({
    POST: async ({ request }) => login(await readForm(request)),
})
