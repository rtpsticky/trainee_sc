'use server';

import prisma from '../lib/prisma';
import { revalidatePath } from 'next/cache';

const DEFAULT_SETTINGS = [
    { key: 'SYSTEM_NAME', value: 'ระบบติดตามการฝึกงาน', description: 'ชื่อระบบที่แสดงส่วนหัว', group: 'GENERAL' },
    { key: 'ACADEMIC_YEAR', value: '2566', description: 'ปีการศึกษาปัจจุบัน', group: 'ACADEMIC' },
    { key: 'SEMESTER', value: '1', description: 'ภาคการศึกษาปัจจุบัน', group: 'ACADEMIC' },
    { key: 'CONTACT_EMAIL', value: 'science@psru.ac.th', description: 'อีเมลติดต่อผู้ดูแลระบบ', group: 'CONTACT' },
];

export async function getSettings() {
    try {
        const settings = await prisma.systemConfig.findMany({
            orderBy: { key: 'asc' }
        });

        // Convert array to object for easier consumption { KEY: VALUE }
        // Also keep full list for editing UI
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        // If specific keys are missing, we might want to return defaults or seed them
        // Check if database is empty or missing keys
        if (settings.length === 0) {
            await seedSettings();
            return await getSettings(); // Recursively call once to get fresh data
        }

        return { settings, settingsMap };
    } catch (error) {
        console.error('Failed to fetch settings:', error);
        return { error: 'Failed to fetch settings' };
    }
}

export async function updateSetting(formData) {
    try {
        // Handle multiple updates if needed, or single
        // Assuming the form sends key-value pairs
        // For simplicity, let's look for known keys in formData

        const updates = [];

        // Iterate through all entries to find valid keys
        for (const [key, value] of formData.entries()) {
            // We can check if this key exists in our known defaults or DB, or just upsert everything
            // Ideally we shouldn't allow arbitrary keys via public action without check

            // Simple check: is it one of our known keys?
            const knownKeys = DEFAULT_SETTINGS.map(s => s.key);
            if (knownKeys.includes(key)) {
                updates.push(prisma.systemConfig.upsert({
                    where: { key: key },
                    update: { value: value.toString() },
                    create: { key: key, value: value.toString(), group: 'GENERAL' } // Fallback group
                }));
            }
        }

        await Promise.all(updates);

        revalidatePath('/settings');
        revalidatePath('/'); // Update layouts that might use these settings
        return { success: true };
    } catch (error) {
        console.error('Failed to update settings:', error);
        return { error: 'Failed to update settings: ' + error.message };
    }
}

export async function seedSettings() {
    try {
        for (const setting of DEFAULT_SETTINGS) {
            await prisma.systemConfig.upsert({
                where: { key: setting.key },
                update: {}, // Don't overwrite if exists
                create: setting
            });
        }
        return { success: true };
    } catch (error) {
        console.error('Failed to seed settings:', error);
        return { error: 'Failed to seed settings' };
    }
}
