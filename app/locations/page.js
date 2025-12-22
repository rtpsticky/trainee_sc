import Link from 'next/link';
import Image from 'next/image';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getSession } from '../lib/session';
import { redirect } from 'next/navigation';
import prisma from '../lib/prisma';
import LocationList from './LocationList';

export default async function TrainingSitesPage() {
    const user = await getSession();

    if (!user) {
        redirect('/login');
    }

    const locations = await prisma.location.findMany({
        orderBy: {
            id: 'asc',
        },
    });

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="จัดการแหล่งฝึกงาน" icon="fa-building" user={user} />

                {/* Content Scrollable Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <LocationList initialLocations={locations} />
                </main>
            </div>
        </div>
    );
}
