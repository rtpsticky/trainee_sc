import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Navigate } from 'react-router'
import { AUTH_EXPIRED, DATA_CHANGED, fetchMe, getToken, request, setToken } from './api'

// Used until /settings answers, and if the API is unreachable.
const DEFAULT_SETTINGS = {
    SYSTEM_NAME: 'ฝึกประสบการณ์วิชาชีพ สาขาวิชาสาธารณสุขศาสตร์',
    ACADEMIC_YEAR: '',
    SEMESTER: '',
    CONTACT_EMAIL: '',
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [ready, setReady] = useState(false)
    const [settings, setSettings] = useState(DEFAULT_SETTINGS)
    const [settingRows, setSettingRows] = useState([])

    const loadSettings = useCallback(async () => {
        const result = await request('GET', '/settings')
        if (!result.error) {
            setSettings({ ...DEFAULT_SETTINGS, ...result.settings })
            setSettingRows(result.rows)
        }
    }, [])

    // Re-reads the signed-in user so role / status changes apply without signing in again.
    const loadUser = useCallback(async () => {
        if (!getToken()) {
            setUser(null)
            return
        }
        const result = await fetchMe()
        if (result.user) setUser(result.user)
        else if (result.status === 401) {
            setToken(null)
            setUser(null)
        }
    }, [])

    useEffect(() => {
        Promise.all([loadUser(), loadSettings()]).finally(() => setReady(true))

        const onChanged = () => { loadUser(); loadSettings() }
        const onExpired = () => { setToken(null); setUser(null) }
        window.addEventListener(DATA_CHANGED, onChanged)
        window.addEventListener(AUTH_EXPIRED, onExpired)
        return () => {
            window.removeEventListener(DATA_CHANGED, onChanged)
            window.removeEventListener(AUTH_EXPIRED, onExpired)
        }
    }, [loadUser, loadSettings])

    const signIn = (token, signedInUser) => {
        setToken(token)
        setUser(signedInUser)
    }

    const signOut = () => {
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, ready, settings, settingRows, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)

// Route guard: sends signed-out users to /login and users without the role to /.
export function RequireAuth({ roles, children }) {
    const { user } = useAuth()
    if (!user) return <Navigate to="/login" replace />
    if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
    return children
}

// For /login and /register: signed-in users go straight to the dashboard.
export function GuestOnly({ children }) {
    const { user } = useAuth()
    return user ? <Navigate to="/" replace /> : children
}
