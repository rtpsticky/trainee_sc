'use server'

import prisma from '../lib/prisma'
import { revalidatePath } from 'next/cache'
import { authorize, MANAGE_ROLES } from '../lib/auth'
import { DEFAULT_SETTINGS } from '../lib/settings'

const validators = {
    SYSTEM_NAME: (v) => (v ? null : 'กรุณาระบุชื่อระบบ'),
    ACADEMIC_YEAR: (v) => (/^\d{4}$/.test(v) ? null : 'ปีการศึกษาต้องเป็นตัวเลข 4 หลัก (พ.ศ.) เช่น 2569'),
    SEMESTER: (v) => (['1', '2', '3'].includes(v) ? null : 'ภาคการศึกษาต้องเป็น 1, 2 หรือ 3'),
    CONTACT_EMAIL: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'รูปแบบอีเมลติดต่อไม่ถูกต้อง'),
}

export async function updateSettings(prevState, formData) {
    const auth = await authorize(MANAGE_ROLES)
    if (auth.error) return { error: auth.error }

    const values = Object.fromEntries(DEFAULT_SETTINGS.filter(d => formData.has(d.key)).map(d => [d.key, String(formData.get(d.key))]))
    const updates = []
    for (const setting of DEFAULT_SETTINGS) {
        if (!formData.has(setting.key)) continue
        const value = values[setting.key].trim()
        const problem = validators[setting.key]?.(value)
        if (problem) return { error: problem, values }
        updates.push(prisma.systemConfig.upsert({
            where: { key: setting.key },
            update: { value },
            create: { ...setting, value },
        }))
    }

    try {
        await prisma.$transaction(updates)
        revalidatePath('/', 'layout')
        return { success: true, savedAt: Date.now(), values }
    } catch (error) {
        console.error('Failed to update settings:', error)
        return { error: 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า', values }
    }
}
