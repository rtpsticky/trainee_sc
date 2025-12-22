import { getSession } from './lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { getDashboardQuickStats, getRecentActivities, getUpcomingSupervisions } from './actions/dashboard';

export default async function Dashboard() {
  const session = await getSession();

  // If not logged in, show simple landing or redirect
  // For consistency with other pages which use Sidebar, let's Redirect to login if user is not authenticated
  // Or if we want a public landing page, we'd need a different layout. 
  // Based on current request "Home page use data...", it implies an internal dashboard.
  if (!session) {
    redirect('/login');
  }

  const user = session;

  // Fetch Data
  const statsData = await getDashboardQuickStats();
  const activities = await getRecentActivities();
  const upcomingSupervisions = await getUpcomingSupervisions();

  const { counts, supervision } = statsData.error ? { counts: {}, supervision: {} } : statsData;

  // Formatting helpers
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " ปีที่แล้ว";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " เดือนที่แล้ว";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " วันที่แล้ว";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " ชั่วโมงที่แล้ว";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " นาทีที่แล้ว";
    return "เมื่อสักครู่";
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} title="หน้าหลัก" icon="fa-home" />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {/* Welcome Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  สวัสดี, {user.firstName} {user.lastName} 👋
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  ยินดีต้อนรับสู่ระบบจัดการฝึกงานสาขาสาธารณสุขศาสตร์
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                  ภาคการศึกษา 1/2566
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="นักศึกษาทั้งหมด"
              value={counts?.students || 0}
              icon="fa-user-graduate"
              color="blue"
              link="/users?tab=STUDENT"
            />
            <StatCard
              title="สถานที่ฝึกงาน"
              value={counts?.locations || 0}
              icon="fa-hospital"
              color="purple"
              link="/locations"
            />
            <StatCard
              title="กลุ่มฝึกงาน"
              value={counts?.groups || 0}
              icon="fa-users"
              color="green"
              link="/groups"
            />
            <StatCard
              title="รอการนิเทศ"
              value={supervision?.pending || 0}
              icon="fa-clock"
              color="yellow"
              link="/supervisions?status=PENDING"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Activities & Quick Actions */}
            <div className="lg:col-span-2 space-y-8">

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <i className="fas fa-bolt mr-2 text-yellow-500"></i> ทางลัดการทำงาน
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <QuickAction title="เพิ่มนักศึกษา" icon="fa-user-plus" color="blue" href="/users" />
                  <QuickAction title="เพิ่มแหล่งฝึก" icon="fa-building" color="purple" href="/locations" />
                  <QuickAction title="นัดหมายนิเทศ" icon="fa-calendar-plus" color="green" href="/supervisions" />
                  <QuickAction title="ดูรายงาน" icon="fa-file-alt" color="indigo" href="/reports" />
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    <i className="fas fa-history mr-2 text-gray-400"></i> กิจกรรมล่าสุด
                  </h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {activities.length > 0 ? activities.map((activ, idx) => (
                    <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activ.color}`}>
                          <i className={`fas ${activ.icon}`}></i>
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="text-sm font-medium text-gray-900">{activ.title}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{activ.desc}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(activ.date)}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-gray-400 text-sm">ยังไม่มีกิจกรรมล่าสุด</div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Upcoming & Calendar */}
            <div className="space-y-8">
              {/* Upcoming Supervisions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    <i className="fas fa-calendar-alt mr-2 text-blue-500"></i> การนิเทศเร็วๆ นี้
                  </h3>
                </div>
                <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                  {upcomingSupervisions.length > 0 ? upcomingSupervisions.map((sup) => (
                    <div key={sup.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start mb-2">
                        <div className="flex-col flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg p-2 min-w-[50px] mr-3">
                          <span className="text-xl font-bold leading-none">{new Date(sup.date).getDate()}</span>
                          <span className="text-[10px] uppercase font-bold">{new Date(sup.date).toLocaleDateString('th-TH', { month: 'short' })}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 line-clamp-1">{sup.student.firstName} {sup.student.lastName}</p>
                          <p className="text-xs text-gray-500">{new Date(sup.date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น. • {sup.type}</p>
                        </div>
                      </div>
                      <div className="ml-[62px]">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600">
                          {sup.locationName || 'ไม่ระบุสถานที่'}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-gray-400 text-sm">ไม่มีการนัดหมายเร็วๆ นี้</div>
                  )}
                </div>
                <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                  <Link href="/supervisions" className="text-xs font-semibold text-blue-600 hover:text-blue-800">ดูทั้งหมด</Link>
                </div>
              </div>

            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

// Components
function StatCard({ title, value, icon, color, link }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <Link href={link || '#'} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow cursor-pointer">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${colors[color]}`}>
        <i className={`fas ${icon} text-xl`}></i>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </Link>
  );
}

function QuickAction({ title, icon, color, href }) {
  const colors = {
    blue: 'hover:bg-blue-50 hover:border-blue-200 text-blue-600',
    purple: 'hover:bg-purple-50 hover:border-purple-200 text-purple-600',
    green: 'hover:bg-green-50 hover:border-green-200 text-green-600',
    indigo: 'hover:bg-indigo-50 hover:border-indigo-200 text-indigo-600',
  };

  return (
    <Link href={href} className={`flex flex-col items-center justify-center p-4 border border-gray-100 rounded-xl transition-all ${colors[color]} group`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-gray-50 group-hover:bg-white`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">{title}</span>
    </Link>
  );
}
