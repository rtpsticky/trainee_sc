import { route, readForm } from '@/lib/http'
import { updateUser, deleteUser } from '@/lib/services/users'

export const { PUT, DELETE, OPTIONS } = route({
    PUT: async ({ request, params }) => updateUser(params.id, await readForm(request)),
    DELETE: async ({ params }) => deleteUser(params.id),
})
