import { useSearchParams } from 'react-router'
import AppShell from '../components/AppShell'
import { useAuth } from '../lib/auth'
import { useApiData } from '../lib/useApi'
import GroupList from './GroupList'
import LocationList from './LocationList'
import ReportDashboard from './ReportDashboard'
import SettingsForm from './SettingsForm'
import SupervisionList from './SupervisionList'
import UserList from './UserList'

// Spinner / error placeholder while a page's data is loading.
export function LoadState({ loading, error }) {
    if (error) {
        return (
            <div className="block-card p-6 flex items-start gap-4 text-red-800 bg-red-50 border-red-200" role="alert">
                <i className="fas fa-triangle-exclamation text-2xl mt-0.5"></i>
                <div>
                    <p className="text-lg font-medium">ไม่สามารถโหลดข้อมูลได้</p>
                    <p className="text-base">{error}</p>
                </div>
            </div>
        )
    }
    if (loading) {
        return (
            <div className="block-card p-12 text-center text-muted">
                <i className="fas fa-spinner fa-spin text-3xl text-brand-600"></i>
                <p className="text-lg mt-3">กำลังโหลดข้อมูล...</p>
            </div>
        )
    }
    return null
}

export function GroupsPage() {
    const { data, error, loading } = useApiData({
        groups: '/groups',
        // Inactive locations are still needed so existing groups keep displaying and editing correctly.
        locations: '/locations',
        teachers: '/users?role=TEACHER&status=ACTIVE',
        students: '/students',
    })

    return (
        <AppShell title="กลุ่มฝึกงาน" icon="fa-people-group">
            {data ? (
                <GroupList
                    groups={data.groups.groups}
                    locations={[...data.locations.locations].sort((a, b) => a.name.localeCompare(b.name, 'th'))}
                    teachers={[...data.teachers.users].sort((a, b) => a.firstName.localeCompare(b.firstName, 'th'))}
                    students={data.students.students}
                />
            ) : <LoadState loading={loading} error={error} />}
        </AppShell>
    )
}

export function LocationsPage() {
    const { data, error, loading } = useApiData({ locations: '/locations' })

    return (
        <AppShell title="แหล่งฝึกงาน" icon="fa-hospital">
            {data ? <LocationList locations={data.locations.locations} /> : <LoadState loading={loading} error={error} />}
        </AppShell>
    )
}

export function UsersPage() {
    const { user } = useAuth()
    const [searchParams] = useSearchParams()
    const tab = searchParams.get('tab')
    const { data, error, loading } = useApiData({ users: '/users', groups: '/groups' })

    return (
        <AppShell title="จัดการผู้ใช้งาน" icon="fa-users-gear">
            {data ? (
                <UserList
                    users={data.users.users}
                    groups={data.groups.groups}
                    currentUserId={user.id}
                    initialTab={['STUDENT', 'TEACHER', 'STAFF', 'ADMIN'].includes(tab) ? tab : 'ALL'}
                    openAddOnLoad={searchParams.get('new') === '1'}
                />
            ) : <LoadState loading={loading} error={error} />}
        </AppShell>
    )
}

export function SupervisionsPage() {
    const [searchParams] = useSearchParams()
    const status = searchParams.get('status')
    const { data, error, loading } = useApiData({ supervisions: '/supervisions', students: '/students' })

    return (
        <AppShell title="นิเทศติดตาม" icon="fa-chalkboard-user">
            {data ? (
                <SupervisionList
                    supervisions={data.supervisions.supervisions}
                    students={data.students.students}
                    initialStatus={['PENDING', 'COMPLETED', 'CANCELLED'].includes(status) ? status : 'ALL'}
                />
            ) : <LoadState loading={loading} error={error} />}
        </AppShell>
    )
}

export function ReportsPage() {
    const { data, error, loading } = useApiData({ stats: '/reports' })

    return (
        <AppShell title="รายงานสรุปผล" icon="fa-chart-column">
            {data ? <ReportDashboard data={data.stats} /> : <LoadState loading={loading} error={error} />}
        </AppShell>
    )
}

export function SettingsPage() {
    const { settingRows } = useAuth()

    return (
        <AppShell title="ตั้งค่าระบบ" icon="fa-gear">
            <SettingsForm settings={settingRows} />
        </AppShell>
    )
}
