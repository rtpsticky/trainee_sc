import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { getNavSections } from './nav';
import { useAuth } from '../lib/auth';

// Common page frame: sidebar, header and the scrolling content area.
export default function AppShell({ title, icon, children }) {
    const { user, settings } = useAuth();
    const sections = getNavSections(user.role);

    useEffect(() => {
        document.title = title ? `${title} | ${settings.SYSTEM_NAME}` : settings.SYSTEM_NAME;
    }, [title, settings.SYSTEM_NAME]);

    return (
        <div className="flex h-screen bg-page print:block print:h-auto">
            <Sidebar sections={sections} systemName={settings.SYSTEM_NAME} />
            <div className="flex-1 flex flex-col overflow-hidden min-w-0 print:overflow-visible">
                <Header title={title} icon={icon} user={user} sections={sections} systemName={settings.SYSTEM_NAME} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto print:overflow-visible">
                    <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 print:p-0">{children}</div>
                </main>
            </div>
        </div>
    );
}
