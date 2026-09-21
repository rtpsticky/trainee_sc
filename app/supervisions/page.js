import AppShell from '../components/AppShell';
import { requirePageUser, SUPERVISE_ROLES } from '../lib/auth';
import prisma from '../lib/prisma';
import SupervisionList from './SupervisionList';

export const metadata = { title: 'นิเทศติดตาม' };

const studentSelect = {
    id: true,
    prefix: true,
    firstName: true,
    lastName: true,
    studentId: true,
    trainingGroup: { select: { id: true, name: true, location: { select: { name: true } } } },
};

export default async function SupervisionPage({ searchParams }) {
    const user = await requirePageUser(SUPERVISE_ROLES);
    const { status } = await searchParams;

    const [supervisions, students] = await Promise.all([
        prisma.supervision.findMany({
            include: {
                student: { select: studentSelect },
                supervisor: { select: { id: true, prefix: true, firstName: true, lastName: true } },
            },
            orderBy: { date: 'desc' },
        }),
        prisma.user.findMany({
            where: { role: 'STUDENT', status: 'ACTIVE' },
            select: studentSelect,
            orderBy: [{ studentId: 'asc' }, { firstName: 'asc' }],
        }),
    ]);

    return (
        <AppShell user={user} title="นิเทศติดตาม" icon="fa-chalkboard-teacher">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">นิเทศติดตามการฝึกงาน</h1>
                    <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลการนิเทศ ประเมินผล และติดตามนักศึกษา</p>
                </div>
                <SupervisionList
                    supervisions={supervisions}
                    students={students}
                    initialStatus={['PENDING', 'COMPLETED', 'CANCELLED'].includes(status) ? status : 'ALL'}
                />
            </div>
        </AppShell>
    );
}
