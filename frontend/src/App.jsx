import { Navigate, Route, Routes } from 'react-router'
import { GuestOnly, RequireAuth, useAuth } from './lib/auth'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import {
    GroupsPage, LocationsPage, ReportsPage, SettingsPage, SupervisionsPage, UsersPage,
} from './pages/pages'

const MANAGE_ROLES = ['STAFF', 'ADMIN']
const SUPERVISE_ROLES = ['TEACHER', 'STAFF', 'ADMIN']

export default function App() {
    const { ready } = useAuth()

    // Wait for the stored token to be checked so guarded routes don't flash /login.
    if (!ready) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400">
                <i className="fas fa-spinner fa-spin text-2xl"></i>
            </div>
        )
    }

    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
            <Route path="/supervisions" element={<RequireAuth roles={SUPERVISE_ROLES}><SupervisionsPage /></RequireAuth>} />
            <Route path="/reports" element={<RequireAuth roles={SUPERVISE_ROLES}><ReportsPage /></RequireAuth>} />
            <Route path="/users" element={<RequireAuth roles={MANAGE_ROLES}><UsersPage /></RequireAuth>} />
            <Route path="/groups" element={<RequireAuth roles={MANAGE_ROLES}><GroupsPage /></RequireAuth>} />
            <Route path="/locations" element={<RequireAuth roles={MANAGE_ROLES}><LocationsPage /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth roles={MANAGE_ROLES}><SettingsPage /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}
