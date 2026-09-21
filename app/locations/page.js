import AppShell from '../components/AppShell';
import { requirePageUser, MANAGE_ROLES } from '../lib/auth';
import prisma from '../lib/prisma';
import LocationList from './LocationList';

export const metadata = { title: 'สถานที่ฝึกงาน' };

export default async function TrainingSitesPage() {
    const user = await requirePageUser(MANAGE_ROLES);

    const locations = await prisma.location.findMany({
        orderBy: { id: 'asc' },
        include: { _count: { select: { groups: true } } },
    });

    return (
        <AppShell user={user} title="จัดการแหล่งฝึกงาน" icon="fa-building">
            <LocationList locations={locations} />
        </AppShell>
    );
}
