'use server'

import prisma from '../lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export async function createUser(formData) {
    const username = formData.get('username');
    const password = formData.get('password');
    const email = formData.get('email');
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const role = formData.get('role');
    const prefix = formData.get('prefix');

    // Student specific
    const studentId = formData.get('studentId');
    const major = formData.get('major');
    const academicYear = formData.get('academicYear');

    if (!username || !password || !email || !firstName || !lastName || !role) {
        return { error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' };
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const data = {
            username,
            password: hashedPassword,
            email,
            firstName,
            lastName,
            role,
            prefix,
            status: 'ACTIVE'
        };

        if (role === 'STUDENT') {
            if (studentId) data.studentId = studentId;
            if (major) data.major = major;
            if (academicYear) data.academicYear = parseInt(academicYear);
        }

        await prisma.user.create({
            data
        });

        revalidatePath('/users');
        return { success: true };
    } catch (error) {
        console.error('Create User Error:', error);
        if (error.code === 'P2002') {
            if (error.meta?.target?.includes('username')) return { error: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว' };
            if (error.meta?.target?.includes('email')) return { error: 'อีเมลนี้มีอยู่ในระบบแล้ว' };
            if (error.meta?.target?.includes('studentId')) return { error: 'รหัสนักศึกษานี้มีอยู่ในระบบแล้ว' };
        }
        return { error: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน' };
    }
}

export async function updateUser(id, formData) {
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');
    const role = formData.get('role');
    const prefix = formData.get('prefix');
    const status = formData.get('status');
    const password = formData.get('password'); // Optional update

    // Student specific
    const studentId = formData.get('studentId');
    const major = formData.get('major');
    const academicYear = formData.get('academicYear');

    try {
        const data = {
            firstName,
            lastName,
            email,
            role,
            prefix,
            status
        };

        if (password && password.trim() !== '') {
            data.password = await bcrypt.hash(password, 10);
        }

        if (role === 'STUDENT') {
            if (studentId) data.studentId = studentId;
            if (major) data.major = major;
            if (academicYear) data.academicYear = parseInt(academicYear);
        }

        await prisma.user.update({
            where: { id: parseInt(id) },
            data
        });

        revalidatePath('/users');
        return { success: true };
    } catch (error) {
        console.error('Update User Error:', error);
        if (error.code === 'P2002') {
            if (error.meta?.target?.includes('email')) return { error: 'อีเมลนี้มีอยู่ในระบบแล้ว' };
            if (error.meta?.target?.includes('studentId')) return { error: 'รหัสนักศึกษานี้มีอยู่ในระบบแล้ว' };
        }
        return { error: 'เกิดข้อผิดพลาดในการแก้ไขผู้ใช้งาน' };
    }
}

export async function deleteUser(id) {
    try {
        await prisma.user.delete({
            where: { id: parseInt(id) }
        });
        revalidatePath('/users');
        return { success: true };
    } catch (error) {
        console.error('Delete User Error:', error);
        return { error: 'เกิดข้อผิดพลาดในการลบผู้ใช้งาน' };
    }
}
