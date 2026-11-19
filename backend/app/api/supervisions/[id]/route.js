import { route, readForm } from '@/lib/http'
import { updateSupervision, deleteSupervision } from '@/lib/services/supervisions'

export const { PUT, DELETE, OPTIONS } = route({
    PUT: async ({ request, params }) => {
        const form = await readForm(request)
        form.set('id', params.id)
        return updateSupervision(form)
    },
    DELETE: async ({ params }) => deleteSupervision(params.id),
})
