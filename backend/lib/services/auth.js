import prisma from '../prisma'
import { createToken } from '../session'
import bcrypt from 'bcryptjs'

// Returns { token, user } on success. The frontend keeps the token and sends it
// back as `Authorization: Bearer <token>`; signing out just discards it.
export async function login(formData) {
    const username = String(formData.get('username') || '').trim()
    const password = String(formData.get('password') || '')

    if (!username || !password) {
        return { error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' }
    }

    const user = await prisma.user.findUnique({ where: { username } })

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', status: 401 }
    }

    if (user.status === 'PENDING') {
        return { error: 'บัญชีนี้กำลังรอการอนุมัติจากผู้ดูแลระบบ กรุณาลองใหม่อีกครั้งภายหลัง', status: 403 }
    }
    if (user.status !== 'ACTIVE') {
        return { error: 'บัญชีนี้ถูกปิดใช้งาน กรุณาติดต่อเจ้าหน้าที่', status: 403 }
    }

    const token = await createToken({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
    })

    // Same shape as getCurrentUser() so /auth/me and /auth/login agree.
    const { id, prefix, firstName, lastName, role, status, studentId, trainingGroupId } = user
    return { token, user: { id, username: user.username, prefix, firstName, lastName, role, status, studentId, trainingGroupId } }
}
