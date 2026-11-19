import { route, readForm } from '@/lib/http'
import { registerUser } from '@/lib/services/register'

export const { POST, OPTIONS } = route({
    POST: async ({ request }) => registerUser(await readForm(request)),
})
