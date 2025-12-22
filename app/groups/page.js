import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getSession } from '../lib/session';
import { redirect } from 'next/navigation';
import prisma from '../lib/prisma';
import GroupList from './GroupList';

export default async function TrainingGroupsPage() {
    const user = await getSession();

    if (!user) {
        redirect('/login');
    }

    // 1. Fetch Training Groups with relations
    const groups = await prisma.trainingGroup.findMany({
        include: {
            location: true,
            advisors: true,
            _count: {
                select: { students: true }
            }
        },
        orderBy: {
            id: 'desc',
        },
    });

    // 2. Fetch Active Locations for Dropdown
    const locations = await prisma.location.findMany({
        where: {
            status: 'ACTIVE'
        },
        orderBy: {
            name: 'asc'
        }
    });

    // 3. Fetch Teachers for Advisor Dropdown
    const teachers = await prisma.user.findMany({
        where: {
            role: 'TEACHER',
            status: 'ACTIVE'
        },
        orderBy: {
            firstName: 'asc'
        }
    });

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="จัดการกลุ่มฝึกงาน" icon="fa-users" user={user} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <GroupList
                        initialGroups={groups}
                        locations={locations}
                        teachers={teachers}
                    />
                </main>
            </div>
        </div>
    );
}
