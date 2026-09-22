'use server'

import prisma from '../lib/prisma'
import bcrypt from 'bcryptjs'

const REGISTER_ROLES = ['STUDENT', 'TEACHER']
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

// Parses/validates the student-only section of the registration form.
// Training group assignment is left to an admin/staff member after approval.
function studentFields(formData) {
    const studentId = optional(formData, 'studentId')
    if (!studentId) return { error: 'กรุณากรอกรหัสนักศึกษา' }

    const academicYearText = text(formData, 'academicYear')
    let academicYear = null
    if (academicYearText) {
        academicYear = parseInt(academicYearText, 10)
        if (isNaN(academicYear) || academicYear < 0) return { error: 'รุ่นปีต้องเป็นตัวเลข' }
    }

    return { data: { studentId, major: optional(formData, 'major'), academicYear, trainingGroupId: null } }
}

// Public self-registration for students and advisors (TEACHER). Accounts start
// as PENDING and only become usable once an admin/staff member approves them.
export async function registerUser(formData) {
    const role = text(formData, 'role')
    const username = text(formData, 'username')
    const password = String(formData.get('password') ?? '')
    const confirmPassword = String(formData.get('confirmPassword') ?? '')
    const email = text(formData, 'email').toLowerCase()
    const firstName = text(formData, 'firstName')
    const lastName = text(formData, 'lastName')

    if (!REGISTER_ROLES.includes(role)) return { error: 'กรุณาเลือกประเภทผู้สมัคร' }
    if (!username || !password || !email || !firstName || !lastName) {
        return { error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' }
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
        return { error: `รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร` }
    }
    if (password !== confirmPassword) return { error: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน' }

    let studentData = { studentId: null, major: null, academicYear: null, trainingGroupId: null }
    if (role === 'STUDENT') {
        const student = studentFields(formData)
        if (student.error) return { error: student.error }
        studentData = student.data
    }

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
                status: 'PENDING',
                ...studentData,
            },
        })
        return { success: true }
    } catch (error) {
        console.error('Register User Error:', error)
        return { error: uniqueError(error) || 'เกิดข้อผิดพลาดในการสมัครสมาชิก' }
    }
}
