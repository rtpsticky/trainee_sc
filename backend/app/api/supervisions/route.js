import { route, readForm } from '@/lib/http'
import { authorize, SUPERVISE_ROLES } from '@/lib/auth'
import { listSupervisions } from '@/lib/queries'
import { createSupervision } from '@/lib/services/supervisions'

export const { GET, POST, OPTIONS } = route({
    GET: async () => {
        const auth = await authorize(SUPERVISE_ROLES)
        if (auth.error) return auth
        return { supervisions: await listSupervisions() }
    },
    POST: async ({ request }) => createSupervision(await readForm(request)),
})
