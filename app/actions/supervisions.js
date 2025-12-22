'use server';

import prisma from '../lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createSupervision(formData) {
    try {
        const studentId = parseInt(formData.get('studentId'));
        const supervisorId = parseInt(formData.get('supervisorId')); // In real app, this comes from session

        // Date and Time handling
        // Expected format from form: date="YYYY-MM-DD" or "DD/MM/YYYY", time="HH:mm"
        // We will combine them into a JS Date object
        const dateStr = formData.get('date');
        const timeStr = formData.get('time');

        // Parse date - assuming DD/MM/YYYY from flatpickr or YYYY-MM-DD
        let dateObj;
        if (dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/');
            dateObj = new Date(`${year}-${month}-${day}T${timeStr}:00`);
        } else {
            dateObj = new Date(`${dateStr}T${timeStr}:00`);
        }

        const type = formData.get('type'); // ONSITE, ONLINE, PHONE
        const locationName = formData.get('locationName');
        const note = formData.get('note');

        await prisma.supervision.create({
            data: {
                student: { connect: { id: studentId } },
                supervisor: { connect: { id: supervisorId } }, // Needs a valid teacher/admin ID
                date: dateObj,
                type: type,
                locationName: locationName,
                note: note,
                status: 'PENDING'
            }
        });

        revalidatePath('/supervisions');
        return { success: true };
    } catch (error) {
        console.error('Failed to create supervision:', error);
        return { error: 'Failed to create supervision: ' + error.message };
    }
}

export async function updateSupervision(formData) {
    try {
        const id = parseInt(formData.get('id'));
        const status = formData.get('status'); // PENDING, COMPLETED, CANCELLED

        const updateData = {
            status: status
        };

        // If completing the supervision, update result fields
        if (status === 'COMPLETED') {
            updateData.result = formData.get('result'); // EXCELLENT, GOOD, FAIR, IMPROVE
            updateData.comment = formData.get('comment');
            // updateData.attachment = formData.get('attachment'); // Handle file upload separately/later
        } else {
            // If just updating info (e.g. rescheduling)
            const dateStr = formData.get('date');
            const timeStr = formData.get('time');
            if (dateStr && timeStr) {
                let dateObj;
                if (dateStr.includes('/')) {
                    const [day, month, year] = dateStr.split('/');
                    dateObj = new Date(`${year}-${month}-${day}T${timeStr}:00`);
                } else {
                    dateObj = new Date(`${dateStr}T${timeStr}:00`);
                }
                updateData.date = dateObj;
            }
            if (formData.get('type')) updateData.type = formData.get('type');
            if (formData.get('locationName')) updateData.locationName = formData.get('locationName');
            if (formData.get('note')) updateData.note = formData.get('note');
        }

        await prisma.supervision.update({
            where: { id },
            data: updateData
        });

        revalidatePath('/supervisions');
        return { success: true };
    } catch (error) {
        console.error('Failed to update supervision:', error);
        return { error: 'Failed to update supervision: ' + error.message };
    }
}

export async function deleteSupervision(id) {
    try {
        await prisma.supervision.delete({
            where: { id: parseInt(id) }
        });
        revalidatePath('/supervisions');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete supervision:', error);
        return { error: 'Failed to delete supervision: ' + error.message };
    }
}
