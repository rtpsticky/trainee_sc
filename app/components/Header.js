'use client';

import { useState } from 'react';
import { logout } from '../actions/auth';
import { ROLE_LABELS } from '../lib/format';
import { Brand, NavLinks } from './Sidebar';

export default function Header({ title, user, icon, sections, systemName }) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10 sticky top-0 print:hidden">
                <div className="flex items-center min-w-0">
                    <button
                        type="button"
                        onClick={() => setMenuOpen(true)}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none mr-4 md:hidden"
                        aria-label="เปิดเมนู"
                    >
                        <i className="fas fa-bars text-lg"></i>
                    </button>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
                        {icon && <i className={`fas ${icon} mr-2 text-blue-600 hidden md:inline`}></i>}
                        {title}
                    </h2>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">
                            {ROLE_LABELS[user?.role] || ''} {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">ฝ่ายฝึกประสบการณ์วิชาชีพ</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className={`fas ${user?.role === 'STUDENT' ? 'fa-user-graduate' : 'fa-user-tie'} text-blue-600`}></i>
                    </div>
                    <form action={logout}>
                        <button
                            type="submit"
                            className="px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="ออกจากระบบ"
                        >
                            <i className="fas fa-sign-out-alt sm:mr-2"></i>
                            <span className="hidden sm:inline">ออกจากระบบ</span>
                        </button>
                    </form>
                </div>
            </header>

            {menuOpen && (
                <div className="fixed inset-0 z-40 md:hidden print:hidden">
                    <div className="fixed inset-0 bg-gray-900/50" onClick={() => setMenuOpen(false)}></div>
                    <div className="relative w-64 max-w-[80%] h-full bg-white shadow-xl flex flex-col">
                        <Brand systemName={systemName} />
                        <nav className="p-4 overflow-y-auto flex-1">
                            <NavLinks sections={sections} onNavigate={() => setMenuOpen(false)} />
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}
