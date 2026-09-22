'use server'

import prisma from '../lib/prisma'
import { revalidatePath } from 'next/cache'
import { authorize, MANAGE_ROLES } from '../lib/auth'

const text = (formData, key) => String(formData.get(key) ?? '').trim()
const optional = (formData, key) => text(formData, key) || null

function parseMentor(formData) {
    const firstName = text(formData, 'firstName')
    const lastName = text(formData, 'lastName')
    const phone = text(formData, 'phone')

    if (!firstName || !lastName || !phone) {
        return { error: 'กรุณากรอกชื่อ นามสกุล และเบอร์โทรติดต่อให้ครบถ้วน' }
    }

    return {
        data: {
            firstName, lastName, phone,
            prefix: optional(formData, 'prefix'),
            position: optional(formData, 'position'),
            email: optional(formData, 'email'),
        },
    }
}

export async function createMentor(groupId, formData) {
    const auth = await authorize(MANAGE_ROLES)
    if (auth.error) return { error: auth.error }

    const parsed = parseMentor(formData)
    if (parsed.error) return { error: parsed.error }

    try {
        await prisma.mentor.create({
            data: { ...parsed.data, trainingGroupId: parseInt(groupId, 10) },
        })
        revalidatePath('/', 'layout')
        return { success: true }
    } catch (error) {
        console.error('Create Mentor Error:', error)
        if (error.code === 'P2003') return { error: 'ไม่พบกลุ่มฝึกงานนี้' }
        return { error: 'เกิดข้อผิดพลาดในการเพิ่มพี่เลี้ยง' }
    }
}

export async function updateMentor(id, formData) {
    const auth = await authorize(MANAGE_ROLES)
    if (auth.error) return { error: auth.error }

    const parsed = parseMentor(formData)
    if (parsed.error) return { error: parsed.error }

    try {
        await prisma.mentor.update({ where: { id: parseInt(id, 10) }, data: parsed.data })
        revalidatePath('/', 'layout')
        return { success: true }
    } catch (error) {
        console.error('Update Mentor Error:', error)
        if (error.code === 'P2025') return { error: 'ไม่พบพี่เลี้ยงนี้ อาจถูกลบไปแล้ว' }
        return { error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลพี่เลี้ยง' }
    }
}

export async function deleteMentor(id) {
    const auth = await authorize(MANAGE_ROLES)
    if (auth.error) return { error: auth.error }

    try {
        await prisma.mentor.delete({ where: { id: parseInt(id, 10) } })
        revalidatePath('/', 'layout')
        return { success: true }
    } catch (error) {
        console.error('Delete Mentor Error:', error)
        if (error.code === 'P2025') return { error: 'ไม่พบพี่เลี้ยงนี้ อาจถูกลบไปแล้ว' }
        return { error: 'เกิดข้อผิดพลาดในการลบพี่เลี้ยง' }
    }
}
