import { route, readForm } from '@/lib/http'
import { authorize, MANAGE_ROLES } from '@/lib/auth'
import { listUsers } from '@/lib/queries'
import { createUser } from '@/lib/services/users'

const ROLES = ['STUDENT', 'TEACHER', 'STAFF', 'ADMIN']
const STATUSES = ['PENDING', 'ACTIVE', 'INACTIVE']

// GET ?role=TEACHER&status=ACTIVE narrows the list.
export const { GET, POST, OPTIONS } = route({
    GET: async ({ request }) => {
        const auth = await authorize(MANAGE_ROLES)
        if (auth.error) return auth
        const query = new URL(request.url).searchParams
        const role = ROLES.includes(query.get('role')) ? query.get('role') : undefined
        const status = STATUSES.includes(query.get('status')) ? query.get('status') : undefined
        return { users: await listUsers({ role, status }) }
    },
    POST: async ({ request }) => createUser(await readForm(request)),
})
