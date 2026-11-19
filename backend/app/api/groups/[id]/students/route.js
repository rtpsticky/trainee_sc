import { route, readForm } from '@/lib/http'
import { addStudentsToGroup } from '@/lib/services/groups'

// Body: { studentIds: [1, 2, ...] }
export const { POST, OPTIONS } = route({
    POST: async ({ request, params }) => addStudentsToGroup(params.id, (await readForm(request)).getAll('studentIds')),
})
