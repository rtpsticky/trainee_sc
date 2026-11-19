import { route } from '@/lib/http'
import { authorize } from '@/lib/auth'

export const { GET, OPTIONS } = route({
    GET: async () => authorize(),
})
