import { useMemo, useState } from 'react';
import { createSupervision, updateSupervision, deleteSupervision } from '../lib/api';
import Modal from '../components/Modal';
import {
    Badge, Block, EmptyState, ErrorAlert, Field, FilterTabs, FormActions, FormSection, HowTo, PageHeader, SearchBox, Select, StatCard,
    confirmAndRun, html, inputClass, primaryButton, secondaryButton, useServerAction,
} from '../components/ui';
import { SUPERVISION_TYPE_LABELS, formatDate, formatTime, toDateTimeInputValues } from '../lib/format';

const STATUS_STYLES = {
    PENDING: { label: 'รอนิเทศ', tone: 'yellow', icon: 'fa-hourglass-half' },
    COMPLETED: { label: 'นิเทศแล้ว', tone: 'green', icon: 'fa-circle-check' },
    CANCELLED: { label: 'ยกเลิก', tone: 'gray', icon: 'fa-ban' },
};

const TYPE_STYLES = {
    ONSITE: { tone: 'blue', icon: 'fa-user-tie' },
    ONLINE: { tone: 'purple', icon: 'fa-video' },
    PHONE: { tone: 'teal', icon: 'fa-phone' },
};

const RESULT_LABELS = { EXCELLENT: 'ดีเยี่ยม', GOOD: 'ดี', FAIR: 'พอใช้', IMPROVE: 'ต้องปรับปรุง' };

const TYPE_OPTIONS = Object.entries(SUPERVISION_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const STATUS_OPTIONS = Object.entries(STATUS_STYLES).map(([value, s]) => ({ value, label: s.label }));
const RESULT_OPTIONS = Object.entries(RESULT_LABELS).map(([value, label]) => ({ value, label }));
const SORT_OPTIONS = [
    { value: 'DATE_DESC', label: 'วันที่ล่าสุดก่อน' },
    { value: 'DATE_ASC', label: 'วันที่เก่าสุดก่อน' },
    { value: 'NAME', label: 'ชื่อนักศึกษา (ก-ฮ)' },
];

const personName = (s) => `${s.prefix ?? ''}${s.firstName} ${s.lastName}`;

export default function SupervisionList({ supervisions, students, initialStatus }) {
    // modal: null | { type: 'create' } | { type: 'detail', id }
    const [modal, setModal] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialStatus);
    const [sortOrder, setSortOrder] = useState('DATE_DESC');
    const closeModal = () => setModal(null);

    const count = (status) => supervisions.filter(s => s.status === status).length;

    const filtered = useMemo(() => {
        const term = searchText.trim().toLowerCase();
        const result = supervisions.filter(s =>
            (statusFilter === 'ALL' || s.status === statusFilter) &&
            (!term ||
                `${s.student.firstName} ${s.student.lastName}`.toLowerCase().includes(term) ||
                (s.student.studentId ?? '').toLowerCase().includes(term) ||
                (s.locationName ?? '').toLowerCase().includes(term))
        );
        result.sort((a, b) => {
            if (sortOrder === 'DATE_ASC') return new Date(a.date) - new Date(b.date);
            if (sortOrder === 'NAME') return a.student.firstName.localeCompare(b.student.firstName, 'th');
            return new Date(b.date) - new Date(a.date);
        });
        return result;
    }, [supervisions, searchText, statusFilter, sortOrder]);

    const current = modal?.type === 'detail' ? supervisions.find(s => s.id === modal.id) : null;

    return (
        <>
            <PageHeader icon="fa-chalkboard-user" title="นิเทศติดตาม" description="นัดหมายการนิเทศ บันทึกผลการประเมิน และติดตามนักศึกษา">
                <button onClick={() => setModal({ type: 'create' })} className={`${primaryButton} text-lg`}>
                    <i className="fas fa-calendar-plus"></i> นัดหมายนิเทศ
                </button>
            </PageHeader>

            <HowTo steps={['กด "นัดหมายนิเทศ" เลือกนักศึกษาและวันเวลา', 'หลังนิเทศเสร็จ กด "บันทึกผล" ที่รายการ', 'เลือกสถานะ "นิเทศแล้ว" และผลการประเมิน']} />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title="ทั้งหมด" value={supervisions.length} suffix="ครั้ง" icon="fa-calendar-check" color="blue" />
                <StatCard title="รอนิเทศ" value={count('PENDING')} suffix="ครั้ง" icon="fa-hourglass-half" color="yellow" />
                <StatCard title="นิเทศแล้ว" value={count('COMPLETED')} suffix="ครั้ง" icon="fa-circle-check" color="green" />
                <StatCard title="ยกเลิก" value={count('CANCELLED')} suffix="ครั้ง" icon="fa-ban" color="red" />
            </div>

            <Block number={1} title="เลือกสถานะและค้นหา" className="mb-6">
                <div className="space-y-4">
                    <FilterTabs
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                            { value: 'ALL', label: 'ทั้งหมด', icon: 'fa-list', count: supervisions.length },
                            ...Object.entries(STATUS_STYLES).map(([value, s]) => ({ value, label: s.label, icon: s.icon, count: count(value) })),
                        ]}
                    />
                    <div className="flex flex-col md:flex-row gap-4">
                        <SearchBox value={searchText} onChange={setSearchText} placeholder="ค้นหานักศึกษา, รหัส, สถานที่..." />
                        <div className="md:w-64">
                            <Select options={SORT_OPTIONS} value={sortOrder} onChange={setSortOrder} isSearchable={false} aria-label="เรียงลำดับ" />
                        </div>
                    </div>
                </div>
            </Block>

            <Block number={2} title={`รายการนิเทศ (${filtered.length} รายการ)`} bodyClassName="">
                {filtered.length === 0 ? (
                    <EmptyState icon="fa-calendar-xmark" title="ไม่พบรายการนิเทศ">
                        {supervisions.length === 0 ? 'กดปุ่ม "นัดหมายนิเทศ" ด้านบนเพื่อเริ่มต้น' : 'ลองเปลี่ยนสถานะหรือคำค้นหา'}
                    </EmptyState>
                ) : (
                    <ul className="divide-y divide-line">
                        {filtered.map(s => {
                            const status = STATUS_STYLES[s.status] ?? STATUS_STYLES.PENDING;
                            const type = TYPE_STYLES[s.type] ?? TYPE_STYLES.ONSITE;
                            return (
                                <li key={s.id} className="px-5 sm:px-6 py-5 flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="w-20 rounded-xl bg-brand-50 text-brand-700 text-center py-2 flex-shrink-0">
                                        <p className="text-2xl font-semibold leading-none">{new Date(s.date).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric' })}</p>
                                        <p className="text-sm">{new Date(s.date).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', month: 'short', year: '2-digit' })}</p>
                                        <p className="text-sm font-medium">{formatTime(s.date).replace(' น.', '')}</p>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-lg font-semibold text-ink">{personName(s.student)}</p>
                                        <p className="text-base text-muted">
                                            {s.student.trainingGroup?.name ?? 'ยังไม่มีกลุ่ม'}
                                            <span className="mx-1.5">·</span><i className="fas fa-location-dot mr-1"></i>{s.locationName || 'ไม่ระบุสถานที่'}
                                        </p>
                                        <p className="text-base text-muted">ผู้นิเทศ: {personName(s.supervisor)}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <Badge tone={status.tone} icon={status.icon}>{status.label}</Badge>
                                            <Badge tone={type.tone} icon={type.icon}>{SUPERVISION_TYPE_LABELS[s.type]}</Badge>
                                            {s.status === 'COMPLETED' && s.result && <Badge tone="green" icon="fa-star">ผล: {RESULT_LABELS[s.result]}</Badge>}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setModal({ type: 'detail', id: s.id })}
                                        className={`btn btn-sm md:flex-shrink-0 ${s.status === 'PENDING' ? 'btn-primary' : 'btn-soft'}`}
                                    >
                                        <i className={`fas ${s.status === 'PENDING' ? 'fa-pen-to-square' : 'fa-eye'}`}></i>
                                        {s.status === 'PENDING' ? 'บันทึกผล / แก้ไข' : 'ดูรายละเอียด'}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </Block>

            {modal?.type === 'create' && <CreateModal students={students} onClose={closeModal} />}
            {current && <DetailModal key={current.id} supervision={current} onClose={closeModal} />}
        </>
    );
}

function CreateModal({ students, onClose }) {
    const { run, isPending, error } = useServerAction();
    const [locationName, setLocationName] = useState('');
    const [touchedLocation, setTouchedLocation] = useState(false);

    const studentOptions = students.map(s => ({
        value: s.id,
        label: `${personName(s)}${s.studentId ? ` (${s.studentId})` : ''}${s.trainingGroup ? ` · ${s.trainingGroup.name}` : ''}`,
    }));

    // Picking a student pre-fills the meeting place with their training site.
    const handleStudentChange = (id) => {
        const student = students.find(s => String(s.id) === String(id));
        if (!touchedLocation) setLocationName(student?.trainingGroup?.location?.name ?? '');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        run(() => createSupervision(formData), onClose, 'นัดหมายนิเทศเรียบร้อยแล้ว');
    };

    return (
        <Modal title="นัดหมายนิเทศใหม่" subtitle="กรอกข้อมูลตามลำดับ ช่องที่มี * ต้องกรอก" icon="fa-calendar-plus" onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div className="p-5 sm:p-6 space-y-5">
                    <ErrorAlert>{error}</ErrorAlert>
                    <FormSection number={1} title="เลือกนักศึกษา">
                        <Field label="นักศึกษา" required hint={students.length === 0 ? 'ยังไม่มีนักศึกษาในระบบ กรุณาเพิ่มที่เมนูจัดการผู้ใช้งานก่อน' : 'พิมพ์ชื่อหรือรหัสเพื่อค้นหา'}>
                            <Select name="studentId" required options={studentOptions} onChange={handleStudentChange} placeholder="-- ค้นหาและเลือกนักศึกษา --" />
                        </Field>
                    </FormSection>
                    <FormSection number={2} title="วัน เวลา และรูปแบบ">
                        <ScheduleFields />
                    </FormSection>
                    <FormSection number={3} title="สถานที่และหมายเหตุ">
                        <Field label="สถานที่นัดหมาย" hint="เติมให้อัตโนมัติจากแหล่งฝึกของนักศึกษา แก้ไขได้">
                            <input
                                type="text" name="locationName" value={locationName} placeholder="เช่น โรงพยาบาล..."
                                onChange={(e) => { setLocationName(e.target.value); setTouchedLocation(true); }}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="หมายเหตุ / เอกสารที่ต้องเตรียม">
                            <textarea name="note" rows="3" className={inputClass} placeholder="รายละเอียดเพิ่มเติม..."></textarea>
                        </Field>
                    </FormSection>
                </div>
                <FormActions isPending={isPending} submitLabel="บันทึกนัดหมาย" onCancel={onClose} />
            </form>
        </Modal>
    );
}

function ScheduleFields({ defaults }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="วันที่นิเทศ" required>
                <input type="date" name="date" required defaultValue={defaults?.date} className={inputClass} />
            </Field>
            <Field label="เวลา" required>
                <input type="time" name="time" required defaultValue={defaults?.time} className={inputClass} />
            </Field>
            <Field label="รูปแบบ" required>
                <Select name="type" required options={TYPE_OPTIONS} defaultValue={defaults?.type ?? 'ONSITE'} isSearchable={false} />
            </Field>
        </div>
    );
}

function DetailModal({ supervision, onClose }) {
    const { run, isPending, error } = useServerAction();
    const [status, setStatus] = useState(supervision.status);
    const schedule = { ...toDateTimeInputValues(supervision.date), type: supervision.type };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        run(() => updateSupervision(formData), onClose);
    };

    const handleDelete = async () => {
        if (await confirmAndRun({
            title: 'ลบการนิเทศ?',
            html: html`ลบการนิเทศของ <b>${personName(supervision.student)}</b><br>วันที่ ${formatDate(supervision.date)} ใช่หรือไม่?`,
            confirmText: 'ลบการนิเทศ',
            successText: 'ลบการนิเทศเรียบร้อยแล้ว',
            action: () => deleteSupervision(supervision.id),
        })) onClose();
    };

    return (
        <Modal title="รายละเอียดการนิเทศ" subtitle={`${personName(supervision.student)} · ${formatDate(supervision.date)}`} icon="fa-chalkboard-user" onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <input type="hidden" name="id" value={supervision.id} />
                <div className="p-5 sm:p-6 space-y-5">
                    <ErrorAlert>{error}</ErrorAlert>

                    <div className="rounded-2xl bg-brand-50 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted">นักศึกษา</p>
                            <p className="text-lg font-medium text-ink">{personName(supervision.student)}</p>
                            <p className="text-base text-muted">{supervision.student.trainingGroup?.name ?? 'ยังไม่มีกลุ่ม'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted">ผู้นิเทศ</p>
                            <p className="text-lg font-medium text-ink">{personName(supervision.supervisor)}</p>
                        </div>
                    </div>

                    <FormSection number={1} title="นัดหมาย">
                        <ScheduleFields defaults={schedule} />
                        <Field label="สถานที่นัดหมาย">
                            <input type="text" name="locationName" defaultValue={supervision.locationName ?? ''} className={inputClass} />
                        </Field>
                        <Field label="หมายเหตุ / เอกสารที่ต้องเตรียม">
                            <textarea name="note" rows="2" defaultValue={supervision.note ?? ''} className={inputClass}></textarea>
                        </Field>
                    </FormSection>

                    <FormSection number={2} title="บันทึกผลการนิเทศ">
                        <Field label="สถานะ" hint='เลือก "นิเทศแล้ว" เมื่อนิเทศเสร็จ เพื่อบันทึกผลการประเมิน'>
                            <Select name="status" options={STATUS_OPTIONS} value={status} onChange={setStatus} isSearchable={false} />
                        </Field>
                        {status === 'COMPLETED' && (
                            <Field label="ผลการประเมิน" required>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {RESULT_OPTIONS.map(r => (
                                        <label key={r.value} className="cursor-pointer">
                                            <input type="radio" name="result" value={r.value} required defaultChecked={supervision.result === r.value} className="peer sr-only" />
                                            <span className="block text-center rounded-xl border-2 border-gray-300 px-3 py-3 text-base font-medium text-ink peer-checked:border-green-600 peer-checked:bg-green-50 peer-checked:text-green-800 peer-focus-visible:ring-4 peer-focus-visible:ring-green-100">
                                                {r.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </Field>
                        )}
                        <Field label="ความคิดเห็น / ข้อเสนอแนะ">
                            <textarea name="comment" rows="3" defaultValue={supervision.comment ?? ''} className={inputClass}></textarea>
                        </Field>
                    </FormSection>
                </div>
                <div className="px-5 sm:px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-between gap-3 border-t border-line bg-gray-50">
                    <button type="button" onClick={handleDelete} className="btn btn-soft-danger">
                        <i className="fas fa-trash"></i> ลบการนิเทศนี้
                    </button>
                    <div className="flex flex-col-reverse sm:flex-row gap-3">
                        <button type="button" onClick={onClose} className={secondaryButton}>ปิด</button>
                        <button type="submit" disabled={isPending} className={primaryButton}>
                            {isPending ? <><i className="fas fa-spinner fa-spin"></i> กำลังบันทึก...</> : <><i className="fas fa-save"></i> บันทึก</>}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
