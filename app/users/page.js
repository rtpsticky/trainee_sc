import Link from 'next/link';
import Image from 'next/image';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getSession } from '../lib/session';
import { redirect } from 'next/navigation';
import prisma from '../lib/prisma';
import UserList from './UserList';

export default async function UserManagementPage() {
    const user = await getSession();

    if (!user) {
        redirect('/login');
    }

    const users = await prisma.user.findMany({
        orderBy: {
            id: 'desc',
        },
    });

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="จัดการผู้ใช้งาน" icon="fa-users-cog" user={user} />

                {/* Content Scrollable Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <UserList initialUsers={users} />
                </main>
            </div>
        </div>
    );
}
