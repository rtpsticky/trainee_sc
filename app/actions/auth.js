'use server'

import { PrismaClient } from '@prisma/client'
import { createSession, deleteSession } from '../lib/session'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function login(prevState, formData) {
    const username = formData.get('username')
    const password = formData.get('password')

    if (!username || !password) {
        return { message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { username: String(username) },
        })

        if (!user) {
            return { message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }
        }

        // Since this is a demo/mockup phase, if the password in DB is plain text (from seed), we might compare directly.
        // However, best practice is bcrypt. I'll check both for flexibility during this setup phase if user seeded manually.
        // For now, let's assume valid bcrypt. If it fails, we fall back to plain text check just for this dev stage if needed, 
        // but strictly we should use proper hashing.
        const isPasswordValid = await bcrypt.compare(String(password), user.password)

        if (!isPasswordValid) {
            // Fallback: If the seed data used plain text (not hashed), try direct comparison
            if (user.password !== String(password)) {
                return { message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }
            }
        }

        // Success
        await createSession({
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        })

    } catch (error) {
        console.error('Login error:', error)
        return { message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }
    }

    redirect('/')
}

export async function logout() {
    await deleteSession()
    redirect('/login')
}
