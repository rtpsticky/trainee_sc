import 'server-only'
import { cache } from 'react'
import prisma from './prisma'

export const DEFAULT_SETTINGS = [
    { key: 'SYSTEM_NAME', value: 'ระบบติดตามการฝึกงาน', description: 'ชื่อระบบที่แสดงส่วนหัว', group: 'GENERAL' },
    { key: 'ACADEMIC_YEAR', value: '2569', description: 'ปีการศึกษาปัจจุบัน (พ.ศ.)', group: 'ACADEMIC' },
    { key: 'SEMESTER', value: '1', description: 'ภาคการศึกษาปัจจุบัน (1, 2 หรือ 3)', group: 'ACADEMIC' },
    { key: 'CONTACT_EMAIL', value: 'science@psru.ac.th', description: 'อีเมลติดต่อผู้ดูแลระบบ', group: 'CONTACT' },
]

const defaultsMap = () => Object.fromEntries(DEFAULT_SETTINGS.map(s => [s.key, s.value]))

// Returns the full list of settings rows, creating any default rows that are missing.
export const getSettingRows = cache(async () => {
    try {
        let rows = await prisma.systemConfig.findMany({ orderBy: { key: 'asc' } })
        if (DEFAULT_SETTINGS.some(d => !rows.some(r => r.key === d.key))) {
            await prisma.systemConfig.createMany({ data: DEFAULT_SETTINGS, skipDuplicates: true })
            rows = await prisma.systemConfig.findMany({ orderBy: { key: 'asc' } })
        }
        return rows
    } catch (error) {
        console.error('Failed to load settings:', error)
        return DEFAULT_SETTINGS
    }
})

// { KEY: value } for the settings the UI displays (system name, semester ...).
export const getSettingsMap = cache(async () => {
    const rows = await getSettingRows()
    return { ...defaultsMap(), ...Object.fromEntries(rows.map(r => [r.key, r.value])) }
})
