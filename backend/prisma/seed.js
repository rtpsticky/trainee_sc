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

    console.log({ staff })
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
