'use server'

import prisma from '../lib/prisma'
import { revalidatePath } from 'next/cache'
import { authorize, SUPERVISE_ROLES } from '../lib/auth'

const TYPES = ['ONSITE', 'ONLINE', 'PHONE']
const STATUSES = ['PENDING', 'COMPLETED', 'CANCELLED']
const RESULTS = ['EXCELLENT', 'GOOD', 'FAIR', 'IMPROVE']

const text = (formData, key) => String(formData.get(key) ?? '').trim()

// Form values are Thai local time; the +07:00 keeps the stored instant correct
// no matter which timezone the server runs in.
function parseDateTime(date, time) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null
    const value = new Date(`${date}T${time}:00+07:00`)
    return isNaN(value.getTime()) ? null : value
}

export async function createSupervision(formData) {
    const auth = await authorize(SUPERVISE_ROLES)
    if (auth.error) return { error: auth.error }

    const studentId = parseInt(text(formData, 'studentId'), 10)
    const type = text(formData, 'type')
    const date = parseDateTime(text(formData, 'date'), text(formData, 'time'))

    if (isNaN(studentId)) return { error: 'กรุณาเลือกนักศึกษา' }
    if (!date) return { error: 'กรุณาระบุวันที่และเวลานิเทศให้ถูกต้อง' }
    if (!TYPES.includes(type)) return { error: 'รูปแบบการนิเทศไม่ถูกต้อง' }

    try {
        const student = await prisma.user.findFirst({ where: { id: studentId, role: 'STUDENT' }, select: { id: true } })
        if (!student) return { error: 'ไม่พบนักศึกษาที่เลือก' }

        await prisma.supervision.create({
            data: {
                studentId,
                // Always the signed-in user, never a value sent from the browser.
                supervisorId: auth.user.id,
                date,
                type,
                locationName: text(formData, 'locationName') || null,
                note: text(formData, 'note') || null,
                status: 'PENDING',
            },
        })

        revalidatePath('/', 'layout')
        return { success: true }
    } catch (error) {
        console.error('Failed to create supervision:', error)
        return { error: 'เกิดข้อผิดพลาดในการบันทึกการนิเทศ' }
    }
}

export async function updateSupervision(formData) {
    const auth = await authorize(SUPERVISE_ROLES)
    if (auth.error) return { error: auth.error }

    const id = parseInt(text(formData, 'id'), 10)
    const status = text(formData, 'status')
    const type = text(formData, 'type')
    const dateText = text(formData, 'date')
    const timeText = text(formData, 'time')

    if (isNaN(id)) return { error: 'ไม่พบข้อมูลการนิเทศ' }
    if (!STATUSES.includes(status)) return { error: 'สถานะไม่ถูกต้อง' }

    const data = {
        status,
        locationName: text(formData, 'locationName') || null,
        note: text(formData, 'note') || null,
    }

    if (dateText || timeText) {
        const date = parseDateTime(dateText, timeText)
        if (!date) return { error: 'กรุณาระบุวันที่และเวลานิเทศให้ถูกต้อง' }
        data.date = date
    }
    if (type) {
        if (!TYPES.includes(type)) return { error: 'รูปแบบการนิเทศไม่ถูกต้อง' }
        data.type = type
    }

    if (status === 'COMPLETED') {
        const result = text(formData, 'result')
        if (!RESULTS.includes(result)) return { error: 'กรุณาเลือกผลการประเมินก่อนบันทึกสถานะ "เสร็จสิ้น"' }
        data.result = result
        data.comment = text(formData, 'comment') || null
    } else {
        // Results only make sense on a completed supervision.
        data.result = null
        data.comment = text(formData, 'comment') || null
    }

    try {
        await prisma.supervision.update({ where: { id }, data })
        revalidatePath('/', 'layout')
        return { success: true }
    } catch (error) {
        console.error('Failed to update supervision:', error)
        if (error.code === 'P2025') return { error: 'ไม่พบข้อมูลการนิเทศนี้ อาจถูกลบไปแล้ว' }
        return { error: 'เกิดข้อผิดพลาดในการบันทึกการนิเทศ' }
    }
}

export async function deleteSupervision(id) {
    const auth = await authorize(SUPERVISE_ROLES)
    if (auth.error) return { error: auth.error }

    try {
        await prisma.supervision.delete({ where: { id: parseInt(id, 10) } })
        revalidatePath('/', 'layout')
        return { success: true }
    } catch (error) {
        console.error('Failed to delete supervision:', error)
        if (error.code === 'P2025') return { error: 'ไม่พบข้อมูลการนิเทศนี้ อาจถูกลบไปแล้ว' }
        return { error: 'เกิดข้อผิดพลาดในการลบข้อมูลการนิเทศ' }
    }
}
