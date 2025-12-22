'use client';

import { useState, useEffect } from 'react';
import { createUser, updateUser, deleteUser } from '../actions/users';

export default function UserList({ initialUsers }) {
    const [users, setUsers] = useState(initialUsers);
    const [filterRole, setFilterRole] = useState('ALL'); // ALL, STUDENT, TEACHER, STAFF, ADMIN
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState('');

    // Filter Logic
    useEffect(() => {
        let result = initialUsers;

        if (filterRole !== 'ALL') {
            result = result.filter(u => u.role === filterRole);
        }

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(u =>
                u.firstName.toLowerCase().includes(lowerTerm) ||
                u.lastName.toLowerCase().includes(lowerTerm) ||
                u.username.toLowerCase().includes(lowerTerm) ||
                (u.studentId && u.studentId.toLowerCase().includes(lowerTerm))
            );
        }

        setUsers(result);
    }, [initialUsers, filterRole, searchTerm]);

    // Modal Handlers
    const openAdd = () => {
        setError('');
        setCurrentUser(null);
        setIsAddModalOpen(true);
    };

    const openEdit = (user) => {
        setError('');
        setCurrentUser(user);
        setIsEditModalOpen(true);
    };

    const openDelete = (user) => {
        setCurrentUser(user);
        setIsDeleteModalOpen(true);
    };

    // Actions
    const handleCreate = async (formData) => {
        const result = await createUser(formData);
        if (result.error) {
            setError(result.error);
        } else {
            setIsAddModalOpen(false);
            // Optional: Optimistic update
        }
    };

    const handleUpdate = async (formData) => {
        if (!currentUser) return;
        const result = await updateUser(currentUser.id, formData);
        if (result.error) {
            setError(result.error);
        } else {
            setIsEditModalOpen(false);
            setCurrentUser(null);
        }
    };

    const handleDelete = async () => {
        if (!currentUser) return;
        const result = await deleteUser(currentUser.id);
        if (result.error) {
            alert(result.error);
        } else {
            setIsDeleteModalOpen(false);
            setCurrentUser(null);
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'STUDENT': return { label: 'นักศึกษา', className: 'bg-blue-100 text-blue-800' };
            case 'TEACHER': return { label: 'อาจารย์', className: 'bg-green-100 text-green-800' };
            case 'STAFF': return { label: 'เจ้าหน้าที่', className: 'bg-red-100 text-red-800' };
            case 'ADMIN': return { label: 'ผู้บริหาร', className: 'bg-purple-100 text-purple-800' };
            default: return { label: role, className: 'bg-gray-100 text-gray-800' };
        }
    };

    // Tabs Config
    const tabs = [
        { id: 'ALL', label: 'ผู้ใช้งานทั้งหมด', icon: 'fa-list', color: 'text-gray-500' },
        { id: 'STUDENT', label: 'นักศึกษา', icon: 'fa-user-graduate', color: 'text-blue-500' },
        { id: 'TEACHER', label: 'อาจารย์', icon: 'fa-chalkboard-teacher', color: 'text-green-500' },
        { id: 'STAFF', label: 'เจ้าหน้าที่', icon: 'fa-user-tie', color: 'text-red-500' },
        { id: 'ADMIN', label: 'ผู้บริหาร', icon: 'fa-user-shield', color: 'text-purple-500' },
    ];

    return (
        <>
            {/* Stats Cards (Mock for now, or passed props) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg card-shadow p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">นักศึกษา</p>
                            <p className="text-2xl font-bold">{initialUsers.filter(u => u.role === 'STUDENT').length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <i className="fas fa-user-graduate text-blue-600 text-xl"></i>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg card-shadow p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">อาจารย์</p>
                            <p className="text-2xl font-bold">{initialUsers.filter(u => u.role === 'TEACHER').length}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <i className="fas fa-chalkboard-teacher text-green-600 text-xl"></i>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg card-shadow p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">เจ้าหน้าที่</p>
                            <p className="text-2xl font-bold">{initialUsers.filter(u => u.role === 'STAFF').length}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <i className="fas fa-user-tie text-red-600 text-xl"></i>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg card-shadow p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">ผู้บริหาร</p>
                            <p className="text-2xl font-bold">{initialUsers.filter(u => u.role === 'ADMIN').length}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <i className="fas fa-user-shield text-purple-600 text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-lg card-shadow overflow-hidden mb-6">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setFilterRole(tab.id)}
                                className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap focus:outline-none transition-colors ${filterRole === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <i className={`fas ${tab.icon} mr-2 ${filterRole === tab.id ? 'text-blue-600' : 'text-gray-400'}`}></i>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4">
                    <div className="flex items-center space-x-2">
                        <button onClick={openAdd} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm font-medium">
                            <i className="fas fa-plus mr-2"></i> เพิ่มผู้ใช้งาน
                        </button>
                    </div>

                    <div className="relative w-full md:w-64">
                        <i className="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อ, รหัส..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm w-full"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-สกุล / ชื่อผู้ใช้</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อีเมล</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สิทธิ์การใช้งาน</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => {
                                const roleInfo = getRoleLabel(user.role);
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${roleInfo.className.replace('text-', 'bg-').replace('bg-', 'text-opacity-20 ')}`}>
                                                    <i className={`fas ${user.role === 'STUDENT' ? 'fa-user-graduate' :
                                                            user.role === 'TEACHER' ? 'fa-chalkboard-teacher' :
                                                                'fa-user'
                                                        } text-lg`}></i>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.prefix} {user.firstName} {user.lastName}</div>
                                                    <div className="text-sm text-gray-500">{user.username} {user.studentId ? `(${user.studentId})` : ''}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleInfo.className}`}>
                                                {roleInfo.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.status === 'ACTIVE' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEdit(user)} className="text-blue-600 hover:text-blue-900 mr-3 transition-colors">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button onClick={() => openDelete(user)} className="text-red-600 hover:text-red-900 transition-colors">
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                        ไม่พบข้อมูลผู้ใช้งาน
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsAddModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <form action={handleCreate}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                                        <i className="fas fa-user-plus mr-2 text-blue-600"></i> เพิ่มผู้ใช้งานใหม่
                                    </h3>

                                    {error && <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded">{error}</div>}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทผู้ใช้งาน</label>
                                            <select name="role" required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3 border">
                                                <option value="STUDENT">นักศึกษา</option>
                                                <option value="TEACHER">อาจารย์</option>
                                                <option value="STAFF">เจ้าหน้าที่</option>
                                                <option value="ADMIN">ผู้บริหาร (Admin)</option>
                                            </select>
                                        </div>

                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">คำนำหน้า</label>
                                            <input type="text" name="prefix" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3 border" placeholder="เช่น นาย, นางสาว" />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            {/* Spacer or Student ID logic could go here later if dynamic form */}
                                        </div>

                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อจริง</label>
                                            <input type="text" name="firstName" required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3 border" />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
                                            <input type="text" name="lastName" required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3 border" />
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                                            <input type="email" name="email" required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3 border" />
                                        </div>

                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้ (Username)</label>
                                            <input type="text" name="username" required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3 border" />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
                                            <input type="password" name="password" required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3 border" />
                                        </div>

                                        {/* Optional Fields (Example: Show hints or JS toggle in future) */}
                                        <div className="col-span-2 border-t pt-2 mt-2">
                                            <p className="text-xs text-gray-500 mb-2">ข้อมูลสำหรับนักศึกษา (ถ้ามี)</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                <input type="text" name="studentId" placeholder="รหัสนักศึกษา" className="border-gray-300 rounded-md shadow-sm text-sm py-1 px-2 border" />
                                                <input type="text" name="major" placeholder="สาขาวิชา" className="border-gray-300 rounded-md shadow-sm text-sm py-1 px-2 border" />
                                                <input type="number" name="academicYear" placeholder="รุ่นปี (เช่น 66)" className="border-gray-300 rounded-md shadow-sm text-sm py-1 px-2 border" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                                        บันทึก
                                    </button>
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                        ยกเลิก
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && currentUser && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsEditModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <form action={handleUpdate}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        <i className="fas fa-edit mr-2 text-blue-600"></i> แก้ไขข้อมูลผู้ใช้งาน
                                    </h3>

                                    {error && <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded">{error}</div>}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทผู้ใช้งาน (เปลี่ยนได้)</label>
                                            <select name="role" defaultValue={currentUser.role} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3 border">
                                                <option value="STUDENT">นักศึกษา</option>
                                                <option value="TEACHER">อาจารย์</option>
                                                <option value="STAFF">เจ้าหน้าที่</option>
                                                <option value="ADMIN">ผู้บริหาร (Admin)</option>
                                            </select>
                                        </div>

                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">คำนำหน้า</label>
                                            <input type="text" name="prefix" defaultValue={currentUser.prefix} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3 border" />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                                            <select name="status" defaultValue={currentUser.status} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3 border">
                                                <option value="ACTIVE">เปิดใช้งาน</option>
                                                <option value="INACTIVE">ปิดใช้งาน</option>
                                            </select>
                                        </div>

                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อจริง</label>
                                            <input type="text" name="firstName" defaultValue={currentUser.firstName} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3 border" />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
                                            <input type="text" name="lastName" defaultValue={currentUser.lastName} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3 border" />
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                                            <input type="email" name="email" defaultValue={currentUser.email} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3 border" />
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">เปลี่ยนรหัสผ่าน (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)</label>
                                            <input type="password" name="password" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3 border" placeholder="****" />
                                        </div>

                                        {/* Optional Fields (Values) */}
                                        <div className="col-span-2 border-t pt-2 mt-2">
                                            <p className="text-xs text-gray-500 mb-2">ข้อมูลสำหรับนักศึกษา</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                <input type="text" name="studentId" defaultValue={currentUser.studentId} placeholder="รหัสนักศึกษา" className="border-gray-300 rounded-md shadow-sm text-sm py-1 px-2 border" />
                                                <input type="text" name="major" defaultValue={currentUser.major} placeholder="สาขาวิชา" className="border-gray-300 rounded-md shadow-sm text-sm py-1 px-2 border" />
                                                <input type="number" name="academicYear" defaultValue={currentUser.academicYear} placeholder="รุ่นปี" className="border-gray-300 rounded-md shadow-sm text-sm py-1 px-2 border" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                                        บันทึกการแก้ไข
                                    </button>
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                        ยกเลิก
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && currentUser && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsDeleteModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <i className="fas fa-exclamation-triangle text-red-600"></i>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            ยืนยันการลบผู้ใช้งาน
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                คุณต้องการลบผู้ใช้งาน <b>{currentUser.firstName} {currentUser.lastName}</b> ใช่หรือไม่?
                                                <br />การกระทำนี้ไม่สามารถเรียกคืนได้
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button type="button" onClick={handleDelete} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                                    ลบข้อมูล
                                </button>
                                <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                    ยกเลิก
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
