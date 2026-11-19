import { route, readForm } from '@/lib/http'
import { updateGroup, deleteGroup } from '@/lib/services/groups'

export const { PUT, DELETE, OPTIONS } = route({
    PUT: async ({ request, params }) => updateGroup(params.id, await readForm(request)),
    DELETE: async ({ params }) => deleteGroup(params.id),
})
