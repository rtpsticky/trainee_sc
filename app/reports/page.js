import AppShell from '../components/AppShell';
import { requirePageUser, SUPERVISE_ROLES } from '../lib/auth';
import { getDashboardStats } from '../lib/reports';
import ReportDashboard from './ReportDashboard';

export const metadata = { title: 'รายงานสรุปผล' };

export default async function ReportPage() {
    const user = await requirePageUser(SUPERVISE_ROLES);
    const statsData = await getDashboardStats();

    return (
        <AppShell user={user} title="รายงานสรุปผล" icon="fa-file-alt">
            <div className="max-w-7xl mx-auto w-full">
                <ReportDashboard data={statsData} />
            </div>
        </AppShell>
    );
}
