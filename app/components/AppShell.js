import Sidebar from './Sidebar';
import Header from './Header';
import { getNavSections } from './nav';
import { getSettingsMap } from '../lib/settings';

// Common page frame: sidebar, header and the scrolling content area.
export default async function AppShell({ user, title, icon, children }) {
    const settings = await getSettingsMap();
    const sections = getNavSections(user.role);

    return (
        <div className="flex h-screen bg-gray-100 print:block print:h-auto">
            <Sidebar sections={sections} systemName={settings.SYSTEM_NAME} />
            <div className="flex-1 flex flex-col overflow-hidden min-w-0 print:overflow-visible">
                <Header title={title} icon={icon} user={user} sections={sections} systemName={settings.SYSTEM_NAME} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 print:overflow-visible print:p-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
