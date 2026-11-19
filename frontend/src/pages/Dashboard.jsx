import { Link } from 'react-router';
import AppShell from '../components/AppShell';
import LandingPage from './LandingPage';
import { LoadState } from './pages';
import { Block, StatCard, StepFlow, EmptyState } from '../components/ui';
import { useAuth } from '../lib/auth';
import { useApiData } from '../lib/useApi';
import { SUPERVISION_TYPE_LABELS, formatDate, formatDay, formatTime, formatTimeAgo } from '../lib/format';

const TZ = 'Asia/Bangkok';

export default function Dashboard() {
  const { user, settings } = useAuth();

  if (!user) return <LandingPage settings={settings} />;

  const semesterLabel = settings.SEMESTER && settings.ACADEMIC_YEAR
    ? `ภาคการศึกษา ${settings.SEMESTER}/${settings.ACADEMIC_YEAR}`
    : '';

  return (
    <AppShell title="หน้าหลัก" icon="fa-house">
      <Welcome user={user} semesterLabel={semesterLabel} />
      {user.role === 'STUDENT' ? <StudentHome user={user} /> : <StaffHome user={user} />}
    </AppShell>
  );
}

function Welcome({ user, semesterLabel }) {
  const today = new Date().toLocaleDateString('th-TH', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <div className="block-card p-6 sm:p-8 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <p className="text-base text-muted mb-1">{today}</p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-ink">
          สวัสดี คุณ{user.firstName} {user.lastName}
        </h1>
        <p className="text-lg text-muted mt-1">ยินดีต้อนรับสู่ระบบฝึกประสบการณ์วิชาชีพ</p>
      </div>
      {semesterLabel && (
        <span className="self-start md:self-center inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-50 text-brand-700 text-lg font-medium">
          <i className="fas fa-graduation-cap"></i>{semesterLabel}
        </span>
      )}
    </div>
  );
}

function StaffHome({ user }) {
  const { data, error, loading } = useApiData({ home: '/dashboard' });
  if (!data) return <LoadState loading={loading} error={error} />;

  const { stats, activities, upcoming } = data.home;
  const canManage = ['STAFF', 'ADMIN'].includes(user.role);
  const { counts = {}, supervision = {} } = stats.error ? {} : stats;

  const steps = canManage ? [
    { title: 'เพิ่มแหล่งฝึกงาน', description: 'โรงพยาบาล / หน่วยงานที่รับนักศึกษา', href: '/locations', icon: 'fa-hospital' },
    { title: 'สร้างกลุ่มฝึกงาน', description: 'กำหนดช่วงเวลาและอาจารย์ที่ปรึกษา', href: '/groups', icon: 'fa-people-group' },
    { title: 'จัดนักศึกษาเข้ากลุ่ม', description: 'อนุมัติผู้สมัครและจัดเข้ากลุ่ม', href: '/users?tab=STUDENT', icon: 'fa-user-check' },
    { title: 'นัดหมายนิเทศ', description: 'นัดวันและเวลานิเทศนักศึกษา', href: '/supervisions?status=PENDING', icon: 'fa-calendar-plus' },
    { title: 'สรุปผลและรายงาน', description: 'ดูผลการประเมินและพิมพ์รายงาน', href: '/reports', icon: 'fa-chart-column' },
  ] : [
    { title: 'ดูปฏิทินฝึกงาน', description: 'ดูวันนัดนิเทศทั้งหมดในปฏิทิน', href: '/calendar', icon: 'fa-calendar-days' },
    { title: 'นัดหมายนิเทศ', description: 'นัดวันและเวลานิเทศนักศึกษา', href: '/supervisions?status=PENDING', icon: 'fa-calendar-plus' },
    { title: 'บันทึกผลการนิเทศ', description: 'บันทึกผลหลังนิเทศเสร็จ', href: '/supervisions?status=COMPLETED', icon: 'fa-clipboard-check' },
    { title: 'ดูรายงานสรุปผล', description: 'ภาพรวมผลการประเมิน', href: '/reports', icon: 'fa-chart-column' },
  ];

  return (
    <div className="space-y-6">
      <Block number={1} title="ขั้นตอนการทำงาน" description="เริ่มจากขั้นตอนที่ 1 ไปตามลำดับ กดที่กล่องเพื่อไปยังหน้านั้น">
        <StepFlow steps={steps} />
      </Block>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="นักศึกษา" value={counts.students ?? 0} suffix="คน" icon="fa-user-graduate" color="blue" href={canManage ? '/users?tab=STUDENT' : undefined} />
        <StatCard title="อาจารย์" value={counts.teachers ?? 0} suffix="คน" icon="fa-chalkboard-user" color="green" href={canManage ? '/users?tab=TEACHER' : undefined} />
        <StatCard title="แหล่งฝึกงาน" value={counts.locations ?? 0} suffix="แห่ง" icon="fa-hospital" color="purple" href={canManage ? '/locations' : undefined} />
        <StatCard title="รอการนิเทศ" value={supervision.pending ?? 0} suffix="รายการ" icon="fa-clock" color="yellow" href="/supervisions?status=PENDING" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Block
          number={2}
          title="การนิเทศที่กำลังจะมาถึง"
          className={canManage ? 'lg:col-span-3' : 'lg:col-span-5'}
          bodyClassName=""
          actions={<Link to="/calendar" className="btn btn-soft btn-sm"><i className="fas fa-calendar-days"></i> ดูปฏิทิน</Link>}
        >
          <UpcomingList items={upcoming} showStudent />
        </Block>

        {canManage && (
          <Block number={3} title="กิจกรรมล่าสุด" className="lg:col-span-2" bodyClassName="">
            {activities.length > 0 ? (
              <ul className="divide-y divide-line">
                {activities.map((a, idx) => (
                  <li key={idx} className="px-5 sm:px-6 py-4 flex items-start gap-4">
                    <span className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${a.color}`}>
                      <i className={`fas ${a.icon}`}></i>
                    </span>
                    <div className="min-w-0">
                      <p className="text-base font-medium text-ink">{a.title}</p>
                      <p className="text-base text-muted line-clamp-2">{a.desc}</p>
                      <p className="text-sm text-muted mt-0.5">{formatTimeAgo(a.date)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <EmptyState icon="fa-clock-rotate-left" title="ยังไม่มีกิจกรรม" />}
          </Block>
        )}
      </div>
    </div>
  );
}

function UpcomingList({ items, showStudent }) {
  if (items.length === 0) {
    return <EmptyState icon="fa-calendar-check" title="ยังไม่มีการนัดหมาย">การนัดหมายนิเทศที่กำลังจะมาถึงจะแสดงที่นี่</EmptyState>;
  }
  return (
    <ul className="divide-y divide-line">
      {items.map(sup => (
        <li key={sup.id} className="px-5 sm:px-6 py-4 flex items-center gap-4">
          <div className="w-16 rounded-xl bg-brand-50 text-brand-700 text-center py-2 flex-shrink-0">
            <p className="text-2xl font-semibold leading-none">{new Date(sup.date).toLocaleDateString('th-TH', { timeZone: TZ, day: 'numeric' })}</p>
            <p className="text-sm">{new Date(sup.date).toLocaleDateString('th-TH', { timeZone: TZ, month: 'short' })}</p>
          </div>
          <div className="min-w-0">
            <p className="text-lg font-medium text-ink truncate">
              {showStudent ? `${sup.student.firstName} ${sup.student.lastName}` : SUPERVISION_TYPE_LABELS[sup.type]}
            </p>
            <p className="text-base text-muted">
              <i className="far fa-clock mr-1"></i>{formatTime(sup.date)}
              {showStudent && <> · {SUPERVISION_TYPE_LABELS[sup.type]}</>}
              {!showStudent && <> · ผู้นิเทศ {sup.supervisor.firstName} {sup.supervisor.lastName}</>}
            </p>
            <p className="text-base text-muted truncate"><i className="fas fa-location-dot mr-1"></i>{sup.locationName || 'ไม่ระบุสถานที่'}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function StudentHome({ user }) {
  const { data, error, loading } = useApiData({ home: '/dashboard' });
  if (!data) return <LoadState loading={loading} error={error} />;

  const { group, upcoming } = data.home;
  const now = Date.now();
  const started = group && new Date(group.startDate).getTime() <= now;
  const finished = group && new Date(group.endDate).getTime() < now;

  const steps = [
    { title: 'สมัครสมาชิก', description: 'ส่งใบสมัครเรียบร้อย', state: 'done' },
    { title: 'ได้รับการอนุมัติ', description: 'บัญชีพร้อมใช้งาน', state: 'done' },
    { title: 'จัดเข้ากลุ่มฝึกงาน', description: group ? group.name : 'รอเจ้าหน้าที่จัดกลุ่ม', state: group ? 'done' : 'active' },
    {
      title: 'ออกฝึกงาน',
      description: !group ? 'รอจัดกลุ่มก่อน' : finished ? 'ฝึกงานครบแล้ว' : started ? 'กำลังฝึกงาน' : `เริ่ม ${formatDay(group.startDate)}`,
      state: !group ? 'todo' : finished ? 'done' : 'active',
    },
    {
      title: 'รับการนิเทศ',
      description: upcoming.length > 0 ? `มีนัดหมาย ${upcoming.length} ครั้ง` : 'ยังไม่มีนัดหมาย',
      state: group ? 'active' : 'todo',
      href: '/calendar',
      cta: 'ดูปฏิทิน',
    },
  ];

  return (
    <div className="space-y-6">
      <Block number={1} title="สถานะการฝึกงานของฉัน" description={user.studentId ? `รหัสนักศึกษา ${user.studentId}` : undefined}>
        <StepFlow steps={steps} />
      </Block>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Block number={2} title="กลุ่มฝึกงานของฉัน">
          {group ? (
            <dl className="space-y-4">
              <InfoRow icon="fa-people-group" label="กลุ่ม" value={`${group.name} (รุ่น ${group.generation})`} />
              <InfoRow icon="fa-hospital" label="แหล่งฝึกงาน" value={`${group.location.name} จ.${group.location.province}`} />
              <InfoRow icon="fa-calendar-days" label="ระยะเวลาฝึกงาน" value={`${formatDay(group.startDate)} ถึง ${formatDay(group.endDate)}`} />
              <InfoRow
                icon="fa-chalkboard-user"
                label="อาจารย์ที่ปรึกษา"
                value={group.advisors.length > 0 ? group.advisors.map(a => `${a.prefix ?? ''}${a.firstName} ${a.lastName}`).join(', ') : 'ยังไม่ระบุ'}
              />
            </dl>
          ) : (
            <EmptyState icon="fa-hourglass-half" title="ยังไม่ได้ถูกจัดเข้ากลุ่ม">เจ้าหน้าที่จะจัดกลุ่มฝึกงานให้ หากมีข้อสงสัยกรุณาติดต่อเจ้าหน้าที่</EmptyState>
          )}
        </Block>

        <Block
          number={3}
          title="การนิเทศที่กำลังจะมาถึง"
          bodyClassName=""
          actions={<Link to="/calendar" className="btn btn-soft btn-sm"><i className="fas fa-calendar-days"></i> ดูปฏิทิน</Link>}
        >
          <UpcomingList items={upcoming} />
        </Block>
      </div>
      <p className="text-base text-muted text-center">ข้อมูล ณ {formatDate(new Date())}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4">
      <span className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
        <i className={`fas ${icon}`}></i>
      </span>
      <div className="min-w-0">
        <dt className="text-base text-muted">{label}</dt>
        <dd className="text-lg font-medium text-ink">{value}</dd>
      </div>
    </div>
  );
}
