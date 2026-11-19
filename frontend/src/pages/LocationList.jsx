import { useMemo, useState } from 'react';
import { createLocation, updateLocation, deleteLocation } from '../lib/api';
import Modal from '../components/Modal';
import {
    Badge, Block, EmptyState, ErrorAlert, Field, FormActions, FormSection, HowTo, PageHeader, SearchBox, Select,
    confirmAndRun, html, inputClass, primaryButton, useServerAction,
} from '../components/ui';
import { LOCATION_TYPE_LABELS } from '../lib/format';

const TYPE_OPTIONS = Object.entries(LOCATION_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'เปิดใช้งาน (เลือกใช้ได้)' },
    { value: 'INACTIVE', label: 'ปิดใช้งาน (ซ่อนจากการเลือก)' },
];

export default function LocationList({ locations }) {
    // modal: null | { type: 'add' } | { type: 'edit', location }
    const [modal, setModal] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProvince, setFilterProvince] = useState('');
    const [filterType, setFilterType] = useState('');
    const closeModal = () => setModal(null);

    const provinces = useMemo(
        () => [...new Set(locations.map(l => l.province))].sort((a, b) => a.localeCompare(b, 'th')).map(p => ({ value: p, label: p })),
        [locations]
    );

    const filtered = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return locations.filter(loc =>
            (!filterProvince || loc.province === filterProvince) &&
            (!filterType || loc.type === filterType) &&
            (!term || loc.name.toLowerCase().includes(term) || (loc.address ?? '').toLowerCase().includes(term))
        );
    }, [locations, searchTerm, filterProvince, filterType]);

    const handleDelete = (loc) => confirmAndRun({
        title: 'ลบแหล่งฝึกงาน?',
        html: html`ต้องการลบ <b>${loc.name}</b> ใช่หรือไม่?<br>การลบไม่สามารถย้อนกลับได้`,
        confirmText: 'ลบแหล่งฝึกงาน',
        successText: 'ลบแหล่งฝึกงานเรียบร้อยแล้ว',
        action: () => deleteLocation(loc.id),
    });

    return (
        <>
            <PageHeader icon="fa-hospital" title="แหล่งฝึกงาน" description="โรงพยาบาลและหน่วยงานที่รับนักศึกษาฝึกประสบการณ์วิชาชีพ">
                <button onClick={() => setModal({ type: 'add' })} className={`${primaryButton} text-lg`}>
                    <i className="fas fa-plus"></i> เพิ่มแหล่งฝึกงาน
                </button>
            </PageHeader>

            <HowTo steps={['กด "เพิ่มแหล่งฝึกงาน" แล้วกรอกข้อมูล', 'ค้นหาหรือกรองตามจังหวัด/ประเภท', 'กด "แก้ไข" หรือ "ลบ" ที่รายการ']} />

            <Block number={1} title="ค้นหาและกรองข้อมูล" className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="ค้นหา"><SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="ชื่อหรือที่อยู่..." /></Field>
                    <Field label="จังหวัด">
                        <Select options={provinces} value={filterProvince} onChange={setFilterProvince} placeholder="ทุกจังหวัด" isClearable />
                    </Field>
                    <Field label="ประเภท">
                        <Select options={TYPE_OPTIONS} value={filterType} onChange={setFilterType} placeholder="ทุกประเภท" isClearable />
                    </Field>
                </div>
            </Block>

            <Block number={2} title={`รายชื่อแหล่งฝึกงาน (${filtered.length} แห่ง)`} bodyClassName="">
                {filtered.length === 0 ? (
                    <EmptyState icon="fa-hospital" title={locations.length === 0 ? 'ยังไม่มีแหล่งฝึกงาน' : 'ไม่พบแหล่งฝึกงานที่ค้นหา'}>
                        {locations.length === 0 && 'กดปุ่ม "เพิ่มแหล่งฝึกงาน" ด้านบนเพื่อเริ่มต้น'}
                    </EmptyState>
                ) : (
                    <ul className="divide-y divide-line">
                        {filtered.map((loc, index) => (
                            <li key={loc.id} className="px-5 sm:px-6 py-5 flex flex-col md:flex-row md:items-center gap-4">
                                <span className="w-10 h-10 rounded-full bg-page text-muted font-semibold flex items-center justify-center flex-shrink-0">{index + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-lg font-semibold text-ink">{loc.name}</p>
                                    <p className="text-base text-muted">
                                        <i className="fas fa-location-dot mr-1.5"></i>
                                        {loc.address ? `${loc.address} ` : ''}จ.{loc.province}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <Badge tone="blue" icon="fa-tag">{LOCATION_TYPE_LABELS[loc.type]}</Badge>
                                        <Badge tone="purple" icon="fa-people-group">{loc._count.groups} กลุ่ม</Badge>
                                        {loc.status === 'ACTIVE'
                                            ? <Badge tone="green" icon="fa-circle-check">เปิดใช้งาน</Badge>
                                            : <Badge tone="gray" icon="fa-circle-pause">ปิดใช้งาน</Badge>}
                                    </div>
                                </div>
                                <div className="flex gap-2 md:flex-shrink-0">
                                    <button onClick={() => setModal({ type: 'edit', location: loc })} className="btn btn-soft btn-sm">
                                        <i className="fas fa-pen"></i> แก้ไข
                                    </button>
                                    <button onClick={() => handleDelete(loc)} className="btn btn-soft-danger btn-sm">
                                        <i className="fas fa-trash"></i> ลบ
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Block>

            {modal?.type === 'add' && <LocationFormModal key="add" onClose={closeModal} />}
            {modal?.type === 'edit' && <LocationFormModal key={`edit-${modal.location.id}`} location={modal.location} onClose={closeModal} />}
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
        <Modal title={isEdit ? 'แก้ไขแหล่งฝึกงาน' : 'เพิ่มแหล่งฝึกงานใหม่'} subtitle="กรอกข้อมูลตามลำดับ ช่องที่มี * ต้องกรอก" icon={isEdit ? 'fa-pen' : 'fa-plus'} size="md" onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div className="p-5 sm:p-6 space-y-5">
                    <ErrorAlert>{error}</ErrorAlert>
                    <FormSection number={1} title="ชื่อและที่ตั้ง">
                        <Field label="ชื่อแหล่งฝึกงาน" required>
                            <input name="name" type="text" required defaultValue={location?.name} placeholder="เช่น โรงพยาบาลพุทธชินราช" className={inputClass} />
                        </Field>
                        <Field label="ที่อยู่">
                            <input name="address" type="text" defaultValue={location?.address ?? ''} className={inputClass} />
                        </Field>
                        <Field label="จังหวัด" required>
                            <input name="province" type="text" required defaultValue={location?.province} placeholder="เช่น พิษณุโลก" className={inputClass} />
                        </Field>
                    </FormSection>
                    <FormSection number={2} title="ประเภทและสถานะ">
                        <Field label="ประเภทแหล่งฝึกงาน">
                            <Select name="type" options={TYPE_OPTIONS} defaultValue={location?.type ?? 'HOSPITAL_GENERAL'} isSearchable={false} />
                        </Field>
                        <Field label="สถานะ">
                            <Select name="status" options={STATUS_OPTIONS} defaultValue={location?.status ?? 'ACTIVE'} isSearchable={false} />
                        </Field>
                    </FormSection>
                </div>
                <FormActions isPending={isPending} submitLabel={isEdit ? 'บันทึกการแก้ไข' : 'บันทึกแหล่งฝึกงาน'} onCancel={onClose} />
            </form>
        </Modal>
    );
}
