import prisma from '@/lib/prisma'
import { route } from '@/lib/http'

export const dynamic = 'force-dynamic'

export const { GET, OPTIONS } = route({
    GET: async () => {
        await prisma.$queryRaw`SELECT 1`
        return { status: 'ok', db: 'ok', time: new Date().toISOString() }
    },
})
