'use server'

import prisma from '../lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { authorize, MANAGE_ROLES } from '../lib/auth'

const ROLES = ['STUDENT', 'TEACHER', 'STAFF', 'ADMIN']
const STATUSES = ['ACTIVE', 'INACTIVE']
const MIN_PASSWORD_LENGTH = 6

const text = (formData, key) => String(formData.get(key) ?? '').trim()
const optional = (formData, key) => text(formData, key) || null

function uniqueError(error) {
    if (error.code !== 'P2002') return null
    const target = String(error.meta?.target ?? '')
    if (target.includes('username')) return 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว'
    if (target.includes('email')) return 'อีเมลนี้มีอยู่ในระบบแล้ว'
    if (target.includes('studentId')) return 'รหัสนักศึกษานี้มีอยู่ในระบบแล้ว'
    return 'ข้อมูลซ้ำกับที่มีอยู่ในระบบ'
}

// Returns an error message if the group cannot take one more student.
async function checkGroupSpace(groupId, studentId) {
    const group = await prisma.trainingGroup.findUnique({
        where: { id: groupId },
        select: { name: true, capacity: true, _count: { select: { students: true } } },
    })
    if (!group) return 'ไม่พบกลุ่มฝึกงานที่เลือก'

    const already = await prisma.user.count({ where: { id: studentId ?? -1, trainingGroupId: groupId } })
    if (!already && group._count.students >= group.capacity) {
        return `กลุ่ม "${group.name}" เต็มแล้ว (${group.capacity} คน)`
    }
    return null
}

// Shared parsing/validation of the student-specific fields.
async function studentFields(formData, role, userId) {
    if (role !== 'STUDENT') {
        return { data: { studentId: null, major: null, academicYear: null, trainingGroupId: null } }
    }

    const academicYearText = text(formData, 'academicYear')
    let academicYear = null
    if (academicYearText) {
        academicYear = parseInt(academicYearText, 10)
        if (isNaN(academicYear) || academicYear < 0) return { error: 'รุ่นปีต้องเป็นตัวเลข' }
    }

    let trainingGroupId = null
    const groupText = text(formData, 'trainingGroupId')
    if (groupText) {
        trainingGroupId = parseInt(groupText, 10)
        if (isNaN(trainingGroupId)) return { error: 'ข้อมูลกลุ่มฝึกงานไม่ถูกต้อง' }
        const problem = await checkGroupSpace(trainingGroupId, userId)
        if (problem) return { error: problem }
    }

    return {
        data: {
            studentId: optional(formData, 'studentId'),
            major: optional(formData, 'major'),
            academicYear,
            trainingGroupId,
        },
    }
}

export async function createUser(formData) {
    const auth = await authorize(MANAGE_ROLES)
    if (auth.error) return { error: auth.error }

    const username = text(formData, 'username')
    const password = String(formData.get('password') ?? '')
    const email = text(formData, 'email').toLowerCase()
    const firstName = text(formData, 'firstName')
    const lastName = text(formData, 'lastName')
    const role = text(formData, 'role')

    if (!username || !password || !email || !firstName || !lastName || !role) {
        return { error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' }
    }
    if (!ROLES.includes(role)) return { error: 'ประเภทผู้ใช้งานไม่ถูกต้อง' }
    if (password.length < MIN_PASSWORD_LENGTH) {
        return { error: `รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร` }
    }

    const student = await studentFields(formData, role)
    if (student.error) return { error: student.error }

    try {
        await prisma.user.create({
            data: {
                username,
                password: await bcrypt.hash(password, 10),
                email,
                firstName,
                lastName,
                role,
                prefix: optional(formData, 'prefix'),
                status: 'ACTIVE',
                ...student.data,
            },
        })

        revalidatePath('/', 'layout')
        return { success: true }
    } catch (error) {
        console.error('Create User Error:', error)
        return { error: uniqueError(error) || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน' }
    }
}

export async function updateUser(id, formData) {
    const auth = await authorize(MANAGE_ROLES)
    if (auth.error) return { error: auth.error }

    const userId = parseInt(id, 10)
    const firstName = text(formData, 'firstName')
    const lastName = text(formData, 'lastName')
    const email = text(formData, 'email').toLowerCase()
    const role = text(formData, 'role')
    const status = text(formData, 'status') || 'ACTIVE'
    const password = String(formData.get('password') ?? '')

    if (isNaN(userId)) return { error: 'ไม่พบผู้ใช้งาน' }
    if (!firstName || !lastName || !email || !role) {
        return { error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' }
    }
    if (!ROLES.includes(role)) return { error: 'ประเภทผู้ใช้งานไม่ถูกต้อง' }
    if (!STATUSES.includes(status)) return { error: 'สถานะไม่ถูกต้อง' }
    if (password.trim() && password.length < MIN_PASSWORD_LENGTH) {
        return { error: `รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร` }
    }
    // Stops an admin from locking themselves out of the system.
    if (userId === auth.user.id && (status !== 'ACTIVE' || !MANAGE_ROLES.includes(role))) {
        return { error: 'ไม่สามารถปิดใช้งานหรือลดสิทธิ์บัญชีของตัวเองได้' }
    }

    const student = await studentFields(formData, role, userId)
    if (student.error) return { error: student.error }

    try {
        const data = {
            firstName,
            lastName,
            email,
            role,
            status,
            prefix: optional(formData, 'prefix'),
            ...student.data,
        }
        if (password.trim()) data.password = await bcrypt.hash(password, 10)

        await prisma.user.update({ where: { id: userId }, data })

        revalidatePath('/', 'layout')
        return { success: true }
    } catch (error) {
        console.error('Update User Error:', error)
        if (error.code === 'P2025') return { error: 'ไม่พบผู้ใช้งานนี้ อาจถูกลบไปแล้ว' }
        return { error: uniqueError(error) || 'เกิดข้อผิดพลาดในการแก้ไขผู้ใช้งาน' }
    }
}

export async function deleteUser(id) {
    const auth = await authorize(MANAGE_ROLES)
    if (auth.error) return { error: auth.error }

    const userId = parseInt(id, 10)
    if (userId === auth.user.id) return { error: 'ไม่สามารถลบบัญชีของตัวเองได้' }

    try {
        await prisma.user.delete({ where: { id: userId } })
        revalidatePath('/', 'layout')
        return { success: true }
    } catch (error) {
        console.error('Delete User Error:', error)
        if (error.code === 'P2003') {
            return { error: 'ไม่สามารถลบได้ เนื่องจากมีประวัติการนิเทศที่เกี่ยวข้อง แนะนำให้เปลี่ยนสถานะเป็น "ปิดใช้งาน" แทน' }
        }
        if (error.code === 'P2025') return { error: 'ไม่พบผู้ใช้งานนี้ อาจถูกลบไปแล้ว' }
        return { error: 'เกิดข้อผิดพลาดในการลบผู้ใช้งาน' }
    }
}
