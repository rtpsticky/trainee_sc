import { Link, useLocation } from 'react-router';

export function NavLinks({ sections, onNavigate }) {
    const { pathname } = useLocation();

    return sections.map(section => (
        <div key={section.title} className="mb-6 last:mb-0">
            <p className="px-3 mb-2 text-sm font-semibold text-muted">{section.title}</p>
            {section.items.map(item => {
                const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                    <Link
                        key={item.href}
                        to={item.href}
                        onClick={onNavigate}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center gap-3 rounded-xl px-3 py-3 mb-1 text-[1.05rem] transition-colors ${active ? 'bg-brand-600 text-white font-medium shadow-sm' : 'text-ink hover:bg-gray-100'}`}
                    >
                        <span className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-white/15' : 'bg-gray-100 text-brand-700'}`}>
                            <i className={`fas ${item.icon}`}></i>
                        </span>
                        {item.label}
                    </Link>
                );
            })}
        </div>
    ));
}

export function Brand({ systemName }) {
    return (
        <Link to="/" className="px-5 py-5 flex items-center gap-3 border-b border-line">
            <img src="/main-logo.png" alt="มหาวิทยาลัยราชภัฏพิบูลสงคราม" className="w-12 h-12 object-contain flex-shrink-0" />
            <div className="min-w-0">
                <p className="font-semibold text-brand-800 leading-snug line-clamp-2">{systemName}</p>
                <p className="text-sm text-muted">สาขาวิชาสาธารณสุขศาสตร์</p>
            </div>
        </Link>
    );
}

export default function Sidebar({ sections, systemName }) {
    return (
        <aside className="w-72 bg-white border-r border-line flex-shrink-0 hidden lg:flex flex-col h-screen print:hidden">
            <Brand systemName={systemName} />
            <nav className="p-4 overflow-y-auto flex-1" aria-label="เมนูหลัก">
                <NavLinks sections={sections} />
            </nav>
            <p className="px-5 py-4 border-t border-line text-sm text-muted">มหาวิทยาลัยราชภัฏพิบูลสงคราม</p>
        </aside>
    );
}
