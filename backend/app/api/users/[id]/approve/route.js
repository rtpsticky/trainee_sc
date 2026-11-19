import { route } from '@/lib/http'
import { approveUser } from '@/lib/services/users'

export const { POST, OPTIONS } = route({
    POST: async ({ params }) => approveUser(params.id),
})
