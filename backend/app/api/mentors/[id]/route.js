import { route, readForm } from '@/lib/http'
import { updateMentor, deleteMentor } from '@/lib/services/mentors'

export const { PUT, DELETE, OPTIONS } = route({
    PUT: async ({ request, params }) => updateMentor(params.id, await readForm(request)),
    DELETE: async ({ params }) => deleteMentor(params.id),
})
