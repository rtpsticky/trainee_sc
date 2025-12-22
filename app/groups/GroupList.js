'use client';

import { useState, useRef, useEffect } from 'react';
import { createGroup, updateGroup, deleteGroup } from '../actions/groups';

export default function GroupList({ initialGroups = [], locations = [], teachers = [] }) {
    const [groups, setGroups] = useState(initialGroups);

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentGroup, setCurrentGroup] = useState(null);
    const [error, setError] = useState('');

    // Custom Advisor Selection State
    const [selectedAdvisors, setSelectedAdvisors] = useState([]);
    const [advisorSearch, setAdvisorSearch] = useState('');
    const [isAdvisorDropdownOpen, setIsAdvisorDropdownOpen] = useState(false);
    const advisorDropdownRef = useRef(null);

    // Initial Filtered Teachers (exclude already selected ones)
    const filteredTeachers = teachers.filter(t =>
        !selectedAdvisors.some(sa => sa.id === t.id) &&
        (t.firstName.toLowerCase().includes(advisorSearch.toLowerCase()) ||
            t.lastName.toLowerCase().includes(advisorSearch.toLowerCase()))
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (advisorDropdownRef.current && !advisorDropdownRef.current.contains(event.target)) {
                setIsAdvisorDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Handlers
    const openAdd = () => {
        setError('');
        setCurrentGroup(null);
        setSelectedAdvisors([]);
        setAdvisorSearch('');
        setIsAddModalOpen(true);
    };

    const openEdit = (group) => {
        setError('');
        setCurrentGroup(group);
        // Pre-populate selected advisors
        setSelectedAdvisors(group.advisors || []);
        setAdvisorSearch('');
        setIsEditModalOpen(true);
    };

    const openDelete = (group) => {
        setCurrentGroup(group);
        setIsDeleteModalOpen(true);
    };

    const handleAddAdvisor = (teacher) => {
        setSelectedAdvisors([...selectedAdvisors, teacher]);
        setAdvisorSearch('');
        // Keep focus or let user search again
    };

    const handleRemoveAdvisor = (teacherId) => {
        setSelectedAdvisors(selectedAdvisors.filter(t => t.id !== teacherId));
    };

    // Actions
    const handleCreate = async (formData) => {
        // Validation for Advisors is optional but good UX
        const result = await createGroup(formData);
        if (result.error) {
            setError(result.error);
        } else {
            setIsAddModalOpen(false);
        }
    };

    const handleUpdate = async (formData) => {
        if (!currentGroup) return;
        const result = await updateGroup(currentGroup.id, formData);
        if (result.error) {
            setError(result.error);
        } else {
            setIsEditModalOpen(false);
            setCurrentGroup(null);
        }
    };

    const handleDelete = async () => {
        if (!currentGroup) return;
        const result = await deleteGroup(currentGroup.id);
        if (result.error) {
            alert(result.error);
        } else {
            setIsDeleteModalOpen(false);
            setCurrentGroup(null);
        }
    };

    // Helper to format date
    const formatDate = (dateString, type = 'display') => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (type === 'value') {
            return date.toISOString().split('T')[0];
        }
        return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <>
            {/* Stats Cards - Modern Design */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">กลุ่มฝึกงานทั้งหมด</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-2">{groups.length}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <i className="fas fa-layer-group text-xl"></i>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">นักศึกษาในระบบ</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-2">{initialGroups.reduce((acc, g) => acc + (g._count?.students || 0), 0)}</h3>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg text-green-600">
                            <i className="fas fa-user-graduate text-xl"></i>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">อาจารย์ที่ปรึกษา</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-2">{teachers.length}</h3>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                            <i className="fas fa-chalkboard-teacher text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Custom Toolbar */}
                <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">รายการกลุ่มฝึกงาน</h2>
                        <p className="text-sm text-gray-500">จัดการข้อมูลกลุ่มฝึกงานและการมอบหมายอาจารย์</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อกลุ่ม..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm w-full sm:w-64 transition-all"
                            />
                        </div>
                        <button onClick={openAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center text-sm font-medium">
                            <i className="fas fa-plus mr-2"></i> สร้างกลุ่มใหม่
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 uppercase tracking-wider text-xs font-semibold text-gray-500">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left">กลุ่มฝึกงาน / รุ่น</th>
                                <th scope="col" className="px-6 py-4 text-left">สถานที่และระยะเวลา</th>
                                <th scope="col" className="px-6 py-4 text-left">อาจารย์ที่ปรึกษา</th>
                                <th scope="col" className="px-6 py-4 text-left">ความคืบหน้า</th>
                                <th scope="col" className="px-6 py-4 text-center">สถานะ</th>
                                <th scope="col" className="px-6 py-4 text-right">ตัวเลือก</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {initialGroups.map((group) => (
                                <tr key={group.id} className="hover:bg-blue-50/30 transition-colors group">
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
                                        <div className="flex items-center text-xs text-gray-500">
                                            <span>{formatDate(group.startDate)}</span>
                                            <span className="mx-2 text-gray-300">|</span>
                                            <span>{formatDate(group.endDate)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        <div className="flex flex-wrap gap-1">
                                            {group.advisors && group.advisors.length > 0 ? (
                                                group.advisors.map((advisor, idx) => (
                                                    <span key={advisor.id} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                                        {advisor.prefix}{advisor.firstName}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-red-400 italic">ยังไม่ระบุ</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                                        <div className="w-full max-w-[140px]">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="font-medium text-gray-600">รับแล้ว {group._count?.students || 0}</span>
                                                <span className="text-gray-400">จาก {group.capacity}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-1.5 rounded-full ${((group._count?.students || 0) / group.capacity) >= 1 ? 'bg-red-500' : 'bg-green-500'}`}
                                                    style={{ width: `${Math.min(((group._count?.students || 0) / group.capacity) * 100, 100)}%` }}
                                                ></div>
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
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => openEdit(group)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="แก้ไข">
                                                <i className="fas fa-pen"></i>
                                            </button>
                                            <button onClick={() => openDelete(group)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="ลบ">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {initialGroups.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500 bg-gray-50/50">
                                        <div className="flex flex-col items-center justify-center">
                                            <i className="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
                                            <p>ไม่พบข้อมูลกลุ่มฝึกงาน</p>
                                            <button onClick={openAdd} className="mt-4 text-blue-600 hover:underline text-sm font-medium">
                                                สร้างกลุ่มใหม่ +
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reuseable Form Modal Content (Internal Component) */}
            {/* Note: In a larger app, this would be a separate file */}

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto font-sans" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-opacity-60 transition-opacity" onClick={() => setIsAddModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-top sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-top bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:mt-24 sm:align-top sm:max-w-2xl w-full relative z-10">
                            <form action={handleCreate}>
                                <div className="bg-white px-6 py-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                            <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-lg">
                                                <i className="fas fa-plus"></i>
                                            </span>
                                            สร้างกลุ่มฝึกงานใหม่
                                        </h3>
                                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                                            <i className="fas fa-times text-xl"></i>
                                        </button>
                                    </div>

                                    {error && <div className="mb-6 px-4 py-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r shadow-sm">
                                        <span className="font-bold mr-2">ผิดพลาด!</span> {error}
                                    </div>}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Left Column: Basic Info */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อกลุ่มฝึกงาน <span className="text-red-500">*</span></label>
                                                <input type="text" name="name" required placeholder="ระบุชื่อกลุ่ม..." className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">รุ่นปีการศึกษา <span className="text-red-500">*</span></label>
                                                <input type="text" name="generation" required placeholder="เช่น 66" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">สถานที่ฝึกงาน <span className="text-red-500">*</span></label>
                                                <select name="locationId" required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border bg-white">
                                                    <option value="">-- เลือกสถานที่ --</option>
                                                    {locations.map(loc => (
                                                        <option key={loc.id} value={loc.id}>{loc.name} ({loc.province})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">เริ่มวันที่</label>
                                                    <input type="date" name="startDate" required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">ถึงวันที่</label>
                                                    <input type="date" name="endDate" required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column: Advisors & Details */}
                                        <div className="space-y-4">
                                            {/* Custom Advisor Selector */}
                                            <div ref={advisorDropdownRef} className="relative">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">อาจารย์ที่ปรึกษา</label>
                                                {/* Hidden inputs to submit standard form data */}
                                                {selectedAdvisors.map(teacher => (
                                                    <input key={teacher.id} type="hidden" name="advisorIds" value={teacher.id} />
                                                ))}

                                                <div className="bg-white border border-gray-300 rounded-lg p-2 min-h-[42px] flex flex-wrap gap-2 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                                                    {selectedAdvisors.map(teacher => (
                                                        <span key={teacher.id} className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 animate-fadeIn">
                                                            {teacher.prefix}{teacher.firstName} {teacher.lastName}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveAdvisor(teacher.id)}
                                                                className="ml-1.5 text-blue-400 hover:text-blue-600 focus:outline-none"
                                                            >
                                                                <i className="fas fa-times"></i>
                                                            </button>
                                                        </span>
                                                    ))}
                                                    <input
                                                        type="text"
                                                        className="flex-1 outline-none text-sm min-w-[100px] bg-transparent"
                                                        placeholder={selectedAdvisors.length === 0 ? "ค้นหาอาจารย์..." : ""}
                                                        value={advisorSearch}
                                                        onChange={(e) => {
                                                            setAdvisorSearch(e.target.value);
                                                            setIsAdvisorDropdownOpen(true);
                                                        }}
                                                        onFocus={() => setIsAdvisorDropdownOpen(true)}
                                                    />
                                                </div>

                                                {/* Dropdown Results */}
                                                {isAdvisorDropdownOpen && filteredTeachers.length > 0 && (
                                                    <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-48 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm animate-fadeIn">
                                                        {filteredTeachers.map(teacher => (
                                                            <div
                                                                key={teacher.id}
                                                                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 hover:text-blue-900 text-gray-900 border-b border-gray-50 last:border-0"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleAddAdvisor(teacher);
                                                                }}
                                                            >
                                                                <div className="flex items-center">
                                                                    <div className="ml-2">
                                                                        <span className="block font-medium">{teacher.prefix}{teacher.firstName} {teacher.lastName}</span>
                                                                        <span className="block text-xs text-gray-500">{teacher.email}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">จำนวนรับ (คน)</label>
                                                <input type="number" name="capacity" defaultValue={5} min="1" required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border" />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">รายละเอียดเพิ่มเติม</label>
                                                <textarea name="description" rows="3" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border resize-none"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white px-6 py-4 flex flex-row-reverse border-t border-gray-100">
                                    <button type="submit" className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-2.5 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto transition-all">
                                        บันทึกข้อมูล
                                    </button>
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-6 py-2.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto transition-all">
                                        ยกเลิก
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal - Reusing structure but with defaultValue */}
            {isEditModalOpen && currentGroup && (
                <div className="fixed inset-0 z-50 overflow-y-auto font-sans" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => setIsEditModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-top sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-top bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:mt-24 sm:align-top sm:max-w-2xl w-full relative z-10">
                            <form action={handleUpdate}>
                                <div className="bg-white px-6 py-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                            <span className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mr-3 text-lg">
                                                <i className="fas fa-edit"></i>
                                            </span>
                                            แก้ไขกลุ่มฝึกงาน
                                        </h3>
                                        <div className="flex items-center gap-4">
                                            <label className="inline-flex items-center cursor-pointer">
                                                <input type="checkbox" name="isActive" value="true" defaultChecked={currentGroup.isActive} className="sr-only peer" />
                                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                <span className="ms-3 text-sm font-medium text-gray-700">เปิดรับ</span>
                                            </label>
                                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                                                <i className="fas fa-times text-xl"></i>
                                            </button>
                                        </div>
                                    </div>

                                    {error && <div className="mb-6 px-4 py-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r shadow-sm">
                                        <span className="font-bold mr-2">ผิดพลาด!</span> {error}
                                    </div>}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Left Column: Basic Info */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อกลุ่มฝึกงาน <span className="text-red-500">*</span></label>
                                                <input type="text" name="name" defaultValue={currentGroup.name} required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">รุ่นปีการศึกษา <span className="text-red-500">*</span></label>
                                                <input type="text" name="generation" defaultValue={currentGroup.generation} required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">สถานที่ฝึกงาน <span className="text-red-500">*</span></label>
                                                <select name="locationId" defaultValue={currentGroup.locationId} required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border bg-white">
                                                    {locations.map(loc => (
                                                        <option key={loc.id} value={loc.id}>{loc.name} ({loc.province})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">เริ่มวันที่</label>
                                                    <input type="date" name="startDate" defaultValue={formatDate(currentGroup.startDate, 'value')} required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">ถึงวันที่</label>
                                                    <input type="date" name="endDate" defaultValue={formatDate(currentGroup.endDate, 'value')} required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column: Advisors & Details */}
                                        <div className="space-y-4">
                                            {/* Custom Advisor Selector */}
                                            <div ref={advisorDropdownRef} className="relative">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">อาจารย์ที่ปรึกษา</label>
                                                {/* Hidden inputs to submit standard form data */}
                                                {selectedAdvisors.map(teacher => (
                                                    <input key={teacher.id} type="hidden" name="advisorIds" value={teacher.id} />
                                                ))}

                                                <div className="bg-white border border-gray-300 rounded-lg p-2 min-h-[42px] flex flex-wrap gap-2 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                                                    {selectedAdvisors.map(teacher => (
                                                        <span key={teacher.id} className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 animate-fadeIn">
                                                            {teacher.prefix}{teacher.firstName} {teacher.lastName}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveAdvisor(teacher.id)}
                                                                className="ml-1.5 text-blue-400 hover:text-blue-600 focus:outline-none"
                                                            >
                                                                <i className="fas fa-times"></i>
                                                            </button>
                                                        </span>
                                                    ))}
                                                    <input
                                                        type="text"
                                                        className="flex-1 outline-none text-sm min-w-[100px] bg-transparent"
                                                        placeholder={selectedAdvisors.length === 0 ? "ค้นหาอาจารย์..." : ""}
                                                        value={advisorSearch}
                                                        onChange={(e) => {
                                                            setAdvisorSearch(e.target.value);
                                                            setIsAdvisorDropdownOpen(true);
                                                        }}
                                                        onFocus={() => setIsAdvisorDropdownOpen(true)}
                                                    />
                                                </div>

                                                {/* Dropdown Results */}
                                                {isAdvisorDropdownOpen && filteredTeachers.length > 0 && (
                                                    <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-48 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm animate-fadeIn">
                                                        {filteredTeachers.map(teacher => (
                                                            <div
                                                                key={teacher.id}
                                                                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 hover:text-blue-900 text-gray-900 border-b border-gray-50 last:border-0"
                                                                onClick={() => handleAddAdvisor(teacher)}
                                                            >
                                                                <div className="flex items-center">
                                                                    <div className="ml-2">
                                                                        <span className="block font-medium">{teacher.prefix}{teacher.firstName} {teacher.lastName}</span>
                                                                        <span className="block text-xs text-gray-500">{teacher.email}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">จำนวนรับ (คน)</label>
                                                <input type="number" name="capacity" defaultValue={currentGroup.capacity} min="1" required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border" />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">รายละเอียดเพิ่มเติม</label>
                                                <textarea name="description" defaultValue={currentGroup.description} rows="3" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border resize-none"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white px-6 py-4 flex flex-row-reverse border-t border-gray-100">
                                    <button type="submit" className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-2.5 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto transition-all">
                                        บันทึกการแก้ไข
                                    </button>
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-6 py-2.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto transition-all">
                                        ยกเลิก
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal - Modernized */}
            {isDeleteModalOpen && currentGroup && (
                <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => setIsDeleteModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-top sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-top bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:mt-24 sm:align-top sm:max-w-lg w-full relative z-10">
                            <div className="bg-white px-6 py-6">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-12 sm:w-12">
                                        <i className="fas fa-exclamation-triangle text-red-600 text-lg"></i>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-xl leading-6 font-bold text-gray-900">
                                            ยืนยันการลบ
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                คุณต้องการลบกลุ่มฝึกงาน <span className="font-bold text-gray-800">{currentGroup.name}</span> ใช่หรือไม่?
                                                <br />การกระทำนี้ไม่สามารถย้อนกลับได้ และอาจส่งผลกระทบต่อนักศึกษาในกลุ่ม
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white px-6 py-4 sm:flex sm:flex-row-reverse border-t border-gray-100">
                                <button type="button" onClick={handleDelete} className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-all">
                                    ยืนยันการลบ
                                </button>
                                <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all">
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
