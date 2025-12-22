import { getSession } from '../lib/session';
import { redirect } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getDashboardStats } from '../actions/reports';
import ReportDashboard from './ReportDashboard';

export default async function ReportPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const statsData = await getDashboardStats();

    return (
        <div className="flex h-screen bg-gray-50 font-sans print:bg-white print:h-auto">
            <div className="print:hidden">
                <Sidebar user={session} />
            </div>
            <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible">
                <div className="print:hidden">
                    <Header user={session} title="รายงานสรุปผล" icon="fa-file-alt" />
                </div>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 print:bg-white print:overflow-visible">
                    <div className="max-w-7xl mx-auto w-full">
                        <ReportDashboard data={statsData} />
                    </div>
                </main>
            </div>
        </div>
    );
}
