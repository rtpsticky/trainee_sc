import AppShell from '../components/AppShell';
import { requirePageUser, MANAGE_ROLES } from '../lib/auth';
import prisma from '../lib/prisma';
import UserList from './UserList';

export const metadata = { title: 'จัดการผู้ใช้งาน' };

export default async function UserManagementPage({ searchParams }) {
    const user = await requirePageUser(MANAGE_ROLES);
    const { tab, new: openNew } = await searchParams;

    const [users, groups] = await Promise.all([
        prisma.user.findMany({
            orderBy: { id: 'desc' },
            select: {
                id: true, username: true, email: true, prefix: true, firstName: true, lastName: true,
                role: true, status: true, studentId: true, major: true, academicYear: true,
                trainingGroupId: true,
                trainingGroup: { select: { name: true } },
            },
        }),
        prisma.trainingGroup.findMany({
            orderBy: { id: 'desc' },
            select: { id: true, name: true, capacity: true, isActive: true, _count: { select: { students: true } } },
        }),
    ]);

    return (
        <AppShell user={user} title="จัดการผู้ใช้งาน" icon="fa-users-cog">
            <UserList
                users={users}
                groups={groups}
                currentUserId={user.id}
                initialTab={['STUDENT', 'TEACHER', 'STAFF', 'ADMIN'].includes(tab) ? tab : 'ALL'}
                openAddOnLoad={openNew === '1'}
            />
        </AppShell>
    );
}
