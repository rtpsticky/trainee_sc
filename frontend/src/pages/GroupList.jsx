import { useMemo, useState } from 'react';
import {
    createGroup, updateGroup, deleteGroup, addStudentsToGroup, removeStudentFromGroup,
    createMentor, updateMentor, deleteMentor,
} from '../lib/api';
import Modal from '../components/Modal';
import {
    Badge, Block, EmptyState, ErrorAlert, Field, FilterTabs, FormActions, FormSection, HowTo, PageHeader, SearchBox, Select, StatCard,
    confirmAndRun, html, inputClass, primaryButton, secondaryButton, useServerAction,
} from '../components/ui';
import { formatDay, toDayInputValue } from '../lib/format';

const personName = (p) => `${p.prefix ?? ''}${p.firstName} ${p.lastName}`;

export default function GroupList({ groups, locations, teachers, students }) {
    // modal: null | { type: 'add' } | { type: 'edit' | 'members' | 'mentors', groupId }
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

    const handleDelete = (group) => confirmAndRun({
        title: 'ลบกลุ่มฝึกงาน?',
        html: html`ต้องการลบกลุ่ม <b>${group.name}</b> ใช่หรือไม่?${group._count.students > 0
            ? html`<br>นักศึกษา ${group._count.students} คนในกลุ่มจะกลับไปเป็น "ยังไม่มีกลุ่ม"`
            : ''}`,
        confirmText: 'ลบกลุ่ม',
        successText: 'ลบกลุ่มฝึกงานเรียบร้อยแล้ว',
        action: () => deleteGroup(group.id),
    });

    return (
        <>
            <PageHeader icon="fa-people-group" title="กลุ่มฝึกงาน" description="กำหนดแหล่งฝึก ช่วงเวลา อาจารย์ที่ปรึกษา นักศึกษา และพี่เลี้ยงของแต่ละกลุ่ม">
                <button onClick={() => setModal({ type: 'add' })} className={`${primaryButton} text-lg`}>
                    <i className="fas fa-plus"></i> สร้างกลุ่มใหม่
                </button>
            </PageHeader>

            <HowTo steps={['กด "สร้างกลุ่มใหม่" กำหนดแหล่งฝึกและวันที่', 'กด "นักศึกษา" เพื่อจัดคนเข้ากลุ่ม', 'กด "พี่เลี้ยง" เพื่อเพิ่มผู้ดูแลที่แหล่งฝึก']} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard title="กลุ่มฝึกงานทั้งหมด" value={groups.length} suffix="กลุ่ม" icon="fa-layer-group" color="blue" />
                <StatCard title="นักศึกษาที่จัดกลุ่มแล้ว" value={enrolledTotal} suffix="คน" icon="fa-user-check" color="green" />
                <StatCard title="นักศึกษาที่ยังไม่มีกลุ่ม" value={unassignedTotal} suffix="คน" icon="fa-user-clock" color="yellow" />
            </div>

            <Block number={1} title="ค้นหาและกรองข้อมูล" className="mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="ค้นหาชื่อกลุ่ม, รุ่น, สถานที่..." />
                    <FilterTabs
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                            { value: 'ALL', label: 'ทุกกลุ่ม', count: groups.length },
                            { value: 'OPEN', label: 'เปิดรับ', icon: 'fa-door-open', count: groups.filter(g => g.isActive).length },
                            { value: 'CLOSED', label: 'ปิดรับ', icon: 'fa-door-closed', count: groups.filter(g => !g.isActive).length },
                        ]}
                    />
                </div>
            </Block>

            <Block number={2} title={`รายการกลุ่มฝึกงาน (${filtered.length} กลุ่ม)`} bodyClassName="p-4 sm:p-5">
                {filtered.length === 0 ? (
                    <EmptyState icon="fa-people-group" title={groups.length === 0 ? 'ยังไม่มีกลุ่มฝึกงาน' : 'ไม่พบกลุ่มที่ค้นหา'}>
                        {groups.length === 0 && 'กดปุ่ม "สร้างกลุ่มใหม่" ด้านบนเพื่อเริ่มต้น'}
                    </EmptyState>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {filtered.map(group => (
                            <GroupCard
                                key={group.id}
                                group={group}
                                onMembers={() => setModal({ type: 'members', groupId: group.id })}
                                onMentors={() => setModal({ type: 'mentors', groupId: group.id })}
                                onEdit={() => setModal({ type: 'edit', groupId: group.id })}
                                onDelete={() => handleDelete(group)}
                            />
                        ))}
                    </div>
                )}
            </Block>

            {modal?.type === 'add' && (
                <GroupFormModal key="add" locations={locations} teachers={teachers} onClose={closeModal} />
            )}
            {modal?.type === 'edit' && modalGroup && (
                <GroupFormModal key={`edit-${modalGroup.id}`} group={modalGroup} locations={locations} teachers={teachers} onClose={closeModal} />
            )}
            {modal?.type === 'members' && modalGroup && (
                <MembersModal group={modalGroup} students={students} onClose={closeModal} />
            )}
            {modal?.type === 'mentors' && modalGroup && (
                <MentorsModal group={modalGroup} onClose={closeModal} />
            )}
        </>
    );
}

function GroupCard({ group, onMembers, onMentors, onEdit, onDelete }) {
    const count = group._count.students;
    const ratio = count / group.capacity;
    return (
        <article className="rounded-2xl border border-line bg-white p-5 flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center text-xl font-semibold flex-shrink-0">
                        {group.name.charAt(0)}
                    </span>
                    <div className="min-w-0">
                        <h3 className="text-xl font-semibold text-ink leading-snug">{group.name}</h3>
                        <p className="text-base text-muted">รุ่น {group.generation}</p>
                    </div>
                </div>
                {group.isActive
                    ? <Badge tone="green" icon="fa-door-open">เปิดรับ</Badge>
                    : <Badge tone="gray" icon="fa-door-closed">ปิดรับ</Badge>}
            </div>

            <dl className="space-y-2 text-base mb-4">
                <div className="flex gap-3"><dt className="w-6 text-brand-600"><i className="fas fa-hospital"></i></dt><dd className="text-ink">{group.location.name}</dd></div>
                <div className="flex gap-3"><dt className="w-6 text-brand-600"><i className="fas fa-calendar-days"></i></dt><dd className="text-ink">{formatDay(group.startDate)} – {formatDay(group.endDate)}</dd></div>
                <div className="flex gap-3">
                    <dt className="w-6 text-brand-600"><i className="fas fa-chalkboard-user"></i></dt>
                    <dd className={group.advisors.length ? 'text-ink' : 'text-red-700'}>
                        {group.advisors.length ? group.advisors.map(personName).join(', ') : 'ยังไม่ระบุอาจารย์ที่ปรึกษา'}
                    </dd>
                </div>
                <div className="flex gap-3">
                    <dt className="w-6 text-brand-600"><i className="fas fa-user-nurse"></i></dt>
                    <dd className="text-ink">{group.mentors.length ? `พี่เลี้ยง ${group.mentors.length} คน` : <span className="text-muted">ยังไม่มีพี่เลี้ยง</span>}</dd>
                </div>
            </dl>

            <div className="mb-5">
                <div className="flex justify-between text-base mb-1.5">
                    <span className="font-medium text-ink">นักศึกษา {count} / {group.capacity} คน</span>
                    <span className={ratio >= 1 ? 'text-red-700 font-medium' : 'text-green-700'}>{ratio >= 1 ? 'เต็มแล้ว' : `ว่าง ${group.capacity - count} ที่`}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className={`h-3 rounded-full ${ratio >= 1 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(ratio * 100, 100)}%` }}></div>
                </div>
            </div>

            <div className="mt-auto grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button onClick={onMembers} className="btn btn-primary btn-sm"><i className="fas fa-user-plus"></i> นักศึกษา</button>
                <button onClick={onMentors} className="btn btn-soft btn-sm"><i className="fas fa-user-nurse"></i> พี่เลี้ยง</button>
                <button onClick={onEdit} className="btn btn-soft btn-sm"><i className="fas fa-pen"></i> แก้ไข</button>
                <button onClick={onDelete} className="btn btn-soft-danger btn-sm"><i className="fas fa-trash"></i> ลบ</button>
            </div>
        </article>
    );
}

function GroupFormModal({ group, locations, teachers, onClose }) {
    const isEdit = Boolean(group);
    const { run, isPending, error } = useServerAction();

    const locationOptions = locations
        .filter(l => l.status === 'ACTIVE' || l.id === group?.locationId)
        .map(l => ({ value: l.id, label: `${l.name} (จ.${l.province})${l.status === 'ACTIVE' ? '' : ' - ปิดใช้งาน'}` }));
    const teacherOptions = teachers.map(t => ({ value: t.id, label: personName(t) }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        run(() => (isEdit ? updateGroup(group.id, formData) : createGroup(formData)), onClose);
    };

    return (
        <Modal title={isEdit ? 'แก้ไขกลุ่มฝึกงาน' : 'สร้างกลุ่มฝึกงานใหม่'} subtitle="กรอกข้อมูลตามลำดับ ช่องที่มี * ต้องกรอก" icon={isEdit ? 'fa-pen' : 'fa-plus'} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div className="p-5 sm:p-6 space-y-5">
                    <ErrorAlert>{error}</ErrorAlert>

                    <FormSection number={1} title="ชื่อกลุ่ม">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="ชื่อกลุ่มฝึกงาน" required>
                                <input type="text" name="name" required defaultValue={group?.name} placeholder="เช่น กลุ่มฝึกงานที่ 1" className={inputClass} />
                            </Field>
                            <Field label="รุ่นปีการศึกษา" required>
                                <input type="text" name="generation" required defaultValue={group?.generation} placeholder="เช่น 66" className={inputClass} />
                            </Field>
                        </div>
                    </FormSection>

                    <FormSection number={2} title="สถานที่และระยะเวลาฝึกงาน">
                        <Field label="แหล่งฝึกงาน" required hint={locationOptions.length === 0 ? 'ยังไม่มีแหล่งฝึกงาน กรุณาเพิ่มที่เมนู "แหล่งฝึกงาน" ก่อน' : 'พิมพ์เพื่อค้นหาได้'}>
                            <Select name="locationId" required options={locationOptions} defaultValue={group?.locationId} placeholder="-- เลือกแหล่งฝึกงาน --" />
                        </Field>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="วันเริ่มฝึกงาน" required>
                                <input type="date" name="startDate" required defaultValue={toDayInputValue(group?.startDate)} className={inputClass} />
                            </Field>
                            <Field label="วันสิ้นสุด" required>
                                <input type="date" name="endDate" required defaultValue={toDayInputValue(group?.endDate)} className={inputClass} />
                            </Field>
                        </div>
                    </FormSection>

                    <FormSection number={3} title="อาจารย์ที่ปรึกษาและจำนวนรับ">
                        <Field label="อาจารย์ที่ปรึกษา" hint={teachers.length === 0 ? 'ยังไม่มีอาจารย์ในระบบ (เพิ่มได้ที่เมนูจัดการผู้ใช้งาน)' : 'เลือกได้มากกว่า 1 ท่าน'}>
                            <Select name="advisorIds" isMulti options={teacherOptions} defaultValue={group?.advisors.map(a => a.id) ?? []} placeholder="ค้นหาและเลือกอาจารย์..." closeMenuOnSelect={false} />
                        </Field>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="จำนวนรับ (คน)" required>
                                <input type="number" name="capacity" required min="1" defaultValue={group?.capacity ?? 5} className={inputClass} />
                            </Field>
                            {isEdit && (
                                <Field label="การรับนักศึกษา">
                                    <label className="flex items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 cursor-pointer">
                                        <input type="checkbox" name="isActive" value="true" defaultChecked={group.isActive} className="w-6 h-6 accent-blue-700" />
                                        <span className="text-base text-ink">เปิดรับนักศึกษา</span>
                                    </label>
                                </Field>
                            )}
                        </div>
                        <Field label="รายละเอียดเพิ่มเติม">
                            <textarea name="description" rows="3" defaultValue={group?.description ?? ''} className={`${inputClass} resize-y`}></textarea>
                        </Field>
                    </FormSection>
                </div>
                <FormActions isPending={isPending} submitLabel={isEdit ? 'บันทึกการแก้ไข' : 'สร้างกลุ่ม'} onCancel={onClose} />
            </form>
        </Modal>
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

    const handleAdd = () => run(() => addStudentsToGroup(group.id, selected), () => setSelected([]), `เพิ่มนักศึกษา ${selected.length} คนเรียบร้อยแล้ว`);

    const handleRemove = (s) => confirmAndRun({
        title: 'นำนักศึกษาออกจากกลุ่ม?',
        html: html`นำ <b>${personName(s)}</b> ออกจากกลุ่ม <b>${group.name}</b>`,
        confirmText: 'นำออก',
        successText: 'นำนักศึกษาออกเรียบร้อยแล้ว',
        action: () => removeStudentFromGroup(group.id, s.id),
    });

    return (
        <Modal title={`นักศึกษาในกลุ่ม: ${group.name}`} subtitle={`รับแล้ว ${members.length} จาก ${group.capacity} คน · ${free > 0 ? `ว่างอีก ${free} ที่` : 'กลุ่มเต็มแล้ว'}`} icon="fa-user-plus" size="xl" onClose={onClose}>
            <div className="p-5 sm:p-6">
                <ErrorAlert>{error}</ErrorAlert>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <FormSection number={1} title={`เลือกนักศึกษาที่จะเพิ่ม (${selected.length} คน)`}>
                        <SearchBox value={search} onChange={setSearch} placeholder="ค้นหาชื่อ / รหัสนักศึกษา..." />
                        <ul className="rounded-xl border border-line bg-white divide-y divide-line max-h-80 overflow-y-auto">
                            {candidates.map(s => (
                                <li key={s.id}>
                                    <label className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${selected.includes(s.id) ? 'bg-brand-50' : 'hover:bg-gray-50'}`}>
                                        <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggle(s.id)} className="w-6 h-6 accent-blue-700 flex-shrink-0" />
                                        <span className="min-w-0">
                                            <span className="block text-base font-medium text-ink">{personName(s)}</span>
                                            <span className="block text-sm text-muted">
                                                {s.studentId || 'ไม่มีรหัสนักศึกษา'}{s.academicYear ? ` · รุ่น ${s.academicYear}` : ''}
                                                {s.trainingGroupId ? <span className="text-orange-700"> · อยู่กลุ่มอื่น (จะย้ายมากลุ่มนี้)</span> : null}
                                            </span>
                                        </span>
                                    </label>
                                </li>
                            ))}
                            {candidates.length === 0 && <li className="px-4 py-8 text-center text-base text-muted">ไม่พบนักศึกษา</li>}
                        </ul>
                        <button type="button" onClick={handleAdd} disabled={isPending || selected.length === 0} className={`${primaryButton} w-full text-lg`}>
                            {isPending ? <><i className="fas fa-spinner fa-spin"></i> กำลังบันทึก...</> : <><i className="fas fa-arrow-right"></i> เพิ่มเข้ากลุ่ม ({selected.length} คน)</>}
                        </button>
                    </FormSection>

                    <FormSection number={2} title={`สมาชิกในกลุ่มตอนนี้ (${members.length} คน)`}>
                        <ul className="rounded-xl border border-line bg-white divide-y divide-line max-h-[26rem] overflow-y-auto">
                            {members.map((s, i) => (
                                <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                                    <span className="w-8 h-8 rounded-full bg-page text-muted text-sm font-semibold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-base font-medium text-ink truncate">{personName(s)}</p>
                                        <p className="text-sm text-muted">{s.studentId || 'ไม่มีรหัสนักศึกษา'}</p>
                                    </div>
                                    <button type="button" onClick={() => handleRemove(s)} className="btn btn-soft-danger btn-sm flex-shrink-0">
                                        <i className="fas fa-user-minus"></i> นำออก
                                    </button>
                                </li>
                            ))}
                            {members.length === 0 && <li className="px-4 py-8 text-center text-base text-muted">ยังไม่มีนักศึกษาในกลุ่มนี้</li>}
                        </ul>
                    </FormSection>
                </div>
            </div>
            <div className="px-5 sm:px-6 py-4 flex justify-end border-t border-line bg-gray-50">
                <button type="button" onClick={onClose} className={secondaryButton}>ปิดหน้าต่าง</button>
            </div>
        </Modal>
    );
}

// Manage the on-site mentors (พี่เลี้ยง) attached to one group: list, add, edit, delete.
function MentorsModal({ group, onClose }) {
    const { run, isPending, error, setError } = useServerAction();
    // form: null (showing the list) | 'add' | the mentor object being edited
    const [form, setForm] = useState(null);

    const openAdd = () => { setError(''); setForm('add'); };
    const openEdit = (mentor) => { setError(''); setForm(mentor); };
    const isEdit = form && form !== 'add';

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        run(() => (isEdit ? updateMentor(form.id, formData) : createMentor(group.id, formData)), () => setForm(null));
    };

    const handleDelete = (m) => confirmAndRun({
        title: 'ลบพี่เลี้ยง?',
        html: html`ลบ <b>${personName(m)}</b> ออกจากกลุ่มนี้ใช่หรือไม่?`,
        confirmText: 'ลบพี่เลี้ยง',
        successText: 'ลบพี่เลี้ยงเรียบร้อยแล้ว',
        action: () => deleteMentor(m.id),
    });

    return (
        <Modal title={`พี่เลี้ยงในกลุ่ม: ${group.name}`} subtitle="ผู้ดูแลนักศึกษาที่แหล่งฝึกงาน" icon="fa-user-nurse" iconClass="bg-teal-50 text-teal-700" onClose={onClose}>
            <div className="p-5 sm:p-6">
                <ErrorAlert>{error}</ErrorAlert>

                {!form ? (
                    <>
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <p className="text-lg font-medium text-ink">รายชื่อพี่เลี้ยง ({group.mentors.length} คน)</p>
                            <button type="button" onClick={openAdd} className={primaryButton}>
                                <i className="fas fa-plus"></i> เพิ่มพี่เลี้ยง
                            </button>
                        </div>
                        {group.mentors.length === 0 ? (
                            <div className="rounded-2xl border border-line">
                                <EmptyState icon="fa-user-nurse" title="ยังไม่มีพี่เลี้ยงในกลุ่มนี้">กดปุ่ม "เพิ่มพี่เลี้ยง" เพื่อเพิ่ม</EmptyState>
                            </div>
                        ) : (
                            <ul className="rounded-2xl border border-line divide-y divide-line max-h-[28rem] overflow-y-auto">
                                {group.mentors.map(m => (
                                    <li key={m.id} className="px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-lg font-medium text-ink">
                                                {personName(m)}
                                                {m.position && <span className="text-base text-muted font-normal"> · {m.position}</span>}
                                            </p>
                                            <p className="text-base text-muted">
                                                <a href={`tel:${m.phone}`} className="text-brand-700 hover:underline"><i className="fas fa-phone mr-1.5"></i>{m.phone}</a>
                                                {m.email && <span className="ml-4"><i className="fas fa-envelope mr-1.5"></i>{m.email}</span>}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <button type="button" onClick={() => openEdit(m)} className="btn btn-soft btn-sm"><i className="fas fa-pen"></i> แก้ไข</button>
                                            <button type="button" onClick={() => handleDelete(m)} className="btn btn-soft-danger btn-sm"><i className="fas fa-trash"></i> ลบ</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <FormSection number={1} title={isEdit ? 'แก้ไขชื่อพี่เลี้ยง' : 'ชื่อพี่เลี้ยง'}>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Field label="คำนำหน้า">
                                    <input type="text" name="prefix" defaultValue={isEdit ? form.prefix ?? '' : ''} placeholder="นาย, นางสาว" className={inputClass} />
                                </Field>
                                <Field label="ชื่อจริง" required>
                                    <input type="text" name="firstName" required defaultValue={isEdit ? form.firstName : ''} className={inputClass} />
                                </Field>
                                <Field label="นามสกุล" required>
                                    <input type="text" name="lastName" required defaultValue={isEdit ? form.lastName : ''} className={inputClass} />
                                </Field>
                            </div>
                            <Field label="ตำแหน่ง">
                                <input type="text" name="position" defaultValue={isEdit ? form.position ?? '' : ''} placeholder="เช่น พยาบาลวิชาชีพ" className={inputClass} />
                            </Field>
                        </FormSection>
                        <FormSection number={2} title="ช่องทางติดต่อ">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="เบอร์โทรศัพท์" required>
                                    <input type="tel" name="phone" required defaultValue={isEdit ? form.phone : ''} className={inputClass} />
                                </Field>
                                <Field label="อีเมล">
                                    <input type="email" name="email" defaultValue={isEdit ? form.email ?? '' : ''} className={inputClass} />
                                </Field>
                            </div>
                        </FormSection>
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                            <button type="button" onClick={() => setForm(null)} className={secondaryButton}><i className="fas fa-arrow-left"></i> กลับไปรายชื่อ</button>
                            <button type="submit" disabled={isPending} className={primaryButton}>
                                {isPending ? <><i className="fas fa-spinner fa-spin"></i> กำลังบันทึก...</> : <><i className="fas fa-save"></i> บันทึกพี่เลี้ยง</>}
                            </button>
                        </div>
                    </form>
                )}
            </div>
            {!form && (
                <div className="px-5 sm:px-6 py-4 flex justify-end border-t border-line bg-gray-50">
                    <button type="button" onClick={onClose} className={secondaryButton}>ปิดหน้าต่าง</button>
                </div>
            )}
        </Modal>
    );
}
