'use server'

import { revalidatePath } from 'next/cache'
import prisma from '../lib/prisma'
import { authorize, MANAGE_ROLES } from '../lib/auth'

const TYPES = ['HOSPITAL_CENTER', 'HOSPITAL_GENERAL', 'HOSPITAL_COMMUNITY', 'HEALTH_CENTER', 'OTHER']
const STATUSES = ['ACTIVE', 'INACTIVE']

const text = (formData, key) => String(formData.get(key) ?? '').trim()

function parseLocation(formData) {
    const name = text(formData, 'name')
    const province = text(formData, 'province')
    const type = text(formData, 'type') || 'HOSPITAL_GENERAL'
    const status = text(formData, 'status') || 'ACTIVE'

    if (!name) return { error: 'กรุณาระบุชื่อแหล่งฝึกงาน' }
    if (!province) return { error: 'กรุณาระบุจังหวัด' }
    if (!TYPES.includes(type)) return { error: 'ประเภทแหล่งฝึกงานไม่ถูกต้อง' }
    if (!STATUSES.includes(status)) return { error: 'สถานะไม่ถูกต้อง' }

    return { data: { name, province, type, status, address: text(formData, 'address') || null } }
}

export async function createLocation(formData) {
    const auth = await authorize(MANAGE_ROLES)
    if (auth.error) return { error: auth.error }

    const parsed = parseLocation(formData)
    if (parsed.error) return { error: parsed.error }

    try {
        await prisma.location.create({ data: parsed.data })
    } catch (error) {
        console.error('Failed to create location:', error)
        return { error: 'เกิดข้อผิดพลาดในการเพิ่มแหล่งฝึกงาน' }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function updateLocation(id, formData) {
    const auth = await authorize(MANAGE_ROLES)
    if (auth.error) return { error: auth.error }

    const parsed = parseLocation(formData)
    if (parsed.error) return { error: parsed.error }

    try {
        await prisma.location.update({ where: { id: parseInt(id, 10) }, data: parsed.data })
    } catch (error) {
        console.error('Failed to update location:', error)
        if (error.code === 'P2025') return { error: 'ไม่พบแหล่งฝึกงานนี้ อาจถูกลบไปแล้ว' }
        return { error: 'เกิดข้อผิดพลาดในการแก้ไขแหล่งฝึกงาน' }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function deleteLocation(id) {
    const auth = await authorize(MANAGE_ROLES)
    if (auth.error) return { error: auth.error }

    try {
        await prisma.location.delete({ where: { id: parseInt(id, 10) } })
    } catch (error) {
        console.error('Failed to delete location:', error)
        if (error.code === 'P2003') {
            return { error: 'ไม่สามารถลบได้ เนื่องจากยังมีกลุ่มฝึกงานใช้สถานที่นี้อยู่ แนะนำให้เปลี่ยนสถานะเป็น "ปิดใช้งาน" แทน' }
        }
        if (error.code === 'P2025') return { error: 'ไม่พบแหล่งฝึกงานนี้ อาจถูกลบไปแล้ว' }
        return { error: 'เกิดข้อผิดพลาดในการลบแหล่งฝึกงาน' }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}
