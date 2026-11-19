import { useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import thLocale from '@fullcalendar/core/locales/th';
import AppShell from '../components/AppShell';
import { Block, EmptyState, HowTo, html, showInfo } from '../components/ui';
import { useAuth } from '../lib/auth';
import { useApiData } from '../lib/useApi';
import { SUPERVISION_TYPE_LABELS, formatDay, formatDate, formatTime, toDayInputValue } from '../lib/format';
import { LoadState } from './pages';

// Built only from the existing GET endpoints; which ones depends on the role.
const MANAGE_ROLES = ['STAFF', 'ADMIN'];

const GROUP_COLORS = ['#2563eb', '#059669', '#9333ea', '#ea580c', '#0891b2', '#db2777', '#4f46e5', '#65a30d', '#b45309', '#0f766e'];

const SUPERVISION_STATUS = {
    PENDING: { label: 'รอนิเทศ', color: '#d97706' },
    COMPLETED: { label: 'นิเทศแล้ว', color: '#16a34a' },
    CANCELLED: { label: 'ยกเลิก', color: '#9ca3af' },
};

const personName = (p) => `${p.prefix ?? ''}${p.firstName} ${p.lastName}`;

// FullCalendar treats an all-day end date as exclusive, so the range ends the day after.
function dayAfter(value) {
    const d = new Date(value);
    d.setUTCDate(d.getUTCDate() + 1);
    return toDayInputValue(d);
}

export default function CalendarPage() {
    const { user } = useAuth();
    const paths = user.role === 'STUDENT'
        ? { home: '/dashboard' }
        : MANAGE_ROLES.includes(user.role)
            ? { groups: '/groups', supervisions: '/supervisions' }
            : { supervisions: '/supervisions' };
    const { data, error, loading } = useApiData(paths);

    return (
        <AppShell title="ปฏิทินฝึกงาน" icon="fa-calendar-days">
            <HowTo steps={['เลือกเดือนด้วยปุ่ม ‹ ›', 'เลือกมุมมอง "เดือน" หรือ "รายการ"', 'กดที่รายการในปฏิทินเพื่อดูรายละเอียด']} />
            {data ? <CalendarView data={data} role={user.role} /> : <LoadState loading={loading} error={error} />}
        </AppShell>
    );
}

function CalendarView({ data, role }) {
    const calendarRef = useRef(null);
    const [showGroups, setShowGroups] = useState(true);
    const [showSupervisions, setShowSupervisions] = useState(true);

    const groups = useMemo(() => {
        if (data.groups) return data.groups.groups;
        return data.home?.group ? [data.home.group] : [];
    }, [data]);

    const supervisions = useMemo(() => {
        if (data.supervisions) return data.supervisions.supervisions;
        return data.home?.upcoming ?? [];
    }, [data]);

    const groupColor = (index) => GROUP_COLORS[index % GROUP_COLORS.length];

    const events = useMemo(() => {
        const list = [];
        if (showGroups) {
            groups.forEach((g, i) => list.push({
                id: `g-${g.id}`,
                title: `${g.name} · ${g.location.name}`,
                start: toDayInputValue(g.startDate),
                end: dayAfter(g.endDate),
                allDay: true,
                backgroundColor: groupColor(i),
                borderColor: groupColor(i),
                extendedProps: { kind: 'group', item: g },
            }));
        }
        if (showSupervisions) {
            supervisions.forEach(s => {
                const status = SUPERVISION_STATUS[s.status] ?? SUPERVISION_STATUS.PENDING;
                list.push({
                    id: `s-${s.id}`,
                    title: s.student ? `นิเทศ ${s.student.firstName} ${s.student.lastName}` : `นิเทศ (${SUPERVISION_TYPE_LABELS[s.type]})`,
                    start: s.date,
                    backgroundColor: status.color,
                    borderColor: status.color,
                    textColor: '#fff',
                    display: 'block',
                    extendedProps: { kind: 'supervision', item: s },
                });
            });
        }
        return list;
    }, [groups, supervisions, showGroups, showSupervisions]);

    const openEvent = ({ event }) => {
        const { kind, item } = event.extendedProps;
        if (kind === 'group') {
            showInfo({
                icon: 'info',
                title: item.name,
                html: html`<div style="text-align:left;line-height:2">
                    <b>รุ่น:</b> ${item.generation}<br>
                    <b>แหล่งฝึกงาน:</b> ${item.location.name} จ.${item.location.province}<br>
                    <b>ระยะเวลา:</b> ${formatDay(item.startDate)} ถึง ${formatDay(item.endDate)}<br>
                    <b>อาจารย์ที่ปรึกษา:</b> ${item.advisors?.length ? item.advisors.map(personName).join(', ') : 'ยังไม่ระบุ'}
                    ${item._count ? html`<br><b>นักศึกษา:</b> ${item._count.students} / ${item.capacity} คน` : ''}
                </div>`,
            });
        } else {
            const status = SUPERVISION_STATUS[item.status] ?? SUPERVISION_STATUS.PENDING;
            showInfo({
                icon: item.status === 'COMPLETED' ? 'success' : 'info',
                title: 'นัดหมายนิเทศ',
                html: html`<div style="text-align:left;line-height:2">
                    ${item.student ? html`<b>นักศึกษา:</b> ${personName(item.student)}<br>` : ''}
                    <b>วันที่:</b> ${formatDate(item.date)} เวลา ${formatTime(item.date)}<br>
                    <b>รูปแบบ:</b> ${SUPERVISION_TYPE_LABELS[item.type]}<br>
                    <b>สถานที่:</b> ${item.locationName || 'ไม่ระบุ'}<br>
                    ${item.supervisor ? html`<b>ผู้นิเทศ:</b> ${personName(item.supervisor)}<br>` : ''}
                    <b>สถานะ:</b> ${status.label}
                </div>`,
            });
        }
    };

    const goTo = (date) => calendarRef.current?.getApi().gotoDate(toDayInputValue(date));

    const isEmpty = groups.length === 0 && supervisions.length === 0;

    return (
        <div className="grid grid-cols-1 2xl:grid-cols-4 gap-6">
            <Block number={1} title="ตัวเลือกการแสดงผล" className="2xl:col-span-1 self-start">
                <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-1 gap-6">
                <div className="space-y-3">
                    {groups.length > 0 && (
                        <Toggle checked={showGroups} onChange={setShowGroups} color="#2563eb" label="ช่วงเวลาฝึกงานของกลุ่ม" />
                    )}
                    <Toggle checked={showSupervisions} onChange={setShowSupervisions} color="#d97706" label="วันนัดนิเทศ" />
                </div>

                <div>
                <p className="text-base font-semibold text-ink mb-2">สีของการนิเทศ</p>
                <ul className="space-y-2">
                    {Object.values(SUPERVISION_STATUS).map(s => (
                        <li key={s.label} className="flex items-center gap-3 text-base text-ink">
                            <span className="w-5 h-5 rounded-md flex-shrink-0" style={{ background: s.color }}></span>{s.label}
                        </li>
                    ))}
                </ul>
                </div>

                {groups.length > 0 && (
                    <div>
                        <p className="text-base font-semibold text-ink mb-2">กลุ่มฝึกงาน (กดเพื่อไปยังวันเริ่ม)</p>
                        <ul className="space-y-1 max-h-60 2xl:max-h-80 overflow-y-auto -mx-2">
                            {groups.map((g, i) => (
                                <li key={g.id}>
                                    <button type="button" onClick={() => goTo(g.startDate)} className="w-full text-left flex items-start gap-3 rounded-xl px-2 py-2 hover:bg-gray-50">
                                        <span className="w-5 h-5 mt-1 rounded-md flex-shrink-0" style={{ background: groupColor(i) }}></span>
                                        <span className="min-w-0">
                                            <span className="block text-base font-medium text-ink truncate">{g.name}</span>
                                            <span className="block text-sm text-muted">{formatDay(g.startDate)} – {formatDay(g.endDate)}</span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                </div>
            </Block>

            <Block number={2} title="ปฏิทิน" className="2xl:col-span-3">
                {isEmpty && (
                    <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200">
                        <EmptyState icon="fa-calendar-xmark" title="ยังไม่มีข้อมูลในปฏิทิน">
                            {role === 'STUDENT' ? 'เมื่อได้รับการจัดกลุ่มหรือมีนัดนิเทศ จะแสดงที่นี่' : 'สร้างกลุ่มฝึกงานหรือนัดหมายนิเทศ แล้วข้อมูลจะแสดงที่นี่'}
                        </EmptyState>
                    </div>
                )}
                <div className="calendar-wrap">
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, listPlugin]}
                        locale={thLocale}
                        initialView="dayGridMonth"
                        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,listMonth' }}
                        buttonText={{ today: 'วันนี้', month: 'เดือน', list: 'รายการ' }}
                        events={events}
                        eventClick={openEvent}
                        eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                        dayMaxEvents={3}
                        moreLinkText={(n) => `+ อีก ${n} รายการ`}
                        noEventsText="ไม่มีรายการในเดือนนี้"
                        height="auto"
                        fixedWeekCount={false}
                    />
                </div>
            </Block>
        </div>
    );
}

function Toggle({ checked, onChange, label, color }) {
    return (
        <label className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 cursor-pointer hover:bg-gray-50">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-6 h-6 accent-blue-700 flex-shrink-0" />
            <span className="w-4 h-4 rounded flex-shrink-0" style={{ background: color }}></span>
            <span className="text-base text-ink">{label}</span>
        </label>
    );
}
