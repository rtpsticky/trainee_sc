import AppShell from '../components/AppShell';
import { requirePageUser, MANAGE_ROLES } from '../lib/auth';
import prisma from '../lib/prisma';
import GroupList from './GroupList';

export const metadata = { title: 'จัดการกลุ่มฝึกงาน' };

export default async function TrainingGroupsPage() {
    const user = await requirePageUser(MANAGE_ROLES);

    const [groups, locations, teachers, students] = await Promise.all([
        prisma.trainingGroup.findMany({
            include: {
                location: true,
                advisors: { select: { id: true, prefix: true, firstName: true, lastName: true, email: true } },
                mentors: { orderBy: { id: 'asc' } },
                _count: { select: { students: true } },
            },
            orderBy: { id: 'desc' },
        }),
        // Inactive locations are still needed so existing groups keep displaying and editing correctly.
        prisma.location.findMany({ orderBy: { name: 'asc' } }),
        prisma.user.findMany({
            where: { role: 'TEACHER', status: 'ACTIVE' },
            select: { id: true, prefix: true, firstName: true, lastName: true, email: true },
            orderBy: { firstName: 'asc' },
        }),
        prisma.user.findMany({
            where: { role: 'STUDENT', status: 'ACTIVE' },
            select: { id: true, prefix: true, firstName: true, lastName: true, studentId: true, academicYear: true, trainingGroupId: true },
            orderBy: [{ studentId: 'asc' }, { firstName: 'asc' }],
        }),
    ]);

    return (
        <AppShell user={user} title="จัดการกลุ่มฝึกงาน" icon="fa-users">
            <GroupList groups={groups} locations={locations} teachers={teachers} students={students} />
        </AppShell>
    );
}
