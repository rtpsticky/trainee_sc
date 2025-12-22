const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10)

    // Create Admin/Staff User
    const staff = await prisma.user.upsert({
        where: { username: 'staff01' },
        update: {},
        create: {
            username: 'staff01',
            password: hashedPassword,
            email: 'wilaiwan@example.com',
            prefix: 'นางสาว',
            firstName: 'วิไลวรรณ',
            lastName: 'ใจดี',
            role: 'STAFF',
            status: 'ACTIVE',
        },
    })

    // Create Student User
    const student = await prisma.user.upsert({
        where: { username: 'std63001' },
        update: {},
        create: {
            username: 'std63001',
            password: hashedPassword,
            email: 'std63001@example.com',
            prefix: 'นาย',
            firstName: 'สมชาย',
            lastName: 'รักเรียน',
            role: 'STUDENT',
            studentId: '63001',
            major: 'สาธารณสุขศาสตร์',
            status: 'ACTIVE',
        },
    })

    console.log({ staff, student })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
