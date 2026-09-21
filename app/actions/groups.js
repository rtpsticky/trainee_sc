'use server'

import prisma from '../lib/prisma'
import { revalidatePath } from 'next/cache'
import { authorize, MANAGE_ROLES } from '../lib/auth'

const text = (formData, key) => String(formData.get(key) ?? '').trim()

// Parses and validates the fields shared by create and update.
async function parseGroup(formData) {
    const name = text(formData, 'name')
    const generation = text(formData, 'generation')
    const locationId = parseInt(text(formData, 'locationId'), 10)
    const capacity = parseInt(text(formData, 'capacity'), 10)
    const startDate = new Date(text(formData, 'startDate'))
    const endDate = new Date(text(formData, 'endDate'))
    const advisorIds = [...new Set(
        formData.getAll('advisorIds').map(id => parseInt(id, 10)).filter(id => !isNaN(id))
    )]

    if (!name || !generation || !text(formData, 'startDate') || !text(formData, 'endDate')) {
        return { error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' }
    }
    if (isNaN(locationId)) return { error: 'กรุณาเลือกสถานที่ฝึกงาน' }
    if (isNaN(capacity) || capacity < 1) return { error: 'จำนวนรับต้องเป็นตัวเลขตั้งแต่ 1 ขึ้นไป' }
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return { error: 'รูปแบบวันที่ไม่ถูกต้อง' }
    if (endDate < startDate) return { error: 'วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น' }

    return {
        data: {
            name, generation, capacity, startDate, endDate, locationId, advisorIds,
            description: text(formData, 'description') || null,
        },
    }
}

export async function createGroup(formData) {
    const auth = await authorize(MANAGE_ROLES)
    if (auth.error) return { error: auth.error }

    const parsed = await parseGroup(formData)
    if (parsed.error) return { error: parsed.error }
    const { locationId, advisorIds, ...data } = parsed.data

    try {
        await prisma.trainingGroup.create({
            data: {
                ...data,
                location: { connect: { id: locationId } },
                advisors: { connect: advisorIds.map(id => ({ id })) },
            },
        })

        revalidatePath('/', 'layout')
        return { success: true }
    } catch (error) {
        console.error('Create Group Error:', error)
        if (error.code === 'P2025') return { error: 'ไม่พบสถานที่หรืออาจารย์ที่เลือก' }
        return { error: 'เกิดข้อผิดพลาดในการสร้างกลุ่มฝึกงาน' }
    }
}

export async function updateGroup(id, formData) {
    const auth = await authorize(MANAGE_ROLES)
    if (auth.error) return { error: auth.error }

    const groupId = parseInt(id, 10)
    const parsed = await parseGroup(formData)
    if (parsed.error) return { error: parsed.error }
    const { locationId, advisorIds, ...data } = parsed.data

    try {
        const enrolled = await prisma.user.count({ where: { trainingGroupId: groupId } })
        if (data.capacity < enrolled) {
            return { error: `จำนวนรับต้องไม่น้อยกว่าจำนวนนักศึกษาที่อยู่ในกลุ่มแล้ว (${enrolled} คน)` }
        }

        await prisma.trainingGroup.update({
            where: { id: groupId },
            data: {
                ...data,
                isActive: formData.get('isActive') === 'true',
                location: { connect: { id: locationId } },
                advisors: { set: advisorIds.map(id => ({ id })) },
            },
        })

        revalidatePath('/', 'layout')
        return { success: true }
    } catch (error) {
        console.error('Update Group Error:', error)
        if (error.code === 'P2025') return { error: 'ไม่พบกลุ่มฝึกงานนี้ อาจถูกลบไปแล้ว' }
        return { error: 'เกิดข้อผิดพลาดในการแก้ไขกลุ่มฝึกงาน' }
    }
}

export async function deleteGroup(id) {
    const auth = await authorize(MANAGE_ROLES)
    if (auth.error) return { error: auth.error }

    try {
        // Students in the group are kept and simply become unassigned (ON DELETE SET NULL).
        await prisma.trainingGroup.delete({ where: { id: parseInt(id, 10) } })
        revalidatePath('/', 'layout')
        return { success: true }
    } catch (error) {
        console.error('Delete Group Error:', error)
        if (error.code === 'P2025') return { error: 'ไม่พบกลุ่มฝึกงานนี้ อาจถูกลบไปแล้ว' }
        return { error: 'เกิดข้อผิดพลาดในการลบกลุ่มฝึกงาน' }
    }
}

// Puts the given students into a group (moving them out of any previous group).
export async function addStudentsToGroup(groupId, studentIds) {
    const auth = await authorize(MANAGE_ROLES)
    if (auth.error) return { error: auth.error }

    const gid = parseInt(groupId, 10)
    const ids = [...new Set((studentIds || []).map(v => parseInt(v, 10)).filter(v => !isNaN(v)))]
    if (ids.length === 0) return { error: 'กรุณาเลือกนักศึกษาอย่างน้อย 1 คน' }

    try {
        return await prisma.$transaction(async (tx) => {
            const group = await tx.trainingGroup.findUnique({ where: { id: gid } })
            if (!group) return { error: 'ไม่พบกลุ่มฝึกงานนี้' }

            const students = await tx.user.findMany({
                where: { id: { in: ids }, role: 'STUDENT' },
                select: { id: true, trainingGroupId: true },
            })
            const toAdd = students.filter(s => s.trainingGroupId !== gid)
            if (toAdd.length === 0) return { error: 'นักศึกษาที่เลือกอยู่ในกลุ่มนี้แล้ว' }

            const current = await tx.user.count({ where: { trainingGroupId: gid } })
            const free = group.capacity - current
            if (toAdd.length > free) {
                return { error: free > 0
                    ? `กลุ่มนี้รับได้อีกเพียง ${free} คน (เลือกมา ${toAdd.length} คน)`
                    : `กลุ่มนี้เต็มแล้ว (${group.capacity} คน)` }
            }

            await tx.user.updateMany({
                where: { id: { in: toAdd.map(s => s.id) } },
                data: { trainingGroupId: gid },
            })

            revalidatePath('/', 'layout')
            return { success: true, added: toAdd.length }
        })
    } catch (error) {
        console.error('Add Students To Group Error:', error)
        return { error: 'เกิดข้อผิดพลาดในการเพิ่มนักศึกษาเข้ากลุ่ม' }
    }
}

export async function removeStudentFromGroup(studentId) {
    const auth = await authorize(MANAGE_ROLES)
    if (auth.error) return { error: auth.error }

    try {
        await prisma.user.update({
            where: { id: parseInt(studentId, 10) },
            data: { trainingGroupId: null },
        })
        revalidatePath('/', 'layout')
        return { success: true }
    } catch (error) {
        console.error('Remove Student From Group Error:', error)
        return { error: 'เกิดข้อผิดพลาดในการนำนักศึกษาออกจากกลุ่ม' }
    }
}
