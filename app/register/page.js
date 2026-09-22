import { redirect } from 'next/navigation'
import { getCurrentUser } from '../lib/auth'
import { getSettingsMap } from '../lib/settings'
import RegisterForm from './RegisterForm'

export const metadata = { title: 'สมัครสมาชิก' }

export default async function RegisterPage() {
    // Already signed in -> go straight to the dashboard
    if (await getCurrentUser()) redirect('/')

    const settings = await getSettingsMap()

    return <RegisterForm systemName={settings.SYSTEM_NAME} />
}
