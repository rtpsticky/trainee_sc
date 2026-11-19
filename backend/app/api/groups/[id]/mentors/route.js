import { route, readForm } from '@/lib/http'
import { createMentor } from '@/lib/services/mentors'

export const { POST, OPTIONS } = route({
    POST: async ({ request, params }) => createMentor(params.id, await readForm(request)),
})
