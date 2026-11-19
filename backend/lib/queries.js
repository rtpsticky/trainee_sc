import 'server-only'
import prisma from './prisma'

// Read-only lists behind the GET endpoints. Each one selects only what the
// frontend shows, since the result is sent to the browser as JSON.

const personSelect = { id: true, prefix: true, firstName: true, lastName: true }

const studentSelect = {
    ...personSelect,
    studentId: true,
    academicYear: true,
    trainingGroupId: true,
    trainingGroup: { select: { id: true, name: true, location: { select: { name: true } } } },
}

export function listGroups() {
    return prisma.trainingGroup.findMany({
        include: {
            location: true,
            advisors: { select: { ...personSelect, email: true } },
            mentors: { orderBy: { id: 'asc' } },
            _count: { select: { students: true } },
        },
        orderBy: { id: 'desc' },
    })
}

export function listLocations() {
    return prisma.location.findMany({
        orderBy: { id: 'asc' },
        include: { _count: { select: { groups: true } } },
    })
}

// `role` / `status` narrow the list, e.g. active teachers for the advisor picker.
export function listUsers({ role, status } = {}) {
    return prisma.user.findMany({
        where: { ...(role ? { role } : {}), ...(status ? { status } : {}) },
        orderBy: { id: 'desc' },
        select: {
            id: true, username: true, email: true, prefix: true, firstName: true, lastName: true,
            role: true, status: true, studentId: true, major: true, academicYear: true,
            trainingGroupId: true,
            trainingGroup: { select: { name: true } },
        },
    })
}

// Active students, for the group member picker and the supervision form.
export function listStudents() {
    return prisma.user.findMany({
        where: { role: 'STUDENT', status: 'ACTIVE' },
        select: studentSelect,
        orderBy: [{ studentId: 'asc' }, { firstName: 'asc' }],
    })
}

export function listSupervisions() {
    return prisma.supervision.findMany({
        include: {
            student: { select: studentSelect },
            supervisor: { select: personSelect },
        },
        orderBy: { date: 'desc' },
    })
}
