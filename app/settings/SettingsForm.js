'use client';

import { useActionState } from 'react';
import { updateSettings } from '../actions/settings';
import { primaryButton, inputClass, labelClass } from '../components/ui';

const GROUP_TITLES = {
    GENERAL: 'ตั้งค่าทั่วไป',
    ACADEMIC: 'ตั้งค่าปีการศึกษา',
    CONTACT: 'ข้อมูลติดต่อ',
    OTHER: 'อื่นๆ',
};

const INPUT_PROPS = {
    ACADEMIC_YEAR: { inputMode: 'numeric', pattern: '\\d{4}', maxLength: 4 },
    SEMESTER: { inputMode: 'numeric', pattern: '[123]', maxLength: 1 },
    CONTACT_EMAIL: { type: 'email' },
};

export default function SettingsForm({ settings }) {
    const [state, action, isPending] = useActionState(updateSettings, undefined);

    const groups = settings.reduce((acc, item) => {
        (acc[item.group || 'OTHER'] ??= []).push(item);
        return acc;
    }, {});

    return (
        <form action={action} className="space-y-6">
            {state?.error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700" role="alert">
                    <i className="fas fa-exclamation-circle mr-2"></i>{state.error}
                </div>
            )}
            {state?.success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 text-sm text-green-700" role="status">
                    <i className="fas fa-check-circle mr-2"></i>บันทึกการตั้งค่าเรียบร้อยแล้ว
                </div>
            )}

            {Object.entries(groups).map(([groupKey, items]) => (
                <div key={groupKey} className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-lg font-medium text-gray-900">{GROUP_TITLES[groupKey] || groupKey}</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        {items.map(setting => (
                            <div key={setting.key}>
                                <label htmlFor={setting.key} className={labelClass}>{setting.description || setting.key}</label>
                                {/* key on savedAt re-syncs the field with the value that was just saved */}
                                <input
                                    key={`${setting.key}-${state?.savedAt ?? 0}`}
                                    type="text"
                                    name={setting.key}
                                    id={setting.key}
                                    required
                                    defaultValue={state?.values?.[setting.key] ?? setting.value}
                                    className={inputClass}
                                    {...INPUT_PROPS[setting.key]}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="flex justify-end">
                <button type="submit" disabled={isPending} className={primaryButton}>
                    <i className="fas fa-save mr-2"></i> {isPending ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                </button>
            </div>
        </form>
    );
}
