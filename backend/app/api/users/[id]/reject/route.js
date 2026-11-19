import { route } from '@/lib/http'
import { rejectUser } from '@/lib/services/users'

export const { POST, OPTIONS } = route({
    POST: async ({ params }) => rejectUser(params.id),
})
