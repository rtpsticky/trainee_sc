import { route, readForm } from '@/lib/http'
import { authorize, MANAGE_ROLES } from '@/lib/auth'
import { listLocations } from '@/lib/queries'
import { createLocation } from '@/lib/services/locations'

export const { GET, POST, OPTIONS } = route({
    GET: async () => {
        const auth = await authorize(MANAGE_ROLES)
        if (auth.error) return auth
        return { locations: await listLocations() }
    },
    POST: async ({ request }) => createLocation(await readForm(request)),
})
