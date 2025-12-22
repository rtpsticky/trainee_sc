'use server'

import { revalidatePath } from 'next/cache'
import prisma from '../lib/prisma'
import { redirect } from 'next/navigation'

export async function createLocation(formData) {
    const name = formData.get('name')
    const address = formData.get('address')
    const province = formData.get('province')
    const type = formData.get('type')
    const status = formData.get('status') || 'ACTIVE'

    if (!name) {
        return { error: 'Name is required' }
    }

    try {
        await prisma.location.create({
            data: {
                name,
                address,
                province,
                type,
                status,
            },
        })
    } catch (error) {
        console.error('Failed to create location:', error)
        return { error: 'Failed to create location' }
    }

    revalidatePath('/locations')
    return { success: true }
}

export async function updateLocation(id, formData) {
    const name = formData.get('name')
    const address = formData.get('address')
    const province = formData.get('province')
    const type = formData.get('type')
    const status = formData.get('status')

    try {
        await prisma.location.update({
            where: { id: parseInt(id) },
            data: {
                name,
                address,
                province,
                type,
                status,
            },
        })
    } catch (error) {
        console.error('Failed to update location:', error)
        return { error: 'Failed to update location' }
    }

    revalidatePath('/locations')
    return { success: true }
}

export async function deleteLocation(id) {
    try {
        await prisma.location.delete({
            where: { id: parseInt(id) },
        })
    } catch (error) {
        console.error('Failed to delete location:', error)
        return { error: 'Failed to delete location' }
    }

    revalidatePath('/locations')
    return { success: true }
}
