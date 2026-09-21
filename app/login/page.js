import { redirect } from 'next/navigation'
import { getCurrentUser } from '../lib/auth'
import { getSettingsMap } from '../lib/settings'
import LoginForm from './LoginForm'

export default async function LoginPage() {
    // Already signed in -> go straight to the dashboard
    if (await getCurrentUser()) redirect('/')

    const settings = await getSettingsMap()
    return <LoginForm systemName={settings.SYSTEM_NAME} />
}
