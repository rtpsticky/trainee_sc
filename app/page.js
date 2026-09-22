import Link from 'next/link';
import AppShell from './components/AppShell';
import LandingPage from './LandingPage';
import { getCurrentUser } from './lib/auth';
import { getDashboardStats } from './lib/reports';
import { getRecentActivities, getUpcomingSupervisions, getStudentGroup } from './lib/dashboard';
import { getSettingsMap } from './lib/settings';
import { SUPERVISION_TYPE_LABELS, formatDate, formatDay, formatTime, formatTimeAgo } from './lib/format';

export const metadata = { title: 'หน้าหลัก' };

export default async function Dashboard() {
  const user = await getCurrentUser();
  const settings = await getSettingsMap();

  if (!user) return <LandingPage settings={settings} />;

  const semesterLabel = `ภาคการศึกษา ${settings.SEMESTER}/${settings.ACADEMIC_YEAR}`;

  if (user.role === 'STUDENT') {
    return <StudentHome user={user} semesterLabel={semesterLabel} />;
  }

  const canManage = ['STAFF', 'ADMIN'].includes(user.role);
  const [statsData, activities, upcomingSupervisions] = await Promise.all([
    getDashboardStats(),
    canManage ? getRecentActivities() : [],
    getUpcomingSupervisions(),
  ]);

  const { counts, supervision } = statsData.error ? { counts: {}, supervision: {} } : statsData;

  return (
    <AppShell user={user} title="หน้าหลัก" icon="fa-home">
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
                  {semesterLabel}
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
              link={canManage ? '/users?tab=STUDENT' : null}
            />
            <StatCard
              title="สถานที่ฝึกงาน"
              value={counts?.locations || 0}
              icon="fa-hospital"
              color="purple"
              link={canManage ? '/locations' : null}
            />
            <StatCard
              title="กลุ่มฝึกงาน"
              value={counts?.groups || 0}
              icon="fa-users"
              color="green"
              link={canManage ? '/groups' : null}
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
                  {canManage && <QuickAction title="เพิ่มนักศึกษา" icon="fa-user-plus" color="blue" href="/users?tab=STUDENT&new=1" />}
                  {canManage && <QuickAction title="จัดกลุ่มฝึกงาน" icon="fa-users" color="purple" href="/groups" />}
                  <QuickAction title="นัดหมายนิเทศ" icon="fa-calendar-plus" color="green" href="/supervisions" />
                  <QuickAction title="ดูรายงาน" icon="fa-file-alt" color="indigo" href="/reports" />
                </div>
              </div>

              {/* Recent Activities */}
              {canManage && <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
              </div>}

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
                          <span className="text-xl font-bold leading-none">{new Date(sup.date).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric' })}</span>
                          <span className="text-[10px] uppercase font-bold">{new Date(sup.date).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', month: 'short' })}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 line-clamp-1">{sup.student.firstName} {sup.student.lastName}</p>
                          <p className="text-xs text-gray-500">{formatTime(sup.date)} • {SUPERVISION_TYPE_LABELS[sup.type]}</p>
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

    </AppShell>
  );
}

// Components
function Wrapper({ href, className, children }) {
  return href ? <Link href={href} className={className}>{children}</Link> : <div className={className}>{children}</div>;
}

async function StudentHome({ user, semesterLabel }) {
  const [group, upcoming] = await Promise.all([
    getStudentGroup(user.trainingGroupId),
    getUpcomingSupervisions(user.id),
  ]);

  return (
    <AppShell user={user} title="หน้าหลัก" icon="fa-home">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800">สวัสดี, {user.firstName} {user.lastName} 👋</h2>
          <p className="text-sm text-gray-500 mt-1">
            {semesterLabel}{user.studentId ? ` · รหัสนักศึกษา ${user.studentId}` : ''}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4"><i className="fas fa-users mr-2 text-green-600"></i>กลุ่มฝึกงานของฉัน</h3>
          {group ? (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-500">กลุ่ม</dt><dd className="font-medium text-gray-900">{group.name} (รุ่น {group.generation})</dd></div>
              <div><dt className="text-gray-500">สถานที่ฝึกงาน</dt><dd className="font-medium text-gray-900">{group.location.name}</dd></div>
              <div><dt className="text-gray-500">ระยะเวลา</dt><dd className="font-medium text-gray-900">{formatDay(group.startDate)} - {formatDay(group.endDate)}</dd></div>
              <div>
                <dt className="text-gray-500">อาจารย์ที่ปรึกษา</dt>
                <dd className="font-medium text-gray-900">
                  {group.advisors.length > 0 ? group.advisors.map(a => `${a.prefix ?? ''}${a.firstName} ${a.lastName}`).join(', ') : 'ยังไม่ระบุ'}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-gray-500">คุณยังไม่ได้ถูกจัดเข้ากลุ่มฝึกงาน กรุณาติดต่อเจ้าหน้าที่</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4"><i className="fas fa-calendar-alt mr-2 text-blue-500"></i>การนิเทศที่กำลังจะมาถึง</h3>
          {upcoming.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {upcoming.map(sup => (
                <li key={sup.id} className="py-3 text-sm">
                  <p className="font-medium text-gray-900">{formatDate(sup.date)} {formatTime(sup.date)}</p>
                  <p className="text-gray-500">{SUPERVISION_TYPE_LABELS[sup.type]} · {sup.locationName || 'ไม่ระบุสถานที่'} · ผู้นิเทศ {sup.supervisor.firstName} {sup.supervisor.lastName}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">ยังไม่มีการนัดหมายนิเทศ</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ title, value, icon, color, link }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <Wrapper href={link} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center ${link ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${colors[color]}`}>
        <i className={`fas ${icon} text-xl`}></i>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </Wrapper>
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
