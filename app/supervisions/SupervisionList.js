'use client';

import { useMemo, useState } from 'react';
import { createSupervision, updateSupervision, deleteSupervision } from '../actions/supervisions';
import Modal from '../components/Modal';
import {
    ConfirmDelete, ErrorAlert, FormActions, SearchBox, StatCard,
    inputClass, labelClass, primaryButton, secondaryButton, useServerAction,
} from '../components/ui';
import { SUPERVISION_TYPE_LABELS, formatDate, formatTime, toDateTimeInputValues } from '../lib/format';

const STATUS_STYLES = {
    PENDING: { label: 'รอดำเนินการ', className: 'bg-yellow-100 text-yellow-800' },
    COMPLETED: { label: 'เสร็จสิ้น', className: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'ยกเลิก', className: 'bg-red-100 text-red-800' },
};

const TYPE_STYLES = {
    ONSITE: { className: 'bg-blue-100 text-blue-800', icon: 'fa-user-tie' },
    ONLINE: { className: 'bg-purple-100 text-purple-800', icon: 'fa-video' },
    PHONE: { className: 'bg-gray-100 text-gray-800', icon: 'fa-phone' },
};

const RESULT_LABELS = { EXCELLENT: 'ดีเยี่ยม', GOOD: 'ดี', FAIR: 'พอใช้', IMPROVE: 'ต้องปรับปรุง' };

const studentName = (s) => `${s.prefix ?? ''}${s.firstName} ${s.lastName}`;

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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard title="การนิเทศทั้งหมด" value={supervisions.length} icon="fa-calendar-check" color="blue" />
                <StatCard title="รอดำเนินการ" value={count('PENDING')} icon="fa-clock" color="yellow" />
                <StatCard title="เสร็จสิ้นแล้ว" value={count('COMPLETED')} icon="fa-check-circle" color="green" />
                <StatCard title="ยกเลิก" value={count('CANCELLED')} icon="fa-times-circle" color="red" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="p-4 border-b flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                    <button onClick={() => setModal({ type: 'create' })} className={primaryButton}>
                        <i className="fas fa-plus mr-2"></i> เพิ่มการนิเทศใหม่
                    </button>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={inputClass}>
                            <option value="DATE_DESC">เรียงตามวันที่ (ล่าสุดก่อน)</option>
                            <option value="DATE_ASC">เรียงตามวันที่ (เก่าสุดก่อน)</option>
                            <option value="NAME">เรียงตามชื่อนักศึกษา</option>
                        </select>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
                            <option value="ALL">แสดงทั้งหมด</option>
                            <option value="PENDING">เฉพาะรอดำเนินการ</option>
                            <option value="COMPLETED">เฉพาะเสร็จสิ้น</option>
                            <option value="CANCELLED">เฉพาะที่ยกเลิก</option>
                        </select>
                        <SearchBox value={searchText} onChange={setSearchText} placeholder="ค้นหานักศึกษา, สถานที่..." />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['วันที่นิเทศ', 'นักศึกษา', 'สถานที่', 'รูปแบบ', 'ผู้นิเทศ', 'สถานะ'].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filtered.map(s => (
                                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{formatDate(s.date)}</div>
                                        <div className="text-sm text-gray-500">{formatTime(s.date)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <i className="fas fa-user-graduate text-blue-600"></i>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{studentName(s.student)}</div>
                                                <div className="text-sm text-gray-500">{s.student.trainingGroup?.name ?? 'ยังไม่มีกลุ่ม'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{s.locationName || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><TypeBadge type={s.type} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{studentName(s.supervisor)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={s.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button onClick={() => setModal({ type: 'detail', id: s.id })} className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-full w-8 h-8 inline-flex items-center justify-center transition-colors" title={s.status === 'PENDING' ? 'แก้ไข / บันทึกผล' : 'ดูรายละเอียด'}>
                                            <i className={`fas ${s.status === 'PENDING' ? 'fa-edit' : 'fa-eye'}`}></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-500">ไม่พบข้อมูลการนิเทศ</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal?.type === 'create' && <CreateModal students={students} onClose={closeModal} />}
            {current && <DetailModal key={current.id} supervision={current} onClose={closeModal} />}
        </>
    );
}

function CreateModal({ students, onClose }) {
    const { run, isPending, error } = useServerAction();
    const [locationName, setLocationName] = useState('');
    const [touchedLocation, setTouchedLocation] = useState(false);

    // Picking a student pre-fills the meeting place with their training site.
    const handleStudentChange = (e) => {
        const student = students.find(s => String(s.id) === e.target.value);
        if (!touchedLocation) setLocationName(student?.trainingGroup?.location?.name ?? '');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        run(() => createSupervision(formData), onClose);
    };

    return (
        <Modal title="เพิ่มการนิเทศใหม่" icon="fa-plus" onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div className="px-6 pb-6 space-y-4">
                    <ErrorAlert>{error}</ErrorAlert>
                    <div>
                        <label className={labelClass}>นักศึกษา <span className="text-red-500">*</span></label>
                        <select name="studentId" required onChange={handleStudentChange} className={inputClass}>
                            <option value="">เลือกนักศึกษา</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id}>
                                    {studentName(s)}{s.studentId ? ` (${s.studentId})` : ''}{s.trainingGroup ? ` - ${s.trainingGroup.name}` : ''}
                                </option>
                            ))}
                        </select>
                        {students.length === 0 && <p className="text-xs text-red-500 mt-1">ยังไม่มีนักศึกษาในระบบ กรุณาเพิ่มนักศึกษาที่เมนูจัดการผู้ใช้งานก่อน</p>}
                    </div>
                    <ScheduleFields />
                    <div>
                        <label className={labelClass}>สถานที่นัดหมาย</label>
                        <input
                            type="text" name="locationName" value={locationName} placeholder="เช่น โรงพยาบาล..."
                            onChange={(e) => { setLocationName(e.target.value); setTouchedLocation(true); }}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>หมายเหตุ / เตรียมเอกสาร</label>
                        <textarea name="note" rows="3" className={inputClass} placeholder="รายละเอียดเพิ่มเติม..."></textarea>
                    </div>
                </div>
                <FormActions isPending={isPending} submitLabel="บันทึกข้อมูล" onCancel={onClose} />
            </form>
        </Modal>
    );
}

function ScheduleFields({ defaults }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
                <label className={labelClass}>วันที่นิเทศ <span className="text-red-500">*</span></label>
                <input type="date" name="date" required defaultValue={defaults?.date} className={inputClass} />
            </div>
            <div>
                <label className={labelClass}>เวลานิเทศ <span className="text-red-500">*</span></label>
                <input type="time" name="time" required defaultValue={defaults?.time} className={inputClass} />
            </div>
            <div>
                <label className={labelClass}>รูปแบบ <span className="text-red-500">*</span></label>
                <select name="type" required defaultValue={defaults?.type ?? 'ONSITE'} className={inputClass}>
                    {Object.entries(SUPERVISION_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
            </div>
        </div>
    );
}

function DetailModal({ supervision, onClose }) {
    const { run, isPending, error } = useServerAction();
    const [status, setStatus] = useState(supervision.status);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const schedule = { ...toDateTimeInputValues(supervision.date), type: supervision.type };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        run(() => updateSupervision(formData), onClose);
    };

    if (confirmingDelete) {
        return (
            <ConfirmDelete
                title="ยืนยันการลบข้อมูลการนิเทศ"
                action={() => deleteSupervision(supervision.id)}
                onDone={onClose}
                onClose={() => setConfirmingDelete(false)}
            >
                คุณต้องการลบการนิเทศของ <b>{studentName(supervision.student)}</b> ใช่หรือไม่?
            </ConfirmDelete>
        );
    }

    return (
        <Modal title="รายละเอียดการนิเทศ" icon="fa-chalkboard-teacher" onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <input type="hidden" name="id" value={supervision.id} />
                <div className="px-6 pb-6 space-y-4">
                    <ErrorAlert>{error}</ErrorAlert>

                    <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 font-semibold">นักศึกษา</p>
                            <p className="font-medium text-gray-900">{studentName(supervision.student)}</p>
                            <p className="text-sm text-gray-500">{supervision.student.trainingGroup?.name ?? 'ยังไม่มีกลุ่ม'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-semibold">ผู้นิเทศ</p>
                            <p className="font-medium text-gray-900">{studentName(supervision.supervisor)}</p>
                            {supervision.status === 'COMPLETED' && supervision.result && (
                                <p className="text-sm text-green-600">ผลประเมิน: {RESULT_LABELS[supervision.result]}</p>
                            )}
                        </div>
                    </div>

                    <ScheduleFields defaults={schedule} />
                    <div>
                        <label className={labelClass}>สถานที่นัดหมาย</label>
                        <input type="text" name="locationName" defaultValue={supervision.locationName ?? ''} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>หมายเหตุ / เตรียมเอกสาร</label>
                        <textarea name="note" rows="2" defaultValue={supervision.note ?? ''} className={inputClass}></textarea>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <label className={labelClass}>สถานะการนิเทศ</label>
                        <select name="status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                            {Object.entries(STATUS_STYLES).map(([value, s]) => <option key={value} value={value}>{s.label}</option>)}
                        </select>
                    </div>

                    {status === 'COMPLETED' && (
                        <div className="space-y-4 bg-green-50/50 border border-green-100 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900">บันทึกผลการนิเทศ</h4>
                            <div>
                                <label className={labelClass}>ผลการประเมิน <span className="text-red-500">*</span></label>
                                <select name="result" required defaultValue={supervision.result ?? ''} className={inputClass}>
                                    <option value="">เลือกผลการประเมิน...</option>
                                    {Object.entries(RESULT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                    <div>
                        <label className={labelClass}>ความคิดเห็น / ข้อเสนอแนะ</label>
                        <textarea name="comment" rows="3" defaultValue={supervision.comment ?? ''} className={inputClass}></textarea>
                    </div>
                </div>
                <div className="px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-between gap-3 border-t border-gray-100 bg-gray-50">
                    <button type="button" onClick={() => setConfirmingDelete(true)} className="text-sm text-red-600 hover:text-red-800 px-2 py-2">
                        <i className="fas fa-trash-alt mr-2"></i>ลบการนิเทศนี้
                    </button>
                    <div className="flex flex-col-reverse sm:flex-row gap-3">
                        <button type="button" onClick={onClose} className={secondaryButton}>ปิด</button>
                        <button type="submit" disabled={isPending} className={primaryButton}>
                            {isPending ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}

function StatusBadge({ status }) {
    const s = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${s.className}`}>{s.label}</span>;
}

function TypeBadge({ type }) {
    const t = TYPE_STYLES[type] ?? TYPE_STYLES.ONSITE;
    return (
        <span className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${t.className}`}>
            <i className={`fas ${t.icon} mr-1`}></i> {SUPERVISION_TYPE_LABELS[type]}
        </span>
    );
}
