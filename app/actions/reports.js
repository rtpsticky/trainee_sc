'use server';

import prisma from '../lib/prisma';

export async function getDashboardStats() {
    try {
        // 1. General Counts
        const studentCount = await prisma.user.count({
            where: { role: 'STUDENT', status: 'ACTIVE' }
        });

        const teacherCount = await prisma.user.count({
            where: { role: 'TEACHER', status: 'ACTIVE' }
        });

        const locationCount = await prisma.location.count({
            where: { status: 'ACTIVE' }
        });

        const trainingGroupCount = await prisma.trainingGroup.count({
            where: { isActive: true }
        });

        // 2. Supervision Stats
        const supervisionTotal = await prisma.supervision.count();
        const supervisionPending = await prisma.supervision.count({ where: { status: 'PENDING' } });
        const supervisionCompleted = await prisma.supervision.count({ where: { status: 'COMPLETED' } });
        const supervisionCancelled = await prisma.supervision.count({ where: { status: 'CANCELLED' } });

        // 3. Supervision Results (for Completed ones)
        const supervisionResults = await prisma.supervision.groupBy({
            by: ['result'],
            where: { status: 'COMPLETED' },
            _count: { result: true }
        });

        // 4. Students per Location
        // Complex query: Location -> TrainingGroups -> Students
        const locations = await prisma.location.findMany({
            where: { status: 'ACTIVE' },
            select: {
                id: true,
                name: true,
                province: true,
                groups: {
                    select: {
                        _count: {
                            select: { students: true }
                        }
                    }
                }
            }
        });

        // Calculate total students per location from groups
        const locationStats = locations.map(loc => {
            const studentCount = loc.groups.reduce((sum, group) => sum + group._count.students, 0);
            return {
                id: loc.id,
                name: loc.name,
                province: loc.province,
                studentCount
            };
        }).sort((a, b) => b.studentCount - a.studentCount); // Sort by most students

        return {
            counts: {
                students: studentCount,
                teachers: teacherCount,
                locations: locationCount,
                groups: trainingGroupCount
            },
            supervision: {
                total: supervisionTotal,
                pending: supervisionPending,
                completed: supervisionCompleted,
                cancelled: supervisionCancelled,
                results: supervisionResults
            },
            locationStats
        };

    } catch (error) {
        console.error('Failed to get dashboard stats:', error);
        return { error: 'Failed to fetch dashboard statistics' };
    }
}
