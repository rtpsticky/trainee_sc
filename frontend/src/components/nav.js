// Menu definition shared by the sidebar and the mobile drawer.
// `roles` limits who sees (and may open) an item; omitted means everyone.
const MANAGERS = ['STAFF', 'ADMIN'];
const SUPERVISORS = ['TEACHER', 'STAFF', 'ADMIN'];

const MAIN_MENU = [
    { href: '/', label: 'หน้าหลัก', icon: 'fa-house' },
    { href: '/calendar', label: 'ปฏิทินฝึกงาน', icon: 'fa-calendar-days' },
    { href: '/supervisions', label: 'นิเทศติดตาม', icon: 'fa-chalkboard-user', roles: SUPERVISORS },
    { href: '/reports', label: 'รายงานสรุปผล', icon: 'fa-chart-column', roles: SUPERVISORS },
];

const SYSTEM_MENU = [
    { href: '/users', label: 'จัดการผู้ใช้งาน', icon: 'fa-users-gear', roles: MANAGERS },
    { href: '/groups', label: 'กลุ่มฝึกงาน', icon: 'fa-people-group', roles: MANAGERS },
    { href: '/locations', label: 'แหล่งฝึกงาน', icon: 'fa-hospital', roles: MANAGERS },
    { href: '/settings', label: 'ตั้งค่าระบบ', icon: 'fa-gear', roles: MANAGERS },
];

export function getNavSections(role) {
    const allowed = (items) => items.filter(item => !item.roles || item.roles.includes(role));
    return [
        { title: 'เมนูหลัก', items: allowed(MAIN_MENU) },
        { title: 'การจัดการระบบ', items: allowed(SYSTEM_MENU) },
    ].filter(section => section.items.length > 0);
}
