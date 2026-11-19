// Menu definition shared by the sidebar and the mobile drawer.
// `roles` limits who sees (and may open) an item; omitted means everyone.
const MANAGERS = ['STAFF', 'ADMIN'];
const SUPERVISORS = ['TEACHER', 'STAFF', 'ADMIN'];

const MAIN_MENU = [
    { href: '/', label: 'หน้าหลัก', icon: 'fa-home' },
    { href: '/supervisions', label: 'นิเทศติดตาม', icon: 'fa-chalkboard-teacher', roles: SUPERVISORS },
    { href: '/reports', label: 'รายงาน', icon: 'fa-file-alt', roles: SUPERVISORS },
];

const SYSTEM_MENU = [
    { href: '/users', label: 'จัดการผู้ใช้งาน', icon: 'fa-users-cog', roles: MANAGERS },
    { href: '/groups', label: 'จัดการกลุ่มฝึกงาน', icon: 'fa-users', roles: MANAGERS },
    { href: '/locations', label: 'สถานที่ฝึกงาน', icon: 'fa-building', roles: MANAGERS },
    { href: '/settings', label: 'ตั้งค่าระบบ', icon: 'fa-cog', roles: MANAGERS },
];

export function getNavSections(role) {
    const allowed = (items) => items.filter(item => !item.roles || item.roles.includes(role));
    return [
        { title: 'เมนูหลัก', items: allowed(MAIN_MENU) },
        { title: 'การจัดการระบบ', items: allowed(SYSTEM_MENU) },
    ].filter(section => section.items.length > 0);
}
