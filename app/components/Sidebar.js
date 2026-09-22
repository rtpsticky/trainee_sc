'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function NavLinks({ sections, onNavigate }) {
    const pathname = usePathname();

    return sections.map((section, index) => (
        <div key={section.title} className={index === 0 ? 'mb-6' : ''}>
            <p className="text-xs uppercase text-gray-500 font-semibold mb-2">{section.title}</p>
            {section.items.map(item => {
                const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={`block py-2 px-3 rounded-md mb-1 transition-colors ${active ? 'text-blue-700 bg-blue-100 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <i className={`fas ${item.icon} mr-2 w-5 text-center ${active ? 'text-blue-600' : ''}`}></i> {item.label}
                    </Link>
                );
            })}
        </div>
    ));
}

export function Brand({ systemName }) {
    return (
        <div className="p-4 flex items-center border-b">
            <div className="w-10 h-10 mr-2 relative flex-shrink-0">
                <Image src="/main-logo.png" alt="มหาวิทยาลัยราชภัฏพิบูลสงคราม" fill sizes="40px" className="object-contain" />
            </div>
            <div className="min-w-0">
                <h1 className="font-bold text-blue-800 text-sm truncate">{systemName}</h1>
                <p className="text-xs text-gray-500">สาขาสาธารณสุขศาสตร์</p>
            </div>
        </div>
    );
}

export default function Sidebar({ sections, systemName }) {
    return (
        <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:flex flex-col h-screen print:hidden">
            <Brand systemName={systemName} />
            <nav className="p-4 overflow-y-auto flex-1">
                <NavLinks sections={sections} />
            </nav>
        </aside>
    );
}
