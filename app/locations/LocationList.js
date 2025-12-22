'use client';

import { useState, useEffect } from 'react';
import { createLocation, updateLocation, deleteLocation } from '../actions/locations';

export default function LocationList({ initialLocations }) {
    const [locations, setLocations] = useState(initialLocations); // In a real app with revalidatePath, this might just match user updates or props
    // Actually, with revalidatePath, the prop will update. But to be safe and responsive, we can trust the prop from the server parent.
    // However, if we want optimistic updates, we need state. simpler to just use router.refresh() or trust revalidatePath + prop update.
    // Since this is a Client Component receiving props from a Server Component, when the Server Action revalidates, the Server Component re-renders and passes new props.
    // So using `initialLocations` directly in render is better if we trust the refresh.

    // UI State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);

    // Form States
    const [error, setError] = useState('');

    // Filtering State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProvince, setFilterProvince] = useState('จังหวัดทั้งหมด');
    const [filterType, setFilterType] = useState('ประเภททั้งหมด');

    // Sync props to state and apply filters
    useEffect(() => {
        let result = initialLocations;

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(loc =>
                loc.name.toLowerCase().includes(lowerTerm) ||
                loc.address?.toLowerCase().includes(lowerTerm)
            );
        }

        if (filterProvince !== 'จังหวัดทั้งหมด') {
            result = result.filter(loc => loc.province === filterProvince);
        }

        if (filterType !== 'ประเภททั้งหมด') {
            // Mapping UI text to DB enum if needed, but strict matching first
            // The Select options below user Thai text but DB might have ENUMs or strict strings.
            // Looking at mockup, DB likely stores ENUM or String.
            // The add/edit modal uses ENUM values (HOSPITAL_GENERAL etc).
            // The display table renders {location.type}.
            // So I need to match carefully.
            // Wait, the select options in Add/Edit modal use: HOSPITAL_GENERAL, etc.
            // The display shows "HOSPITAL_GENERAL" (raw) currently?
            // In page.js before, static data had Thai types "โรงพยาบาลศูนย์".
            // My Server Action saves the ENUM value.
            // So the table will show ENUM value "HOSPITAL_GENERAL".
            // And this filter dropdown has Thai text.
            // So I need a mapping function or update the filter values to match ENUMs.
            // Let's assume for now I should filter by what's displayed.
            // Actually, I'll update the Filter Select to use ENUM values to be consistent.
            // Or update the table to display mapped Thai text.
            // Let's map ENUM to Thai in the table render, and filter based on ENUM.

            // Quick Fix: Let's just filter by exact match for now, assuming I update the dropdown to use ENUM values as values?
            // Or better, let's keep Thai labels in dropdown and map them to ENUMs for filtering.

            // Map Thai Label to Enum for filtering
            const typeMap = {
                'โรงพยาบาลศูนย์': 'HOSPITAL_CENTER',
                'โรงพยาบาลทั่วไป': 'HOSPITAL_GENERAL',
                'โรงพยาบาลชุมชน': 'HOSPITAL_COMMUNITY',
                'สถานีอนามัย': 'HEALTH_CENTER'
            };
            const enumVal = typeMap[filterType];
            if (enumVal) {
                result = result.filter(loc => loc.type === enumVal);
            }
        }

        setLocations(result);
    }, [initialLocations, searchTerm, filterProvince, filterType]);

    const handleCreate = async (formData) => {
        const result = await createLocation(formData);
        if (result.error) {
            setError(result.error);
        } else {
            setIsAddModalOpen(false);
            // Optional: Optimistic update or trust server revalidation
        }
    };

    const handleUpdate = async (formData) => {
        if (!currentLocation) return;
        const result = await updateLocation(currentLocation.id, formData);
        if (result.error) {
            setError(result.error);
        } else {
            setIsEditModalOpen(false);
            setCurrentLocation(null);
        }
    };

    const handleDelete = async () => {
        if (!currentLocation) return;
        const result = await deleteLocation(currentLocation.id);
        if (result.error) {
            alert(result.error);
        } else {
            setIsDeleteModalOpen(false);
            setCurrentLocation(null);
        }
    };

    const openEdit = (location) => {
        setCurrentLocation(location);
        setIsEditModalOpen(true);
    };

    const openDelete = (location) => {
        setCurrentLocation(location);
        setIsDeleteModalOpen(true);
    };

    // Helper for Type Label
    const getTypeLabel = (type) => {
        const typeMap = {
            'HOSPITAL_CENTER': 'โรงพยาบาลศูนย์',
            'HOSPITAL_GENERAL': 'โรงพยาบาลทั่วไป',
            'HOSPITAL_COMMUNITY': 'โรงพยาบาลชุมชน',
            'HEALTH_CENTER': 'สถานีอนามัย',
            'OTHER': 'อื่นๆ'
        };
        return typeMap[type] || type;
    };

    // Status Logic
    const getStatusInfo = (status) => {
        switch (status) {
            case 'ACTIVE': return { label: 'เปิดใช้งาน', className: 'bg-green-100 text-green-800' };
            case 'INACTIVE': return { label: 'ปิดใช้งาน', className: 'bg-red-100 text-red-800' };
            case 'PENDING': return { label: 'กำลังประสานงาน', className: 'bg-yellow-100 text-yellow-800' };
            default: return { label: status, className: 'bg-gray-100 text-gray-800' };
        }
    }

    return (
        <>
            {/* Page Header */}
            <div className="bg-white rounded-lg card-shadow p-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            <i className="fas fa-building mr-2 text-blue-600"></i> รายชื่อแหล่งฝึกงาน
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">เพิ่ม/แก้ไข/ลบ ข้อมูลสถานที่ฝึกงานสำหรับนักศึกษา</p>
                    </div>

                    <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center">
                        <i className="fas fa-plus mr-2"></i> เพิ่มแหล่งฝึกงาน
                    </button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg card-shadow p-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4">
                    <div className="relative w-full md:w-64">
                        <i className="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
                        <input
                            type="text"
                            placeholder="ค้นหาแหล่งฝึกงาน..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm w-full"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <div className="relative">
                            <select
                                value={filterProvince}
                                onChange={(e) => setFilterProvince(e.target.value)}
                                className="block appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm w-full sm:w-auto">
                                <option>จังหวัดทั้งหมด</option>
                                <option>พิษณุโลก</option>
                                <option>อุตรดิตถ์</option>
                                <option>สุโขทัย</option>
                                <option>เพชรบูรณ์</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <i className="fas fa-chevron-down text-xs"></i>
                            </div>
                        </div>

                        <div className="relative">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="block appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm w-full sm:w-auto">
                                <option>ประเภททั้งหมด</option>
                                <option>โรงพยาบาลศูนย์</option>
                                <option>โรงพยาบาลทั่วไป</option>
                                <option>โรงพยาบาลชุมชน</option>
                                <option>สถานีอนามัย</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <i className="fas fa-chevron-down text-xs"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Training Sites Table */}
            <div className="bg-white rounded-lg card-shadow overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลำดับ</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อแหล่งฝึกงาน</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จังหวัด</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนกลุ่ม</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {locations.map((location, index) => {
                                const statusInfo = getStatusInfo(location.status);
                                return (
                                    <tr key={location.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{location.name}</div>
                                            <div className="text-sm text-gray-500">{location.address}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getTypeLabel(location.type)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{location.province}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0 กลุ่ม</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.className}`}>
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEdit(location)} className="text-blue-600 hover:text-blue-900 mr-3 transition-colors">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button onClick={() => openDelete(location)} className="text-red-600 hover:text-red-900 transition-colors">
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {locations.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                        ไม่พบข้อมูลแหล่งฝึกงาน
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="relative p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="text-lg font-medium text-gray-900">เพิ่มแหล่งฝึกงานใหม่</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form action={handleCreate} className="mt-4">
                            {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">ชื่อแหล่งฝึกงาน <span className="text-red-500">*</span></label>
                                <input name="name" type="text" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">ที่อยู่</label>
                                <input name="address" type="text" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">จังหวัด</label>
                                    <input name="province" type="text" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">ประเภท</label>
                                    <select name="type" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                        <option value="HOSPITAL_GENERAL">โรงพยาบาลทั่วไป</option>
                                        <option value="HOSPITAL_CENTER">โรงพยาบาลศูนย์</option>
                                        <option value="HOSPITAL_COMMUNITY">โรงพยาบาลชุมชน</option>
                                        <option value="HEALTH_CENTER">สถานีอนามัย</option>
                                        <option value="OTHER">อื่นๆ</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 mr-2">ยกเลิก</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">บันทึก</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && currentLocation && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="relative p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="text-lg font-medium text-gray-900">แก้ไขแหล่งฝึกงาน</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form action={handleUpdate} className="mt-4">
                            {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">ชื่อแหล่งฝึกงาน <span className="text-red-500">*</span></label>
                                <input name="name" type="text" defaultValue={currentLocation.name} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">ที่อยู่</label>
                                <input name="address" type="text" defaultValue={currentLocation.address} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">จังหวัด</label>
                                    <input name="province" type="text" defaultValue={currentLocation.province} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">ประเภท</label>
                                    <select name="type" defaultValue={currentLocation.type} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                        <option value="HOSPITAL_GENERAL">โรงพยาบาลทั่วไป</option>
                                        <option value="HOSPITAL_CENTER">โรงพยาบาลศูนย์</option>
                                        <option value="HOSPITAL_COMMUNITY">โรงพยาบาลชุมชน</option>
                                        <option value="HEALTH_CENTER">สถานีอนามัย</option>
                                        <option value="OTHER">อื่นๆ</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">สถานะ</label>
                                <select name="status" defaultValue={currentLocation.status} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                    <option value="ACTIVE">เปิดใช้งาน</option>
                                    <option value="INACTIVE">ปิดใช้งาน</option>
                                    <option value="PENDING">รอดำเนินการ</option>
                                </select>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 mr-2">ยกเลิก</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">บันทึก</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && currentLocation && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <i className="fas fa-trash-alt text-red-600"></i>
                            </div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">ยืนยันการลบ</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    คุณแน่ใจหรือไม่ที่จะลบแหล่งฝึกงาน <b>{currentLocation.name}</b>? การกระทำนี้ไม่สามารถย้อนกลับได้
                                </p>
                            </div>
                            <div className="items-center px-4 py-3">
                                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300">
                                    ยืนยันลบ
                                </button>
                                <button onClick={() => setIsDeleteModalOpen(false)} className="mt-3 px-4 py-2 bg-white text-gray-700 text-base font-medium rounded-md w-full shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300">
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
