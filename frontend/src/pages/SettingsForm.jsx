import { useActionState, useEffect } from 'react';
import { updateSettings } from '../lib/api';
import { Block, ErrorAlert, Field, PageHeader, inputClass, notifySuccess, primaryButton } from '../components/ui';

const GROUPS = [
    { key: 'GENERAL', title: 'ข้อมูลทั่วไป', description: 'ชื่อที่แสดงในทุกหน้าของระบบ' },
    { key: 'ACADEMIC', title: 'ปีการศึกษา', description: 'ใช้แสดงภาคการศึกษาปัจจุบันที่หน้าหลัก' },
    { key: 'CONTACT', title: 'ข้อมูลติดต่อ', description: 'แสดงที่หน้าแรกเพื่อให้ผู้ใช้ติดต่อได้' },
    { key: 'OTHER', title: 'อื่น ๆ' },
];

const INPUT_PROPS = {
    ACADEMIC_YEAR: { inputMode: 'numeric', pattern: '\\d{4}', maxLength: 4 },
    SEMESTER: { inputMode: 'numeric', pattern: '[123]', maxLength: 1 },
    CONTACT_EMAIL: { type: 'email' },
};

const HINTS = {
    ACADEMIC_YEAR: 'ตัวเลข พ.ศ. 4 หลัก เช่น 2569',
    SEMESTER: 'กรอก 1, 2 หรือ 3',
};

export default function SettingsForm({ settings }) {
    const [state, action, isPending] = useActionState((_prevState, formData) => updateSettings(formData), undefined);

    useEffect(() => {
        if (state?.success) notifySuccess('บันทึกการตั้งค่าเรียบร้อยแล้ว');
    }, [state]);

    const byGroup = settings.reduce((acc, item) => {
        (acc[item.group || 'OTHER'] ??= []).push(item);
        return acc;
    }, {});
    const sections = GROUPS.filter(g => byGroup[g.key]);

    return (
        <div className="max-w-4xl mx-auto">
            <PageHeader icon="fa-gear" title="ตั้งค่าระบบ" description="แก้ไขข้อมูลพื้นฐานของระบบ แล้วกดบันทึกที่ด้านล่าง" />

            <form action={action} className="space-y-6">
                <ErrorAlert>{state?.error}</ErrorAlert>

                {sections.map((group, index) => (
                    <Block key={group.key} number={index + 1} title={group.title} description={group.description}>
                        <div className="space-y-5">
                            {byGroup[group.key].map(setting => (
                                <Field key={setting.key} label={setting.description || setting.key} hint={HINTS[setting.key]}>
                                    {/* key on savedAt re-syncs the field with the value that was just saved */}
                                    <input
                                        key={`${setting.key}-${state?.savedAt ?? 0}`}
                                        type="text"
                                        name={setting.key}
                                        required
                                        defaultValue={state?.values?.[setting.key] ?? setting.value}
                                        className={inputClass}
                                        {...INPUT_PROPS[setting.key]}
                                    />
                                </Field>
                            ))}
                        </div>
                    </Block>
                ))}

                <div className="block-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="text-base text-muted"><i className="fas fa-circle-info mr-2"></i>ตรวจสอบข้อมูลทุกข้อให้ถูกต้องก่อนบันทึก</p>
                    <button type="submit" disabled={isPending} className={`${primaryButton} text-lg px-8`}>
                        {isPending ? <><i className="fas fa-spinner fa-spin"></i> กำลังบันทึก...</> : <><i className="fas fa-save"></i> บันทึกการตั้งค่า</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
