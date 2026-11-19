import { route, readForm } from '@/lib/http'
import { updateLocation, deleteLocation } from '@/lib/services/locations'

export const { PUT, DELETE, OPTIONS } = route({
    PUT: async ({ request, params }) => updateLocation(params.id, await readForm(request)),
    DELETE: async ({ params }) => deleteLocation(params.id),
})
