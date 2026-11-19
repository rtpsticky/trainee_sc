import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../lib/auth';
import { ROLE_LABELS } from '../lib/format';
import { Brand, NavLinks } from './Sidebar';
import { confirmDialog } from './ui';

export default function Header({ title, user, icon, sections, systemName }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const logout = async () => {
        if (!(await confirmDialog({ title: 'ออกจากระบบ?', html: 'ต้องการออกจากระบบใช่หรือไม่', confirmText: 'ออกจากระบบ' }))) return;
        signOut();
        navigate('/login', { replace: true });
    };

    return (
        <>
            <header className="bg-white border-b border-line px-4 sm:px-6 py-3 flex justify-between items-center gap-3 sticky top-0 z-10 print:hidden">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        type="button"
                        onClick={() => setMenuOpen(true)}
                        className="lg:hidden w-12 h-12 rounded-xl border border-gray-300 text-ink flex items-center justify-center flex-shrink-0"
                        aria-label="เปิดเมนู"
                    >
                        <i className="fas fa-bars text-lg"></i>
                    </button>
                    <h2 className="text-xl font-semibold text-ink truncate flex items-center gap-3">
                        {icon && <i className={`fas ${icon} text-brand-600 hidden sm:inline`}></i>}
                        {title}
                    </h2>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden md:block">
                        <p className="text-base font-medium text-ink leading-tight">{user?.prefix ?? ''}{user?.firstName} {user?.lastName}</p>
                        <p className="text-sm text-muted">{ROLE_LABELS[user?.role] || ''}</p>
                    </div>
                    <span className="w-11 h-11 bg-brand-50 text-brand-600 rounded-full hidden sm:flex items-center justify-center">
                        <i className={`fas ${user?.role === 'STUDENT' ? 'fa-user-graduate' : 'fa-user-tie'} text-lg`}></i>
                    </span>
                    <button type="button" onClick={logout} className="btn btn-secondary btn-sm" title="ออกจากระบบ">
                        <i className="fas fa-right-from-bracket"></i>
                        <span className="hidden sm:inline">ออกจากระบบ</span>
                    </button>
                </div>
            </header>

            {menuOpen && (
                <div className="fixed inset-0 z-40 lg:hidden print:hidden">
                    <div className="fixed inset-0 bg-gray-900/50" onClick={() => setMenuOpen(false)}></div>
                    <div className="relative w-80 max-w-[85%] h-full bg-white shadow-xl flex flex-col">
                        <div className="flex items-start justify-between">
                            <Brand systemName={systemName} />
                            <button type="button" onClick={() => setMenuOpen(false)} className="m-3 w-11 h-11 rounded-xl hover:bg-gray-100" aria-label="ปิดเมนู">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <nav className="p-4 overflow-y-auto flex-1">
                            <NavLinks sections={sections} onNavigate={() => setMenuOpen(false)} />
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}
