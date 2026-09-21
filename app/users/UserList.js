'use client';

import { useMemo, useState } from 'react';
import { createUser, updateUser, deleteUser } from '../actions/users';
import Modal from '../components/Modal';
import {
    ConfirmDelete, ErrorAlert, FormActions, SearchBox, StatCard,
    inputClass, labelClass, primaryButton, useServerAction,
} from '../components/ui';

const ROLE_STYLES = {
    STUDENT: { label: 'นักศึกษา', badge: 'bg-blue-100 text-blue-800', icon: 'fa-user-graduate', avatar: 'bg-blue-100 text-blue-600', card: 'blue' },
    TEACHER: { label: 'อาจารย์', badge: 'bg-green-100 text-green-800', icon: 'fa-chalkboard-teacher', avatar: 'bg-green-100 text-green-600', card: 'green' },
    STAFF: { label: 'เจ้าหน้าที่', badge: 'bg-red-100 text-red-800', icon: 'fa-user-tie', avatar: 'bg-red-100 text-red-600', card: 'red' },
    ADMIN: { label: 'ผู้บริหาร', badge: 'bg-purple-100 text-purple-800', icon: 'fa-user-shield', avatar: 'bg-purple-100 text-purple-600', card: 'purple' },
};

const TABS = [{ id: 'ALL', label: 'ผู้ใช้งานทั้งหมด', icon: 'fa-list' }, ...Object.entries(ROLE_STYLES).map(([id, r]) => ({ id, label: r.label, icon: r.icon }))];

export default function UserList({ users, groups, currentUserId, initialTab, openAddOnLoad }) {
    const [filterRole, setFilterRole] = useState(initialTab);
    const [searchTerm, setSearchTerm] = useState('');
    // modal: null | { type: 'add' } | { type: 'edit' | 'delete', user }
    const [modal, setModal] = useState(openAddOnLoad ? { type: 'add', role: initialTab === 'ALL' ? 'STUDENT' : initialTab } : null);
    const closeModal = () => setModal(null);

    const filtered = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return users.filter(u => {
            if (filterRole !== 'ALL' && u.role !== filterRole) return false;
            if (!term) return true;
            return [u.firstName, u.lastName, u.username, u.email, u.studentId]
                .some(v => v && v.toLowerCase().includes(term));
        });
    }, [users, filterRole, searchTerm]);

    const countByRole = (role) => users.filter(u => u.role === role).length;

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(ROLE_STYLES).map(([role, r]) => (
                    <StatCard key={role} title={r.label} value={countByRole(role)} icon={r.icon} color={r.card} />
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px overflow-x-auto">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setFilterRole(tab.id)}
                                className={`py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap focus:outline-none transition-colors ${filterRole === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                <i className={`fas ${tab.icon} mr-2 ${filterRole === tab.id ? 'text-blue-600' : 'text-gray-400'}`}></i>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <button
                        onClick={() => setModal({ type: 'add', role: filterRole === 'ALL' ? 'STUDENT' : filterRole })}
                        className={primaryButton}
                    >
                        <i className="fas fa-plus mr-2"></i>
                        {filterRole === 'STUDENT' ? 'เพิ่มนักศึกษา' : 'เพิ่มผู้ใช้งาน'}
                    </button>
                    <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="ค้นหาชื่อ, รหัส, อีเมล..." />
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['ชื่อ-สกุล / ชื่อผู้ใช้', 'อีเมล', 'สิทธิ์การใช้งาน', 'กลุ่มฝึกงาน', 'สถานะ'].map(h => (
                                    <th key={h} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filtered.map(user => {
                                const role = ROLE_STYLES[user.role];
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${role.avatar}`}>
                                                    <i className={`fas ${role.icon}`}></i>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.prefix} {user.firstName} {user.lastName}</div>
                                                    <div className="text-sm text-gray-500">{user.username}{user.studentId ? ` (${user.studentId})` : ''}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${role.badge}`}>{role.label}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.role === 'STUDENT' ? (user.trainingGroup?.name || <span className="text-gray-400">ยังไม่มีกลุ่ม</span>) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.status === 'ACTIVE' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => setModal({ type: 'edit', user })} className="text-blue-600 hover:text-blue-900 mr-3" title="แก้ไข">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            {user.id !== currentUserId && (
                                                <button onClick={() => setModal({ type: 'delete', user })} className="text-red-600 hover:text-red-900" title="ลบ">
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">ไม่พบข้อมูลผู้ใช้งาน</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal?.type === 'add' && (
                <UserFormModal key="add" defaultRole={modal.role} groups={groups} onClose={closeModal} />
            )}
            {modal?.type === 'edit' && (
                <UserFormModal key={`edit-${modal.user.id}`} user={modal.user} isSelf={modal.user.id === currentUserId} groups={groups} onClose={closeModal} />
            )}
            {modal?.type === 'delete' && (
                <ConfirmDelete
                    title="ยืนยันการลบผู้ใช้งาน"
                    action={() => deleteUser(modal.user.id)}
                    onDone={closeModal}
                    onClose={closeModal}
                >
                    คุณต้องการลบผู้ใช้งาน <b>{modal.user.firstName} {modal.user.lastName}</b> ใช่หรือไม่? การกระทำนี้ไม่สามารถเรียกคืนได้
                </ConfirmDelete>
            )}
        </>
    );
}

function UserFormModal({ user, defaultRole = 'STUDENT', isSelf = false, groups, onClose }) {
    const isEdit = Boolean(user);
    const { run, isPending, error } = useServerAction();
    const [role, setRole] = useState(user?.role ?? defaultRole);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        run(() => (isEdit ? updateUser(user.id, formData) : createUser(formData)), onClose);
    };

    return (
        <Modal title={isEdit ? 'แก้ไขข้อมูลผู้ใช้งาน' : role === 'STUDENT' ? 'เพิ่มนักศึกษาใหม่' : 'เพิ่มผู้ใช้งานใหม่'} icon={isEdit ? 'fa-edit' : 'fa-user-plus'} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div className="px-6 pb-6">
                    <ErrorAlert>{error}</ErrorAlert>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>ประเภทผู้ใช้งาน</label>
                            <select name="role" value={role} onChange={(e) => setRole(e.target.value)} disabled={isSelf} className={inputClass}>
                                {Object.entries(ROLE_STYLES).map(([value, r]) => <option key={value} value={value}>{r.label}</option>)}
                            </select>
                            {isSelf && <input type="hidden" name="role" value={role} />}
                        </div>
                        {isEdit && (
                            <div>
                                <label className={labelClass}>สถานะ</label>
                                <select name="status" defaultValue={user.status} disabled={isSelf} className={inputClass}>
                                    <option value="ACTIVE">เปิดใช้งาน</option>
                                    <option value="INACTIVE">ปิดใช้งาน</option>
                                </select>
                                {isSelf && <input type="hidden" name="status" value={user.status} />}
                            </div>
                        )}

                        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>คำนำหน้า</label>
                                <input type="text" name="prefix" defaultValue={user?.prefix ?? ''} placeholder="นาย, นางสาว, ผศ.ดร." className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>ชื่อจริง <span className="text-red-500">*</span></label>
                                <input type="text" name="firstName" required defaultValue={user?.firstName} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>นามสกุล <span className="text-red-500">*</span></label>
                                <input type="text" name="lastName" required defaultValue={user?.lastName} className={inputClass} />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label className={labelClass}>อีเมล <span className="text-red-500">*</span></label>
                            <input type="email" name="email" required defaultValue={user?.email} className={inputClass} />
                        </div>

                        {!isEdit && (
                            <div>
                                <label className={labelClass}>ชื่อผู้ใช้ (Username) <span className="text-red-500">*</span></label>
                                <input type="text" name="username" required autoComplete="off" className={inputClass} />
                            </div>
                        )}
                        <div className={isEdit ? 'sm:col-span-2' : ''}>
                            <label className={labelClass}>
                                {isEdit ? 'เปลี่ยนรหัสผ่าน (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)' : <>รหัสผ่าน <span className="text-red-500">*</span></>}
                            </label>
                            <input
                                type="password" name="password" minLength={6} required={!isEdit}
                                autoComplete="new-password" placeholder={isEdit ? '••••••' : 'อย่างน้อย 6 ตัวอักษร'}
                                className={inputClass}
                            />
                        </div>

                        {role === 'STUDENT' && (
                            <div className="sm:col-span-2 border-t border-gray-100 pt-4 mt-1">
                                <p className="text-sm font-semibold text-gray-700 mb-3"><i className="fas fa-user-graduate mr-2 text-blue-500"></i>ข้อมูลนักศึกษา</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">รหัสนักศึกษา</label>
                                        <input type="text" name="studentId" defaultValue={user?.studentId ?? ''} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">สาขาวิชา</label>
                                        <input type="text" name="major" defaultValue={user?.major ?? ''} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">รุ่นปี (เช่น 66)</label>
                                        <input type="number" name="academicYear" min="0" defaultValue={user?.academicYear ?? ''} className={inputClass} />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <label className="block text-xs text-gray-500 mb-1">กลุ่มฝึกงาน</label>
                                    <select name="trainingGroupId" defaultValue={user?.trainingGroupId ?? ''} className={inputClass}>
                                        <option value="">-- ยังไม่จัดกลุ่ม --</option>
                                        {groups.map(g => {
                                            const isCurrent = g.id === user?.trainingGroupId;
                                            const full = g._count.students >= g.capacity && !isCurrent;
                                            return (
                                                <option key={g.id} value={g.id} disabled={full}>
                                                    {g.name} ({g._count.students}/{g.capacity}){full ? ' - เต็ม' : ''}{g.isActive ? '' : ' - ปิดรับ'}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <FormActions isPending={isPending} submitLabel={isEdit ? 'บันทึกการแก้ไข' : 'บันทึก'} onCancel={onClose} />
            </form>
        </Modal>
    );
}
