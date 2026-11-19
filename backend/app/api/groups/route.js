import { route, readForm } from '@/lib/http'
import { authorize, MANAGE_ROLES } from '@/lib/auth'
import { listGroups } from '@/lib/queries'
import { createGroup } from '@/lib/services/groups'

export const { GET, POST, OPTIONS } = route({
    GET: async () => {
        const auth = await authorize(MANAGE_ROLES)
        if (auth.error) return auth
        return { groups: await listGroups() }
    },
    POST: async ({ request }) => createGroup(await readForm(request)),
})
