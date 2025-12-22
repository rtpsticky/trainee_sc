'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (path) => pathname === path;

    const mainMenuItems = [
        { href: '/', label: 'หน้าหลัก', icon: 'fa-home' },
        { href: '/groups', label: 'การฝึกงาน', icon: 'fa-briefcase' },
        { href: '/supervisions', label: 'นิเทศติดตาม', icon: 'fa-chalkboard-teacher' },
        { href: '/reports', label: 'รายงาน', icon: 'fa-file-alt' },
    ];

    const systemMenuItems = [
        { href: '/users', label: 'จัดการผู้ใช้งาน', icon: 'fa-users-cog' },
        { href: '/groups', label: 'จัดการกลุ่มฝึกงาน', icon: 'fa-users' },
        { href: '/locations', label: 'สถานที่ฝึกงาน', icon: 'fa-building' },
        { href: '/settings', label: 'ตั้งค่าระบบ', icon: 'fa-cog' },
    ];

    const renderLink = (item) => {
        const active = isActive(item.href);
        return (
            <Link
                key={item.label}
                href={item.href}
                className={`block py-2 px-3 rounded-md mb-1 transition-colors ${active ? 'text-blue-700 bg-blue-100 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
            >
                <i className={`fas ${item.icon} mr-2 w-5 text-center ${active ? 'text-blue-600' : ''}`}></i> {item.label}
            </Link>
        );
    };

    return (
        <div className="sidebar w-64 bg-white shadow-md flex-shrink-0 hidden md:block h-screen flex flex-col">
            <div className="p-4 flex items-center border-b">
                <div className="w-10 h-10 mr-2 relative">
                    <Image src="/logo.jpeg" alt="มหาวิทยาลัยราชภัฏพิบูลสงคราม" fill className="object-contain" />
                </div>
                <div>
                    <h1 className="font-bold text-blue-800 text-sm">ระบบติดตามการฝึกงาน</h1>
                    <p className="text-xs text-gray-500">สาขาสาธารณสุขศาสตร์</p>
                </div>
            </div>

            <nav className="p-4 overflow-y-auto flex-1">
                <div className="mb-6">
                    <p className="text-xs uppercase text-gray-500 font-semibold mb-2">เมนูหลัก</p>
                    {mainMenuItems.map(renderLink)}
                </div>

                <div>
                    <p className="text-xs uppercase text-gray-500 font-semibold mb-2">การจัดการระบบ</p>
                    {systemMenuItems.map(renderLink)}
                </div>
            </nav>
        </div>
    );
}
