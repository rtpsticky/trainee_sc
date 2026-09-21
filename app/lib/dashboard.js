'use server';

import prisma from '../lib/prisma';
import { getDashboardStats } from './reports';

export async function getDashboardQuickStats() {
    return await getDashboardStats();
}

export async function getUpcomingSupervisions() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const supervisions = await prisma.supervision.findMany({
            where: {
                status: 'PENDING',
                date: {
                    gte: today
                }
            },
            include: {
                student: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                },
                supervisor: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: {
                date: 'asc'
            },
            take: 5
        });

        return supervisions;
    } catch (error) {
        console.error('Failed to fetch upcoming supervisions:', error);
        return [];
    }
}

export async function getRecentActivities() {
    try {
        // Synthesize activities from multiple sources
        // 1. New Supervisions
        const newSupervisions = await prisma.supervision.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { student: true }
        });

        // 2. New Users
        const newUsers = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        // 3. New Groups
        const newGroups = await prisma.trainingGroup.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        const activities = [];

        newSupervisions.forEach(s => {
            activities.push({
                type: 'SUPERVISION',
                title: 'นัดหมายนิเทศงานใหม่',
                desc: `นัดหมายนิเทศนักศึกษา ${s.student.firstName} ${s.student.lastName}`,
                date: s.createdAt,
                icon: 'fa-calendar-check',
                color: 'bg-blue-100 text-blue-600'
            });
        });

        newUsers.forEach(u => {
            activities.push({
                type: 'USER',
                title: 'ผู้ใช้งานใหม่',
                desc: `เพิ่มผู้ใช้งาน ${u.firstName} ${u.lastName} (${u.role})`,
                date: u.createdAt,
                icon: 'fa-user-plus',
                color: 'bg-green-100 text-green-600'
            });
        });

        newGroups.forEach(g => {
            activities.push({
                type: 'GROUP',
                title: 'กลุ่มฝึกงานใหม่',
                desc: `สร้างกลุ่มฝึกงาน ${g.name}`,
                date: g.createdAt,
                icon: 'fa-users',
                color: 'bg-purple-100 text-purple-600'
            });
        });

        // Sort combined activities by date descending and take top 10
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));

        return activities.slice(0, 10);
    } catch (error) {
        console.error('Failed to fetch recent activities:', error);
        return [];
    }
}
