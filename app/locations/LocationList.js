'use client';

import { useMemo, useState } from 'react';
import { createLocation, updateLocation, deleteLocation } from '../actions/locations';
import Modal from '../components/Modal';
import {
    ConfirmDelete, ErrorAlert, FormActions, SearchBox,
    inputClass, labelClass, primaryButton, useServerAction,
} from '../components/ui';
import { LOCATION_TYPE_LABELS } from '../lib/format';

const STATUS_STYLES = {
    ACTIVE: { label: 'เปิดใช้งาน', className: 'bg-green-100 text-green-800' },
    INACTIVE: { label: 'ปิดใช้งาน', className: 'bg-red-100 text-red-800' },
};

export default function LocationList({ locations }) {
    // modal: null | { type: 'add' } | { type: 'edit' | 'delete', location }
    const [modal, setModal] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProvince, setFilterProvince] = useState('ALL');
    const [filterType, setFilterType] = useState('ALL');
    const closeModal = () => setModal(null);

    const provinces = useMemo(() => [...new Set(locations.map(l => l.province))].sort((a, b) => a.localeCompare(b, 'th')), [locations]);

    const filtered = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return locations.filter(loc =>
            (filterProvince === 'ALL' || loc.province === filterProvince) &&
            (filterType === 'ALL' || loc.type === filterType) &&
            (!term || loc.name.toLowerCase().includes(term) || (loc.address ?? '').toLowerCase().includes(term))
        );
    }, [locations, searchTerm, filterProvince, filterType]);

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            <i className="fas fa-building mr-2 text-blue-600"></i> รายชื่อแหล่งฝึกงาน
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">เพิ่ม/แก้ไข/ลบ ข้อมูลสถานที่ฝึกงานสำหรับนักศึกษา</p>
                    </div>
                    <button onClick={() => setModal({ type: 'add' })} className={primaryButton}>
                        <i className="fas fa-plus mr-2"></i> เพิ่มแหล่งฝึกงาน
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="ค้นหาแหล่งฝึกงาน..." />
                    <div className="flex flex-col sm:flex-row gap-2">
                        <select value={filterProvince} onChange={(e) => setFilterProvince(e.target.value)} className={inputClass}>
                            <option value="ALL">จังหวัดทั้งหมด</option>
                            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={inputClass}>
                            <option value="ALL">ประเภททั้งหมด</option>
                            {Object.entries(LOCATION_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['ลำดับ', 'ชื่อแหล่งฝึกงาน', 'ประเภท', 'จังหวัด', 'จำนวนกลุ่ม', 'สถานะ'].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filtered.map((loc, index) => {
                                const status = STATUS_STYLES[loc.status];
                                return (
                                    <tr key={loc.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{loc.name}</div>
                                            <div className="text-sm text-gray-500">{loc.address}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{LOCATION_TYPE_LABELS[loc.type]}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.province}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc._count.groups} กลุ่ม</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.className}`}>{status.label}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => setModal({ type: 'edit', location: loc })} className="text-blue-600 hover:text-blue-900 mr-3" title="แก้ไข">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button onClick={() => setModal({ type: 'delete', location: loc })} className="text-red-600 hover:text-red-900" title="ลบ">
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr><td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">ไม่พบข้อมูลแหล่งฝึกงาน</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal?.type === 'add' && <LocationFormModal key="add" onClose={closeModal} />}
            {modal?.type === 'edit' && <LocationFormModal key={`edit-${modal.location.id}`} location={modal.location} onClose={closeModal} />}
            {modal?.type === 'delete' && (
                <ConfirmDelete title="ยืนยันการลบ" action={() => deleteLocation(modal.location.id)} onDone={closeModal} onClose={closeModal}>
                    คุณต้องการลบ <b>{modal.location.name}</b> ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
                </ConfirmDelete>
            )}
        </>
    );
}

function LocationFormModal({ location, onClose }) {
    const isEdit = Boolean(location);
    const { run, isPending, error } = useServerAction();

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        run(() => (isEdit ? updateLocation(location.id, formData) : createLocation(formData)), onClose);
    };

    return (
        <Modal title={isEdit ? 'แก้ไขแหล่งฝึกงาน' : 'เพิ่มแหล่งฝึกงานใหม่'} icon={isEdit ? 'fa-edit' : 'fa-plus'} size="md" onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div className="px-6 pb-6 space-y-4">
                    <ErrorAlert>{error}</ErrorAlert>
                    <div>
                        <label className={labelClass}>ชื่อแหล่งฝึกงาน <span className="text-red-500">*</span></label>
                        <input name="name" type="text" required defaultValue={location?.name} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>ที่อยู่</label>
                        <input name="address" type="text" defaultValue={location?.address ?? ''} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>จังหวัด <span className="text-red-500">*</span></label>
                            <input name="province" type="text" required defaultValue={location?.province} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>ประเภท</label>
                            <select name="type" defaultValue={location?.type ?? 'HOSPITAL_GENERAL'} className={inputClass}>
                                {Object.entries(LOCATION_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>สถานะ</label>
                        <select name="status" defaultValue={location?.status ?? 'ACTIVE'} className={inputClass}>
                            <option value="ACTIVE">เปิดใช้งาน</option>
                            <option value="INACTIVE">ปิดใช้งาน</option>
                        </select>
                    </div>
                </div>
                <FormActions isPending={isPending} submitLabel={isEdit ? 'บันทึกการแก้ไข' : 'บันทึก'} onCancel={onClose} />
            </form>
        </Modal>
    );
}
