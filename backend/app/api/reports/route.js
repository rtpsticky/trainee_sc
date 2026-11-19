import { route } from '@/lib/http'
import { authorize, SUPERVISE_ROLES } from '@/lib/auth'
import { getDashboardStats } from '@/lib/reports'

export const { GET, OPTIONS } = route({
    GET: async () => {
        const auth = await authorize(SUPERVISE_ROLES)
        if (auth.error) return auth
        const stats = await getDashboardStats()
        return stats.error ? { ...stats, status: 500 } : stats
    },
})
