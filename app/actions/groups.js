'use server'

import prisma from '../lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createGroup(formData) {
    const name = formData.get('name');
    const generation = formData.get('generation');
    const locationId = formData.get('locationId');
    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');
    const description = formData.get('description');
    const capacity = formData.get('capacity');
    const advisorIds = formData.getAll('advisorIds'); // Expecting multiple values

    if (!name || !generation || !locationId || !startDate || !endDate || !capacity) {
        return { error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' };
    }

    const parsedAdvisorIds = advisorIds
        .map(id => parseInt(id))
        .filter(id => !isNaN(id));

    const parsedLocationId = parseInt(locationId);
    if (isNaN(parsedLocationId)) {
        return { error: 'ข้อมูลสถานที่ฝึกงานไม่ถูกต้อง' };
    }

    try {
        await prisma.trainingGroup.create({
            data: {
                name,
                generation,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                description,
                capacity: parseInt(capacity),
                location: {
                    connect: { id: parsedLocationId }
                },
                advisors: {
                    connect: parsedAdvisorIds.map(id => ({ id }))
                }
            }
        });

        revalidatePath('/groups');
        return { success: true };
    } catch (error) {
        console.error('Create Group Error:', error);
        return { error: `เกิดข้อผิดพลาด: ${error.message}` };
    }
}

export async function updateGroup(id, formData) {
    const name = formData.get('name');
    const generation = formData.get('generation');
    const locationId = formData.get('locationId');
    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');
    const description = formData.get('description');
    const capacity = formData.get('capacity');
    const isActive = formData.get('isActive') === 'true';
    const advisorIds = formData.getAll('advisorIds');

    const parsedAdvisorIds = advisorIds
        .map(id => parseInt(id))
        .filter(id => !isNaN(id));

    const parsedLocationId = parseInt(locationId);
    if (isNaN(parsedLocationId)) {
        return { error: 'ข้อมูลสถานที่ฝึกงานไม่ถูกต้อง' };
    }

    try {
        // First disconnect all existing advisors to replace with new selection (simple strategy)
        // Or Prisma `set` can be used for many-to-many

        await prisma.trainingGroup.update({
            where: { id: parseInt(id) },
            data: {
                name,
                generation,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                description,
                capacity: parseInt(capacity),
                isActive,
                location: {
                    connect: { id: parsedLocationId }
                },
                advisors: {
                    set: parsedAdvisorIds.map(id => ({ id }))
                }
            }
        });

        revalidatePath('/groups');
        return { success: true };
    } catch (error) {
        console.error('Update Group Error:', error);
        return { error: `เกิดข้อผิดพลาด: ${error.message}` };
    }
}

export async function deleteGroup(id) {
    try {
        await prisma.trainingGroup.delete({
            where: { id: parseInt(id) }
        });
        revalidatePath('/groups');
        return { success: true };
    } catch (error) {
        console.error('Delete Group Error:', error);
        return { error: 'เกิดข้อผิดพลาดในการลบกลุ่มฝึกงาน' };
    }
}
