import { useMemo, useState } from 'react';
import { createUser, updateUser, deleteUser, approveUser, rejectUser } from '../lib/api';
import Modal from '../components/Modal';
import {
    Badge, Block, EmptyState, ErrorAlert, Field, FilterTabs, FormActions, FormSection, HowTo, PageHeader, SearchBox, Select,
    confirmAndRun, html, inputClass, primaryButton, useServerAction,
} from '../components/ui';

const ROLE_STYLES = {
    STUDENT: { label: 'นักศึกษา', tone: 'blue', icon: 'fa-user-graduate', avatar: 'bg-blue-50 text-blue-700' },
    TEACHER: { label: 'อาจารย์', tone: 'green', icon: 'fa-chalkboard-user', avatar: 'bg-green-50 text-green-700' },
    STAFF: { label: 'เจ้าหน้าที่', tone: 'red', icon: 'fa-user-tie', avatar: 'bg-red-50 text-red-700' },
    ADMIN: { label: 'ผู้บริหาร', tone: 'purple', icon: 'fa-user-shield', avatar: 'bg-purple-50 text-purple-700' },
};

const STATUS_STYLES = {
    ACTIVE: { label: 'เปิดใช้งาน', tone: 'green', icon: 'fa-circle-check' },
    PENDING: { label: 'รอการอนุมัติ', tone: 'yellow', icon: 'fa-hourglass-half' },
    INACTIVE: { label: 'ปิดใช้งาน', tone: 'gray', icon: 'fa-circle-pause' },
};

const ROLE_OPTIONS = Object.entries(ROLE_STYLES).map(([value, r]) => ({ value, label: r.label }));
const STATUS_OPTIONS = Object.entries(STATUS_STYLES).map(([value, s]) => ({ value, label: s.label }));

const fullName = (u) => `${u.prefix ?? ''}${u.firstName} ${u.lastName}`;

export default function UserList({ users, groups, currentUserId, initialTab, openAddOnLoad }) {
    const [filterRole, setFilterRole] = useState(initialTab);
    const [searchTerm, setSearchTerm] = useState('');
    // modal: null | { type: 'add', role } | { type: 'edit', user }
    const [modal, setModal] = useState(openAddOnLoad ? { type: 'add', role: initialTab === 'ALL' ? 'STUDENT' : initialTab } : null);
    const closeModal = () => setModal(null);

    const filtered = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return users.filter(u => {
            if (filterRole === 'PENDING') {
                if (u.status !== 'PENDING') return false;
            } else if (filterRole !== 'ALL' && u.role !== filterRole) return false;
            if (!term) return true;
            return [u.firstName, u.lastName, u.username, u.email, u.studentId]
                .some(v => v && v.toLowerCase().includes(term));
        });
    }, [users, filterRole, searchTerm]);

    const pendingCount = users.filter(u => u.status === 'PENDING').length;
    const tabs = [
        { value: 'ALL', label: 'ทั้งหมด', icon: 'fa-list', count: users.length },
        { value: 'PENDING', label: 'รอการอนุมัติ', icon: 'fa-hourglass-half', count: pendingCount },
        ...Object.entries(ROLE_STYLES).map(([value, r]) => ({ value, label: r.label, icon: r.icon, count: users.filter(u => u.role === value).length })),
    ];

    const handleApprove = (u) => confirmAndRun({
        title: 'อนุมัติผู้ใช้งาน?',
        html: html`อนุมัติ <b>${fullName(u)}</b> (${ROLE_STYLES[u.role].label})<br>ผู้ใช้จะเข้าสู่ระบบได้ทันที`,
        icon: 'question', danger: false,
        confirmText: 'อนุมัติ',
        successText: 'อนุมัติเรียบร้อยแล้ว',
        action: () => approveUser(u.id),
    });

    const handleReject = (u) => confirmAndRun({
        title: 'ปฏิเสธคำขอสมัคร?',
        html: html`ปฏิเสธคำขอของ <b>${fullName(u)}</b><br>ข้อมูลที่กรอกไว้จะถูกลบและเรียกคืนไม่ได้`,
        confirmText: 'ปฏิเสธคำขอ',
        successText: 'ปฏิเสธคำขอเรียบร้อยแล้ว',
        action: () => rejectUser(u.id),
    });

    const handleDelete = (u) => confirmAndRun({
        title: 'ลบผู้ใช้งาน?',
        html: html`ต้องการลบ <b>${fullName(u)}</b> ใช่หรือไม่?<br>การลบไม่สามารถเรียกคืนได้`,
        confirmText: 'ลบผู้ใช้งาน',
        successText: 'ลบผู้ใช้งานเรียบร้อยแล้ว',
        action: () => deleteUser(u.id),
    });

    return (
        <>
            <PageHeader icon="fa-users-gear" title="จัดการผู้ใช้งาน" description="นักศึกษา อาจารย์ เจ้าหน้าที่ และผู้บริหาร">
                <button
                    onClick={() => setModal({ type: 'add', role: ['ALL', 'PENDING'].includes(filterRole) ? 'STUDENT' : filterRole })}
                    className={`${primaryButton} text-lg`}
                >
                    <i className="fas fa-user-plus"></i> {filterRole === 'STUDENT' ? 'เพิ่มนักศึกษา' : 'เพิ่มผู้ใช้งาน'}
                </button>
            </PageHeader>

            <HowTo steps={['ตรวจสอบผู้สมัครในแท็บ "รอการอนุมัติ"', 'กด "อนุมัติ" หรือ "ปฏิเสธ"', 'กด "แก้ไข" เพื่อจัดกลุ่มหรือเปลี่ยนข้อมูล']} />

            {pendingCount > 0 && filterRole !== 'PENDING' && (
                <button
                    type="button"
                    onClick={() => setFilterRole('PENDING')}
                    className="w-full mb-6 rounded-2xl border-2 border-amber-300 bg-amber-50 px-5 py-4 flex items-center gap-4 text-left hover:bg-amber-100 transition"
                >
                    <span className="w-12 h-12 rounded-full bg-amber-400 text-white flex items-center justify-center text-xl font-semibold flex-shrink-0">{pendingCount}</span>
                    <span className="flex-1">
                        <span className="block text-lg font-semibold text-amber-900">มีผู้สมัครรอการอนุมัติ {pendingCount} คน</span>
                        <span className="block text-base text-amber-800">กดที่นี่เพื่อตรวจสอบและอนุมัติ</span>
                    </span>
                    <i className="fas fa-arrow-right text-amber-700 text-xl"></i>
                </button>
            )}

            <Block number={1} title="เลือกประเภทและค้นหา" className="mb-6">
                <div className="space-y-4">
                    <FilterTabs value={filterRole} onChange={setFilterRole} options={tabs} />
                    <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="ค้นหาชื่อ, ชื่อผู้ใช้, รหัส, อีเมล..." />
                </div>
            </Block>

            <Block number={2} title={`รายชื่อผู้ใช้งาน (${filtered.length} คน)`} bodyClassName="">
                {filtered.length === 0 ? (
                    <EmptyState icon="fa-user-slash" title="ไม่พบผู้ใช้งาน">ลองเปลี่ยนประเภทหรือคำค้นหา</EmptyState>
                ) : (
                    <ul className="divide-y divide-line">
                        {filtered.map(user => {
                            const role = ROLE_STYLES[user.role];
                            const status = STATUS_STYLES[user.status];
                            return (
                                <li key={user.id} className={`px-5 sm:px-6 py-5 flex flex-col lg:flex-row lg:items-center gap-4 ${user.status === 'PENDING' ? 'bg-amber-50/50' : ''}`}>
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        <span className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${role.avatar}`}>
                                            <i className={`fas ${role.icon} text-lg`}></i>
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-lg font-semibold text-ink">
                                                {fullName(user)}
                                                {user.id === currentUserId && <span className="ml-2 text-base font-normal text-muted">(บัญชีของฉัน)</span>}
                                            </p>
                                            <p className="text-base text-muted break-all">
                                                <i className="fas fa-at mr-1"></i>{user.username}
                                                {user.studentId && <> · รหัส {user.studentId}</>}
                                                <span className="hidden sm:inline"> · {user.email}</span>
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <Badge tone={role.tone} icon={role.icon}>{role.label}</Badge>
                                                <Badge tone={status.tone} icon={status.icon}>{status.label}</Badge>
                                                {user.role === 'STUDENT' && (
                                                    user.trainingGroup
                                                        ? <Badge tone="teal" icon="fa-people-group">{user.trainingGroup.name}</Badge>
                                                        : <Badge tone="gray" icon="fa-circle-question">ยังไม่มีกลุ่ม</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 lg:flex-shrink-0">
                                        {user.status === 'PENDING' && (
                                            <>
                                                <button onClick={() => handleApprove(user)} className="btn btn-success btn-sm"><i className="fas fa-check"></i> อนุมัติ</button>
                                                <button onClick={() => handleReject(user)} className="btn btn-soft-danger btn-sm"><i className="fas fa-xmark"></i> ปฏิเสธ</button>
                                            </>
                                        )}
                                        <button onClick={() => setModal({ type: 'edit', user })} className="btn btn-soft btn-sm"><i className="fas fa-pen"></i> แก้ไข</button>
                                        {user.id !== currentUserId && user.status !== 'PENDING' && (
                                            <button onClick={() => handleDelete(user)} className="btn btn-soft-danger btn-sm"><i className="fas fa-trash"></i> ลบ</button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </Block>

            {modal?.type === 'add' && (
                <UserFormModal key="add" defaultRole={modal.role} groups={groups} onClose={closeModal} />
            )}
            {modal?.type === 'edit' && (
                <UserFormModal key={`edit-${modal.user.id}`} user={modal.user} isSelf={modal.user.id === currentUserId} groups={groups} onClose={closeModal} />
            )}
        </>
    );
}

function UserFormModal({ user, defaultRole = 'STUDENT', isSelf = false, groups, onClose }) {
    const isEdit = Boolean(user);
    const { run, isPending, error } = useServerAction();
    const [role, setRole] = useState(user?.role ?? defaultRole);

    const groupOptions = groups.map(g => {
        const isCurrent = g.id === user?.trainingGroupId;
        const full = g._count.students >= g.capacity && !isCurrent;
        return {
            value: g.id,
            label: `${g.name} (${g._count.students}/${g.capacity} คน)${full ? ' - เต็มแล้ว' : ''}${g.isActive ? '' : ' - ปิดรับ'}`,
            isDisabled: full,
        };
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        run(() => (isEdit ? updateUser(user.id, formData) : createUser(formData)), onClose);
    };

    return (
        <Modal
            title={isEdit ? 'แก้ไขข้อมูลผู้ใช้งาน' : role === 'STUDENT' ? 'เพิ่มนักศึกษาใหม่' : 'เพิ่มผู้ใช้งานใหม่'}
            subtitle="กรอกข้อมูลตามลำดับ ช่องที่มี * ต้องกรอก"
            icon={isEdit ? 'fa-user-pen' : 'fa-user-plus'}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit}>
                <div className="p-5 sm:p-6 space-y-5">
                    <ErrorAlert>{error}</ErrorAlert>

                    <FormSection number={1} title="ประเภทผู้ใช้งาน">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="ประเภท" hint={isSelf ? 'ไม่สามารถเปลี่ยนสิทธิ์ของบัญชีตัวเองได้' : undefined}>
                                <Select name="role" options={ROLE_OPTIONS} value={role} onChange={setRole} isDisabled={isSelf} isSearchable={false} />
                                {isSelf && <input type="hidden" name="role" value={role} />}
                            </Field>
                            {isEdit && (
                                <Field label="สถานะ">
                                    <Select name="status" options={STATUS_OPTIONS} defaultValue={user.status} isDisabled={isSelf} isSearchable={false} />
                                    {isSelf && <input type="hidden" name="status" value={user.status} />}
                                </Field>
                            )}
                        </div>
                    </FormSection>

                    <FormSection number={2} title="ข้อมูลส่วนตัว">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Field label="คำนำหน้า">
                                <input type="text" name="prefix" defaultValue={user?.prefix ?? ''} placeholder="นาย, นางสาว, ผศ.ดร." className={inputClass} />
                            </Field>
                            <Field label="ชื่อจริง" required>
                                <input type="text" name="firstName" required defaultValue={user?.firstName} className={inputClass} />
                            </Field>
                            <Field label="นามสกุล" required>
                                <input type="text" name="lastName" required defaultValue={user?.lastName} className={inputClass} />
                            </Field>
                        </div>
                        <Field label="อีเมล" required>
                            <input type="email" name="email" required defaultValue={user?.email} className={inputClass} />
                        </Field>
                    </FormSection>

                    <FormSection number={3} title="บัญชีเข้าสู่ระบบ">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {!isEdit && (
                                <Field label="ชื่อผู้ใช้ (Username)" required>
                                    <input type="text" name="username" required autoComplete="off" className={inputClass} />
                                </Field>
                            )}
                            <Field
                                label={isEdit ? 'เปลี่ยนรหัสผ่าน' : 'รหัสผ่าน'}
                                required={!isEdit}
                                hint={isEdit ? 'เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน' : 'อย่างน้อย 6 ตัวอักษร'}
                                className={isEdit ? 'sm:col-span-2' : ''}
                            >
                                <input type="password" name="password" minLength={6} required={!isEdit} autoComplete="new-password" className={inputClass} />
                            </Field>
                        </div>
                    </FormSection>

                    {role === 'STUDENT' && (
                        <FormSection number={4} title="ข้อมูลนักศึกษาและกลุ่มฝึกงาน">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Field label="รหัสนักศึกษา">
                                    <input type="text" name="studentId" defaultValue={user?.studentId ?? ''} className={inputClass} />
                                </Field>
                                <Field label="สาขาวิชา">
                                    <input type="text" name="major" defaultValue={user?.major ?? ''} className={inputClass} />
                                </Field>
                                <Field label="รุ่นปี" hint="เช่น 66">
                                    <input type="number" name="academicYear" min="0" defaultValue={user?.academicYear ?? ''} className={inputClass} />
                                </Field>
                            </div>
                            <Field label="กลุ่มฝึกงาน" hint="กลุ่มที่เต็มแล้วจะเลือกไม่ได้">
                                <Select name="trainingGroupId" options={groupOptions} defaultValue={user?.trainingGroupId ?? ''} placeholder="-- ยังไม่จัดกลุ่ม --" isClearable />
                            </Field>
                        </FormSection>
                    )}
                </div>
                <FormActions isPending={isPending} submitLabel={isEdit ? 'บันทึกการแก้ไข' : 'บันทึกผู้ใช้งาน'} onCancel={onClose} />
            </form>
        </Modal>
    );
}
