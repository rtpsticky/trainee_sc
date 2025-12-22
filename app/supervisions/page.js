import { getSession } from '../lib/session';
import { redirect } from 'next/navigation';
import prisma from '../lib/prisma';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SupervisionList from './SupervisionList';

export default async function SupervisionPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const user = session;

    // Fetch Supervisions
    // In a real app, might filter by role (if teacher, only see their own or advisees?)
    // For now, fetching all as per "Admin/Advisor" view
    const supervisions = await prisma.supervision.findMany({
        include: {
            student: {
                select: {
                    id: true,
                    prefix: true,
                    firstName: true,
                    lastName: true,
                    studentId: true,
                    trainingGroup: {
                        select: {
                            id: true,
                            name: true,
                            location: {
                                select: {
                                    id: true,
                                    name: true,
                                    province: true
                                }
                            }
                        }
                    }
                }
            },
            supervisor: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true
                }
            }
        },
        orderBy: {
            date: 'desc'
        }
    });

    // Fetch active students for dropdown
    const students = await prisma.user.findMany({
        where: {
            role: 'STUDENT',
            status: 'ACTIVE'
        },
        select: {
            id: true,
            prefix: true,
            firstName: true,
            lastName: true,
            studentId: true,
            trainingGroup: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        orderBy: {
            studentId: 'asc'
        }
    });

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar user={user} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header user={user} title="นิเทศติดตาม" />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">นิเทศติดตามการฝึกงาน</h1>
                            <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลการนิเทศ ประเมินผล และติดตามนักศึกษา</p>
                        </div>
                        <SupervisionList
                            initialSupervisions={supervisions}
                            students={students}
                            currentUser={user}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}
