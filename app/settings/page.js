import { getSession } from '../lib/session';
import { redirect } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getSettings, updateSetting } from '../actions/settings';

export default async function SettingsPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const { settings, error } = await getSettings();

    // Group settings for UI
    const groupedSettings = settings ? settings.reduce((groups, item) => {
        const group = item.group || 'OTHER';
        if (!groups[group]) {
            groups[group] = [];
        }
        groups[group].push(item);
        return groups;
    }, {}) : {};

    const groupTitles = {
        'GENERAL': 'ตั้งค่าทั่วไป',
        'ACADEMIC': 'ตั้งค่าปีการศึกษา',
        'CONTACT': 'ข้อมูลติดต่อ',
        'OTHER': 'อื่นๆ'
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar user={session} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header user={session} title="ตั้งค่าระบบ" icon="fa-cog" />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">ตั้งค่าระบบ</h1>
                            <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลพื้นฐานและค่าเริ่มต้นของระบบ</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <i className="fas fa-exclamation-circle text-red-500"></i>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form action={updateSetting}>
                            <div className="space-y-6">
                                {Object.keys(groupedSettings).map(groupKey => (
                                    <div key={groupKey} className="bg-white shadow rounded-lg overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {groupTitles[groupKey] || groupKey}
                                            </h3>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            {groupedSettings[groupKey].map(setting => (
                                                <div key={setting.key}>
                                                    <label htmlFor={setting.key} className="block text-sm font-medium text-gray-700 mb-1">
                                                        {setting.description || setting.key}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name={setting.key}
                                                        id={setting.key}
                                                        defaultValue={setting.value}
                                                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                    >
                                        <i className="fas fa-save mr-2"></i> บันทึกการตั้งค่า
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}
