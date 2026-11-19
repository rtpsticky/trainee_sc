import { route } from '@/lib/http'
import { authorize, SUPERVISE_ROLES } from '@/lib/auth'
import { listStudents } from '@/lib/queries'

export const { GET, OPTIONS } = route({
    GET: async () => {
        const auth = await authorize(SUPERVISE_ROLES)
        if (auth.error) return auth
        return { students: await listStudents() }
    },
})
