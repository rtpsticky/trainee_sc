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
            <div className="px-4 py-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r" role="alert">
                <i className="fas fa-exclamation-circle mr-2"></i>{error}
            </div>
        )
    }
    if (loading) {
        return <div className="p-12 text-center text-gray-400"><i className="fas fa-spinner fa-spin text-2xl"></i></div>
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
        <AppShell title="จัดการกลุ่มฝึกงาน" icon="fa-users">
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
        <AppShell title="จัดการแหล่งฝึกงาน" icon="fa-building">
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
        <AppShell title="จัดการผู้ใช้งาน" icon="fa-users-cog">
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
        <AppShell title="นิเทศติดตาม" icon="fa-chalkboard-teacher">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">นิเทศติดตามการฝึกงาน</h1>
                    <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลการนิเทศ ประเมินผล และติดตามนักศึกษา</p>
                </div>
                {data ? (
                    <SupervisionList
                        supervisions={data.supervisions.supervisions}
                        students={data.students.students}
                        initialStatus={['PENDING', 'COMPLETED', 'CANCELLED'].includes(status) ? status : 'ALL'}
                    />
                ) : <LoadState loading={loading} error={error} />}
            </div>
        </AppShell>
    )
}

export function ReportsPage() {
    const { data, error, loading } = useApiData({ stats: '/reports' })

    return (
        <AppShell title="รายงานสรุปผล" icon="fa-file-alt">
            <div className="max-w-7xl mx-auto w-full">
                {data ? <ReportDashboard data={data.stats} /> : <LoadState loading={loading} error={error} />}
            </div>
        </AppShell>
    )
}

export function SettingsPage() {
    const { settingRows } = useAuth()

    return (
        <AppShell title="ตั้งค่าระบบ" icon="fa-cog">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">ตั้งค่าระบบ</h1>
                    <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลพื้นฐานและค่าเริ่มต้นของระบบ</p>
                </div>
                <SettingsForm settings={settingRows} />
            </div>
        </AppShell>
    )
}
