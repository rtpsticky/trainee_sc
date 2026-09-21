'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
    createGroup, updateGroup, deleteGroup, addStudentsToGroup, removeStudentFromGroup,
} from '../actions/groups';
import Modal from '../components/Modal';
import {
    ConfirmDelete, ErrorAlert, FormActions, SearchBox, StatCard,
    inputClass, labelClass, primaryButton, secondaryButton, useServerAction,
} from '../components/ui';
import { formatDay, toDayInputValue } from '../lib/format';

const personName = (p) => `${p.prefix ?? ''}${p.firstName} ${p.lastName}`;

export default function GroupList({ groups, locations, teachers, students }) {
    // modal: null | { type: 'add' } | { type: 'edit' | 'delete' | 'members', groupId }
    const [modal, setModal] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const closeModal = () => setModal(null);

    const filtered = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return groups.filter(g => {
            if (statusFilter === 'OPEN' && !g.isActive) return false;
            if (statusFilter === 'CLOSED' && g.isActive) return false;
            if (!term) return true;
            return [g.name, g.generation, g.location.name].some(v => v.toLowerCase().includes(term));
        });
    }, [groups, searchTerm, statusFilter]);

    const enrolledTotal = groups.reduce((sum, g) => sum + g._count.students, 0);
    const unassignedTotal = students.filter(s => !s.trainingGroupId).length;
    const modalGroup = modal?.groupId ? groups.find(g => g.id === modal.groupId) : null;

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard title="กลุ่มฝึกงานทั้งหมด" value={groups.length} icon="fa-layer-group" color="blue" />
                <StatCard title="นักศึกษาที่จัดกลุ่มแล้ว" value={enrolledTotal} icon="fa-user-graduate" color="green" />
                <StatCard title="นักศึกษาที่ยังไม่มีกลุ่ม" value={unassignedTotal} icon="fa-user-clock" color="yellow" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">รายการกลุ่มฝึกงาน</h2>
                        <p className="text-sm text-gray-500">จัดการกลุ่ม อาจารย์ที่ปรึกษา และนักศึกษาในกลุ่ม</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="ค้นหาชื่อกลุ่ม, รุ่น, สถานที่..." />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${inputClass} sm:w-40`}>
                            <option value="ALL">ทุกสถานะ</option>
                            <option value="OPEN">เปิดรับ</option>
                            <option value="CLOSED">ปิดรับ</option>
                        </select>
                        <button onClick={() => setModal({ type: 'add' })} className={primaryButton}>
                            <i className="fas fa-plus mr-2"></i> สร้างกลุ่มใหม่
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 uppercase tracking-wider text-xs font-semibold text-gray-500">
                            <tr>
                                <th className="px-6 py-4 text-left">กลุ่มฝึกงาน / รุ่น</th>
                                <th className="px-6 py-4 text-left">สถานที่และระยะเวลา</th>
                                <th className="px-6 py-4 text-left">อาจารย์ที่ปรึกษา</th>
                                <th className="px-6 py-4 text-left">นักศึกษา</th>
                                <th className="px-6 py-4 text-center">สถานะ</th>
                                <th className="px-6 py-4 text-right">ตัวเลือก</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filtered.map(group => {
                                const count = group._count.students;
                                const ratio = count / group.capacity;
                                return (
                                    <tr key={group.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
                                                    {group.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{group.name}</div>
                                                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">รุ่น {group.generation}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="text-sm text-gray-900 font-medium mb-1 truncate" title={group.location.name}>
                                                <i className="fas fa-hospital text-gray-400 mr-2"></i>{group.location.name}
                                            </div>
                                            <div className="text-xs text-gray-500">{formatDay(group.startDate)} - {formatDay(group.endDate)}</div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="flex flex-wrap gap-1">
                                                {group.advisors.length > 0 ? group.advisors.map(a => (
                                                    <span key={a.id} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                                        {a.prefix}{a.firstName}
                                                    </span>
                                                )) : <span className="text-xs text-red-400 italic">ยังไม่ระบุ</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                                            <div className="w-full max-w-[140px]">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="font-medium text-gray-600">รับแล้ว {count}</span>
                                                    <span className="text-gray-400">จาก {group.capacity}</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                    <div className={`h-1.5 rounded-full ${ratio >= 1 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(ratio * 100, 100)}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${group.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${group.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {group.isActive ? 'เปิดรับ' : 'ปิดรับ'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-1">
                                                <button onClick={() => setModal({ type: 'members', groupId: group.id })} className="px-3 py-1.5 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="จัดการนักศึกษาในกลุ่ม">
                                                    <i className="fas fa-user-plus mr-1"></i> นักศึกษา
                                                </button>
                                                <button onClick={() => setModal({ type: 'edit', groupId: group.id })} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="แก้ไข">
                                                    <i className="fas fa-pen"></i>
                                                </button>
                                                <button onClick={() => setModal({ type: 'delete', groupId: group.id })} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="ลบ">
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500 bg-gray-50/50">
                                        <i className="fas fa-inbox text-4xl text-gray-300 mb-3 block"></i>
                                        {groups.length === 0 ? 'ยังไม่มีกลุ่มฝึกงาน' : 'ไม่พบกลุ่มฝึกงานที่ตรงกับเงื่อนไข'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal?.type === 'add' && (
                <GroupFormModal key="add" locations={locations} teachers={teachers} onClose={closeModal} />
            )}
            {modal?.type === 'edit' && modalGroup && (
                <GroupFormModal key={`edit-${modalGroup.id}`} group={modalGroup} locations={locations} teachers={teachers} onClose={closeModal} />
            )}
            {modal?.type === 'members' && modalGroup && (
                <MembersModal group={modalGroup} students={students} onClose={closeModal} />
            )}
            {modal?.type === 'delete' && modalGroup && (
                <ConfirmDelete title="ยืนยันการลบกลุ่มฝึกงาน" action={() => deleteGroup(modalGroup.id)} onDone={closeModal} onClose={closeModal}>
                    คุณต้องการลบกลุ่ม <b>{modalGroup.name}</b> ใช่หรือไม่?
                    {modalGroup._count.students > 0 && <> นักศึกษา {modalGroup._count.students} คนในกลุ่มจะกลับไปเป็น &quot;ยังไม่มีกลุ่ม&quot;</>}
                </ConfirmDelete>
            )}
        </>
    );
}

function GroupFormModal({ group, locations, teachers, onClose }) {
    const isEdit = Boolean(group);
    const { run, isPending, error } = useServerAction();
    const [advisors, setAdvisors] = useState(group?.advisors ?? []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        run(() => (isEdit ? updateGroup(group.id, formData) : createGroup(formData)), onClose);
    };

    return (
        <Modal title={isEdit ? 'แก้ไขกลุ่มฝึกงาน' : 'สร้างกลุ่มฝึกงานใหม่'} icon={isEdit ? 'fa-edit' : 'fa-plus'} iconClass={isEdit ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div className="px-6 pb-6">
                    <ErrorAlert>{error}</ErrorAlert>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>ชื่อกลุ่มฝึกงาน <span className="text-red-500">*</span></label>
                                <input type="text" name="name" required defaultValue={group?.name} placeholder="เช่น กลุ่มฝึกงานที่ 1" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>รุ่นปีการศึกษา <span className="text-red-500">*</span></label>
                                <input type="text" name="generation" required defaultValue={group?.generation} placeholder="เช่น 66" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>สถานที่ฝึกงาน <span className="text-red-500">*</span></label>
                                <select name="locationId" required defaultValue={group?.locationId ?? ''} className={inputClass}>
                                    <option value="">-- เลือกสถานที่ --</option>
                                    {locations.filter(l => l.status === 'ACTIVE' || l.id === group?.locationId).map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name} ({loc.province}){loc.status === 'ACTIVE' ? '' : ' - ปิดใช้งาน'}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>เริ่มวันที่ <span className="text-red-500">*</span></label>
                                    <input type="date" name="startDate" required defaultValue={toDayInputValue(group?.startDate)} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>ถึงวันที่ <span className="text-red-500">*</span></label>
                                    <input type="date" name="endDate" required defaultValue={toDayInputValue(group?.endDate)} className={inputClass} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <AdvisorPicker teachers={teachers} selected={advisors} onChange={setAdvisors} />
                            <div>
                                <label className={labelClass}>จำนวนรับ (คน) <span className="text-red-500">*</span></label>
                                <input type="number" name="capacity" required min="1" defaultValue={group?.capacity ?? 5} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>รายละเอียดเพิ่มเติม</label>
                                <textarea name="description" rows="3" defaultValue={group?.description ?? ''} className={`${inputClass} resize-none`}></textarea>
                            </div>
                            {isEdit && (
                                <label className="inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="isActive" value="true" defaultChecked={group.isActive} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                                    <span className="ml-2 text-sm font-medium text-gray-700">เปิดรับนักศึกษา</span>
                                </label>
                            )}
                        </div>
                    </div>
                </div>
                <FormActions isPending={isPending} submitLabel={isEdit ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'} onCancel={onClose} />
            </form>
        </Modal>
    );
}

function AdvisorPicker({ teachers, selected, onChange }) {
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const onMouseDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', onMouseDown);
        return () => document.removeEventListener('mousedown', onMouseDown);
    }, []);

    const term = search.trim().toLowerCase();
    const options = teachers.filter(t =>
        !selected.some(s => s.id === t.id) &&
        (!term || `${t.firstName} ${t.lastName}`.toLowerCase().includes(term))
    );

    return (
        <div ref={ref} className="relative">
            <label className={labelClass}>อาจารย์ที่ปรึกษา</label>
            {selected.map(t => <input key={t.id} type="hidden" name="advisorIds" value={t.id} />)}
            <div className="bg-white border border-gray-300 rounded-lg p-2 min-h-[42px] flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500">
                {selected.map(t => (
                    <span key={t.id} className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                        {personName(t)}
                        <button type="button" onClick={() => onChange(selected.filter(s => s.id !== t.id))} className="ml-1.5 text-blue-400 hover:text-blue-600" aria-label="เอาออก">
                            <i className="fas fa-times"></i>
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    className="flex-1 outline-none text-sm min-w-[100px] bg-transparent"
                    placeholder={selected.length === 0 ? 'ค้นหาอาจารย์...' : ''}
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                />
            </div>
            {open && (
                <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-48 rounded-md py-1 ring-1 ring-black/5 overflow-auto text-sm">
                    {options.length > 0 ? options.map(t => (
                        <button
                            type="button"
                            key={t.id}
                            className="block w-full text-left py-2 px-3 hover:bg-blue-50 border-b border-gray-50 last:border-0"
                            onClick={() => { onChange([...selected, t]); setSearch(''); }}
                        >
                            <span className="block font-medium text-gray-900">{personName(t)}</span>
                            <span className="block text-xs text-gray-500">{t.email}</span>
                        </button>
                    )) : (
                        <p className="py-2 px-3 text-gray-500">{teachers.length === 0 ? 'ยังไม่มีอาจารย์ในระบบ (เพิ่มได้ที่เมนูจัดการผู้ใช้งาน)' : 'ไม่พบอาจารย์'}</p>
                    )}
                </div>
            )}
        </div>
    );
}

// Assign / remove students for one group.
function MembersModal({ group, students, onClose }) {
    const { run, isPending, error, setError } = useServerAction();
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState([]);

    const members = students.filter(s => s.trainingGroupId === group.id);
    const free = group.capacity - members.length;

    const term = search.trim().toLowerCase();
    const candidates = students.filter(s =>
        s.trainingGroupId !== group.id &&
        (!term || `${s.firstName} ${s.lastName} ${s.studentId ?? ''}`.toLowerCase().includes(term))
    );
    // Students who already belong to another group are listed last.
    candidates.sort((a, b) => Number(Boolean(a.trainingGroupId)) - Number(Boolean(b.trainingGroupId)));

    const toggle = (id) => {
        setError('');
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleAdd = () => run(() => addStudentsToGroup(group.id, selected), () => setSelected([]));

    return (
        <Modal title={`นักศึกษาในกลุ่ม: ${group.name}`} icon="fa-user-plus" size="xl" onClose={onClose}>
            <div className="px-6 pb-4">
                <ErrorAlert>{error}</ErrorAlert>
                <div className="flex items-center justify-between mb-4 text-sm">
                    <span className="text-gray-600">รับแล้ว <b>{members.length}</b> จาก {group.capacity} คน</span>
                    <span className={free > 0 ? 'text-green-600' : 'text-red-600'}>{free > 0 ? `ว่างอีก ${free} ที่` : 'กลุ่มเต็มแล้ว'}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">สมาชิกในกลุ่ม</h4>
                        <ul className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-80 overflow-y-auto">
                            {members.map(s => (
                                <li key={s.id} className="flex items-center justify-between px-3 py-2">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{personName(s)}</p>
                                        <p className="text-xs text-gray-500">{s.studentId || 'ไม่มีรหัสนักศึกษา'}</p>
                                    </div>
                                    <button
                                        type="button" disabled={isPending}
                                        onClick={() => run(() => removeStudentFromGroup(s.id))}
                                        className="text-red-500 hover:text-red-700 text-xs px-2 py-1 hover:bg-red-50 rounded"
                                    >
                                        <i className="fas fa-user-minus mr-1"></i>นำออก
                                    </button>
                                </li>
                            ))}
                            {members.length === 0 && <li className="px-3 py-6 text-center text-sm text-gray-400">ยังไม่มีนักศึกษาในกลุ่มนี้</li>}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">เพิ่มนักศึกษา</h4>
                        <SearchBox value={search} onChange={setSearch} placeholder="ค้นหาชื่อ / รหัสนักศึกษา..." />
                        <ul className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-64 overflow-y-auto mt-2">
                            {candidates.map(s => (
                                <li key={s.id}>
                                    <label className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50">
                                        <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggle(s.id)} className="w-4 h-4 text-blue-600 rounded border-gray-300 mr-3" />
                                        <span className="min-w-0">
                                            <span className="block text-sm font-medium text-gray-900 truncate">{personName(s)}</span>
                                            <span className="block text-xs text-gray-500">
                                                {s.studentId || 'ไม่มีรหัสนักศึกษา'}{s.academicYear ? ` · รุ่น ${s.academicYear}` : ''}
                                                {s.trainingGroupId ? <span className="text-orange-500"> · อยู่กลุ่มอื่น (จะย้ายมากลุ่มนี้)</span> : null}
                                            </span>
                                        </span>
                                    </label>
                                </li>
                            ))}
                            {candidates.length === 0 && <li className="px-3 py-6 text-center text-sm text-gray-400">ไม่พบนักศึกษา</li>}
                        </ul>
                        <button type="button" onClick={handleAdd} disabled={isPending || selected.length === 0} className={`${primaryButton} w-full mt-3`}>
                            <i className="fas fa-plus mr-2"></i>
                            {isPending ? 'กำลังบันทึก...' : `เพิ่มนักศึกษาที่เลือก (${selected.length})`}
                        </button>
                    </div>
                </div>
            </div>
            <div className="px-6 py-4 flex justify-end border-t border-gray-100 bg-gray-50">
                <button type="button" onClick={onClose} className={secondaryButton}>ปิด</button>
            </div>
        </Modal>
    );
}
