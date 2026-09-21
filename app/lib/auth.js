import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import prisma from './prisma'
import { getSession } from './session'

export const MANAGE_ROLES = ['STAFF', 'ADMIN']
export const SUPERVISE_ROLES = ['TEACHER', 'STAFF', 'ADMIN']

// Loads the signed-in user from the DB so that deleted / deactivated accounts
// and role changes take effect immediately instead of waiting for the JWT to expire.
export const getCurrentUser = cache(async () => {
    const session = await getSession()
    if (!session?.id) return null

    const user = await prisma.user.findUnique({
        where: { id: Number(session.id) },
        select: {
            id: true,
            username: true,
            prefix: true,
            firstName: true,
            lastName: true,
            role: true,
            status: true,
            studentId: true,
            trainingGroupId: true,
        },
    })

    if (!user || user.status !== 'ACTIVE') return null
    return user
})

// For pages: redirects to /login when signed out, and to / when the role is not allowed.
export async function requirePageUser(roles) {
    const user = await getCurrentUser()
    if (!user) redirect('/login')
    if (roles && !roles.includes(user.role)) redirect('/')
    return user
}

// For server actions: returns { user } or { error } so the caller can hand the error back to the UI.
export async function authorize(roles) {
    const user = await getCurrentUser()
    if (!user) return { error: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' }
    if (roles && !roles.includes(user.role)) return { error: 'คุณไม่มีสิทธิ์ดำเนินการนี้' }
    return { user }
}
