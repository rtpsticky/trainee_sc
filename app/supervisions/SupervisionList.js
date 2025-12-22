'use client';

import { useState, useRef, useEffect } from 'react';
import { createSupervision, updateSupervision, deleteSupervision } from '../actions/supervisions';


export default function SupervisionList({ initialSupervisions = [], students = [], currentUser }) {
    const [supervisions, setSupervisions] = useState(initialSupervisions);
    const [filteredSupervisions, setFilteredSupervisions] = useState(initialSupervisions);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [currentSupervision, setCurrentSupervision] = useState(null);

    // Filters
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('DATE_DESC'); // DATE_DESC, DATE_ASC, NAME

    // Stats
    const totalCount = supervisions.length;
    const pendingCount = supervisions.filter(s => s.status === 'PENDING').length;
    const completedCount = supervisions.filter(s => s.status === 'COMPLETED').length;
    const cancelledCount = supervisions.filter(s => s.status === 'CANCELLED').length;

    useEffect(() => {
        let result = [...supervisions];

        // Filter by Status
        if (statusFilter !== 'ALL') {
            result = result.filter(s => s.status === statusFilter);
        }

        // Filter by Search
        if (searchText) {
            const lowerSearch = searchText.toLowerCase();
            result = result.filter(s =>
                s.student.firstName.toLowerCase().includes(lowerSearch) ||
                s.student.lastName.toLowerCase().includes(lowerSearch) ||
                (s.student.studentId && s.student.studentId.includes(searchText)) ||
                (s.locationName && s.locationName.toLowerCase().includes(lowerSearch))
            );
        }

        // Sort
        result.sort((a, b) => {
            if (sortOrder === 'DATE_DESC') return new Date(b.date) - new Date(a.date);
            if (sortOrder === 'DATE_ASC') return new Date(a.date) - new Date(b.date);
            if (sortOrder === 'NAME') return a.student.firstName.localeCompare(b.student.firstName);
            return 0;
        });

        setFilteredSupervisions(result);
    }, [supervisions, searchText, statusFilter, sortOrder]);

    async function handleCreate(formData) {
        // Append supervisorId from current user session if available
        if (currentUser?.id) {
            formData.append('supervisorId', currentUser.id);
        } else {
            // Fallback for demo if no session, though in real app this should be blocked or handled
            // Assuming the user is an admin/teacher
            // formData.append('supervisorId', '1'); 
            alert("Error: User session not found. Cannot create supervision.");
            return;
        }

        const result = await createSupervision(formData);
        if (result.success) {
            setIsCreateModalOpen(false);
            // In a real app with revalidatePath, the page might reload or we'd fetch fresh data.
            // For immediate feedback without full reload if using client-side state mostly:
            // window.location.reload(); 
        } else {
            alert(result.error);
        }
    }

    async function handleUpdate(formData) {
        const result = await updateSupervision(formData);
        if (result.success) {
            setIsDetailModalOpen(false);
            setCurrentSupervision(null);
            // window.location.reload();
        } else {
            alert(result.error);
        }
    }

    async function handleDelete(id) {
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลการนิเทศนี้?')) return;
        const result = await deleteSupervision(id);
        if (result.success) {
            setIsDetailModalOpen(false);
            // window.location.reload();
        } else {
            alert(result.error);
        }
    }

    const openDetail = (supervision) => {
        setCurrentSupervision(supervision);
        setIsDetailModalOpen(true);
    };

    // Helper to format date th-TH
    const formatDate = (dateString, timeString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard title="การนิเทศทั้งหมด" count={totalCount} icon="fa-calendar-check" color="blue" />
                <StatCard title="รอดำเนินการ" count={pendingCount} icon="fa-clock" color="yellow" />
                <StatCard title="เสร็จสิ้นแล้ว" count={completedCount} icon="fa-check-circle" color="green" />
                <StatCard title="ยกเลิก/เลื่อน" count={cancelledCount} icon="fa-times-circle" color="red" />
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center transition-colors">
                            <i className="fas fa-plus mr-2"></i> เพิ่มการนิเทศใหม่
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-auto">
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="block w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm"
                            >
                                <option value="DATE_DESC">เรียงตามวันที่ (ล่าสุดก่อน)</option>
                                <option value="DATE_ASC">เรียงตามวันที่ (เก่าสุดก่อน)</option>
                                <option value="NAME">เรียงตามชื่อนักศึกษา</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <i className="fas fa-chevron-down text-xs"></i>
                            </div>
                        </div>

                        <div className="relative w-full sm:w-auto">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="block w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm"
                            >
                                <option value="ALL">แสดงทั้งหมด</option>
                                <option value="PENDING">แสดงเฉพาะรอดำเนินการ</option>
                                <option value="COMPLETED">แสดงเฉพาะเสร็จสิ้น</option>
                                <option value="CANCELLED">แสดงเฉพาะที่ยกเลิก</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <i className="fas fa-chevron-down text-xs"></i>
                            </div>
                        </div>

                        <div className="relative w-full sm:w-auto">
                            <i className="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
                            <input
                                type="text"
                                placeholder="ค้นหานักศึกษา..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่นิเทศ</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">นักศึกษา</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานที่ฝึกงาน</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รูปแบบ</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredSupervisions.map((supervision) => (
                                <tr key={supervision.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {new Date(supervision.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(supervision.date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <i className="fas fa-user-graduate text-blue-600"></i>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {supervision.student.prefix}{supervision.student.firstName} {supervision.student.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {supervision.student.trainingGroup ? supervision.student.trainingGroup.name : 'ยังไม่มีกลุ่ม'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{supervision.locationName || '-'}</div>
                                        {/* Assuming location province might be available if fetching related Location object, otherwise standard text */}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <SupervisionTypeBadge type={supervision.type} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={supervision.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openDetail(supervision)} className="text-blue-600 hover:text-blue-900 mr-3 transition-colors bg-blue-50 hover:bg-blue-100 p-2 rounded-full w-8 h-8 flex items-center justify-center inline-flex">
                                            <i className={`fas ${supervision.status === 'PENDING' ? 'fa-edit' : 'fa-eye'}`}></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredSupervisions.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                        ไม่พบข้อมูลการนิเทศ
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => setIsCreateModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-top sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-top bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:mt-24 sm:align-top sm:max-w-2xl w-full relative z-10">
                            <form action={handleCreate}>
                                <div className="bg-white px-6 py-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                                <i className="fas fa-plus text-blue-600 text-lg"></i>
                                            </div>
                                            เพิ่มการนิเทศใหม่
                                        </h3>
                                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors">
                                            <i className="fas fa-times text-xl"></i>
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">นักศึกษา <span className="text-red-500">*</span></label>
                                            <select name="studentId" required className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border">
                                                <option value="">เลือกนักศึกษา</option>
                                                {students.map(std => (
                                                    <option key={std.id} value={std.id}>
                                                        {std.prefix}{std.firstName} {std.lastName} ({std.studentId}) {std.trainingGroup ? `- ${std.trainingGroup.name}` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">วันที่นิเทศ <span className="text-red-500">*</span></label>
                                                <input type="date" name="date" required className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">เวลานิเทศ <span className="text-red-500">*</span></label>
                                                <input type="time" name="time" required className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">รูปแบบการนิเทศ <span className="text-red-500">*</span></label>
                                                <select name="type" required className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border">
                                                    <option value="ONSITE">นิเทศตัวต่อตัว (Onsite)</option>
                                                    <option value="ONLINE">นิเทศออนไลน์ (Online)</option>
                                                    <option value="PHONE">นิเทศทางโทรศัพท์ (Phone)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">สถานที่นัดหมาย</label>
                                                <input type="text" name="locationName" placeholder="เช่น โรงพยาบาล..." className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">หมายเหตุ / เตรียมเอกสาร</label>
                                            <textarea name="note" rows="3" className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border" placeholder="รายละเอียดเพิ่มเติม..."></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white px-6 py-4 flex flex-row-reverse border-t border-gray-100">
                                    <button type="submit" className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-2.5 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto transition-all">
                                        บันทึกข้อมูล
                                    </button>
                                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-6 py-2.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto transition-all">
                                        ยกเลิก
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail / Update Modal */}
            {isDetailModalOpen && currentSupervision && (
                <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => setIsDetailModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-top sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-top bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:mt-24 sm:align-top sm:max-w-2xl w-full relative z-10">
                            <form action={handleUpdate}>
                                <input type="hidden" name="id" value={currentSupervision.id} />
                                <div className="bg-white px-6 py-6 relative">
                                    <div className="absolute top-4 right-4 flex space-x-2">
                                        {currentSupervision.status !== 'COMPLETED' && currentSupervision.status !== 'CANCELLED' && (
                                            <button type="button" onClick={() => handleDelete(currentSupervision.id)} className="text-red-400 hover:text-red-600 p-2">
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        )}
                                        <button type="button" onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-500 p-2">
                                            <i className="fas fa-times text-xl"></i>
                                        </button>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                            <i className="fas fa-chalkboard-teacher text-blue-600 text-lg"></i>
                                        </div>
                                        รายละเอียดการนิเทศ
                                    </h3>

                                    {/* Info Panel */}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-6 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">นักศึกษา</p>
                                            <p className="font-medium text-gray-900">{currentSupervision.student.prefix}{currentSupervision.student.firstName} {currentSupervision.student.lastName}</p>
                                            <p className="text-sm text-gray-500">{currentSupervision.student.trainingGroup?.name || 'ไม่มีกลุ่ม'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">วัน-เวลานัดหมาย</p>
                                            <p className="font-medium text-gray-900">
                                                {new Date(currentSupervision.date).toLocaleDateString('th-TH', { dateStyle: 'long' })}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(currentSupervision.date).toLocaleTimeString('th-TH', { timeStyle: 'short' })} น.
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">สถานที่</p>
                                            <p className="font-medium text-gray-900">{currentSupervision.locationName || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">รูปแบบ</p>
                                            <SupervisionTypeBadge type={currentSupervision.type} />
                                        </div>
                                        {currentSupervision.note && (
                                            <div className="col-span-2 mt-2 pt-2 border-t border-gray-200">
                                                <p className="text-xs text-gray-500 uppercase font-semibold">หมายเหตุ</p>
                                                <p className="text-sm text-gray-700">{currentSupervision.note}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">สถานะการนิเทศ</label>
                                            <select name="status" defaultValue={currentSupervision.status} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border">
                                                <option value="PENDING">รอดำเนินการ (Pending)</option>
                                                <option value="COMPLETED">เสร็จสิ้น (Completed)</option>
                                                <option value="CANCELLED">ยกเลิก (Cancelled)</option>
                                            </select>
                                        </div>

                                        {/* Result Section (Only visible/editable if not cancelled logic in real time, but simplest form is just show all fields and they apply if status is completed) */}
                                        <div className="border-t border-gray-100 pt-4 mt-4">
                                            <h4 className="font-semibold text-gray-900 mb-3">บันทึกผลการนิเทศ</h4>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">ผลการประเมิน</label>
                                                    <select name="result" defaultValue={currentSupervision.result || ''} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border">
                                                        <option value="">เลือกผลการประเมิน...</option>
                                                        <option value="EXCELLENT">ดีเยี่ยม (Excellent)</option>
                                                        <option value="GOOD">ดี (Good)</option>
                                                        <option value="FAIR">พอใช้ (Fair)</option>
                                                        <option value="IMPROVE">ปรับปรุง (Improve)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">ความคิดเห็น / ข้อเสนอแนะ</label>
                                                    <textarea name="comment" defaultValue={currentSupervision.comment || ''} rows="4" className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 border" placeholder="บันทึกความคิดเห็น..."></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white px-6 py-4 flex flex-row-reverse border-t border-gray-100">
                                    <button type="submit" className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-2.5 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto transition-all">
                                        บันทึกการเปลี่ยนแปลง
                                    </button>
                                    <button type="button" onClick={() => setIsDetailModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-6 py-2.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto transition-all">
                                        ปิด
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Subcomponents
function StatCard({ title, count, icon, color }) {
    const bgColors = {
        blue: 'bg-blue-100',
        yellow: 'bg-yellow-100',
        green: 'bg-green-100',
        red: 'bg-red-100',
    };
    const textColors = {
        blue: 'text-blue-600',
        yellow: 'text-yellow-600',
        green: 'text-green-600',
        red: 'text-red-600',
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-800">{count}</p>
                </div>
                <div className={`w-12 h-12 ${bgColors[color]} rounded-full flex items-center justify-center`}>
                    <i className={`fas ${icon} ${textColors[color]} text-xl`}></i>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const configs = {
        PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: 'fa-clock', label: 'รอดำเนินการ' },
        COMPLETED: { color: 'bg-green-100 text-green-800', icon: 'fa-check-circle', label: 'เสร็จสิ้น' },
        CANCELLED: { color: 'bg-red-100 text-red-800', icon: 'fa-times-circle', label: 'ยกเลิก' },
    };
    const config = configs[status] || configs['PENDING'];

    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color} items-center`}>
            {config.label}
        </span>
    );
}

function SupervisionTypeBadge({ type }) {
    const configs = {
        ONSITE: { color: 'bg-blue-100 text-blue-800', icon: 'fa-user-tie', label: 'นิเทศตัวต่อตัว' },
        ONLINE: { color: 'bg-purple-100 text-purple-800', icon: 'fa-video', label: 'นิเทศออนไลน์' },
        PHONE: { color: 'bg-gray-100 text-gray-800', icon: 'fa-phone', label: 'โทรศัพท์' },
    };
    const config = configs[type] || configs['ONSITE'];

    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color} items-center`}>
            <i className={`fas ${config.icon} mr-1`}></i> {config.label}
        </span>
    );
}
