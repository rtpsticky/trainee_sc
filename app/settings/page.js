import AppShell from '../components/AppShell';
import { requirePageUser, MANAGE_ROLES } from '../lib/auth';
import { getSettingRows } from '../lib/settings';
import SettingsForm from './SettingsForm';

export const metadata = { title: 'ตั้งค่าระบบ' };

export default async function SettingsPage() {
    const user = await requirePageUser(MANAGE_ROLES);
    const settings = await getSettingRows();

    return (
        <AppShell user={user} title="ตั้งค่าระบบ" icon="fa-cog">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">ตั้งค่าระบบ</h1>
                    <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลพื้นฐานและค่าเริ่มต้นของระบบ</p>
                </div>
                <SettingsForm settings={settings} />
            </div>
        </AppShell>
    );
}
