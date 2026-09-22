import { redirect } from 'next/navigation'
import { getCurrentUser } from '../lib/auth'
import { getSettingsMap } from '../lib/settings'
import prisma from '../lib/prisma'
import RegisterForm from './RegisterForm'

export const metadata = { title: 'สมัครสมาชิก' }

export default async function RegisterPage() {
    // Already signed in -> go straight to the dashboard
    if (await getCurrentUser()) redirect('/')

    const [settings, groups] = await Promise.all([
        getSettingsMap(),
        prisma.trainingGroup.findMany({
            where: { isActive: true },
            orderBy: { id: 'desc' },
            select: { id: true, name: true, generation: true, capacity: true, _count: { select: { students: true } } },
        }),
    ])

    return <RegisterForm systemName={settings.SYSTEM_NAME} groups={groups} />
}
