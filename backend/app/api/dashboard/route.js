import { route } from '@/lib/http'
import { authorize, MANAGE_ROLES } from '@/lib/auth'
import { getDashboardStats } from '@/lib/reports'
import { getRecentActivities, getUpcomingSupervisions, getStudentGroup } from '@/lib/dashboard'

// Home page data; students only get their own group and appointments.
export const { GET, OPTIONS } = route({
    GET: async () => {
        const auth = await authorize()
        if (auth.error) return auth
        const { user } = auth

        if (user.role === 'STUDENT') {
            const [group, upcoming] = await Promise.all([
                getStudentGroup(user.trainingGroupId),
                getUpcomingSupervisions(user.id),
            ])
            return { group, upcoming }
        }

        const canManage = MANAGE_ROLES.includes(user.role)
        const [stats, activities, upcoming] = await Promise.all([
            getDashboardStats(),
            canManage ? getRecentActivities() : [],
            getUpcomingSupervisions(),
        ])
        return { stats, activities, upcoming }
    },
})
