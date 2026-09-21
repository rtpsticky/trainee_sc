'use server'

import prisma from '../lib/prisma'
import { createSession, deleteSession } from '../lib/session'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

export async function login(prevState, formData) {
    const username = String(formData.get('username') || '').trim()
    const password = String(formData.get('password') || '')

    if (!username || !password) {
        return { message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน', username }
    }

    try {
        const user = await prisma.user.findUnique({ where: { username } })

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return { message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', username }
        }

        if (user.status !== 'ACTIVE') {
            return { message: 'บัญชีนี้ถูกปิดใช้งาน กรุณาติดต่อเจ้าหน้าที่', username }
        }

        await createSession({
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        })
    } catch (error) {
        console.error('Login error:', error)
        return { message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }
    }

    // redirect() throws, so it must stay outside the try/catch
    redirect('/')
}

export async function logout() {
    await deleteSession()
    redirect('/login')
}
