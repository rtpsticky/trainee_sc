import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const secretKey = process.env.SESSION_SECRET || 'your-secret-key-at-least-32-chars-long'
const encodedKey = new TextEncoder().encode(secretKey)

export async function createSession(payload) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const session = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(encodedKey)

    const cookieStore = await cookies()
    cookieStore.set('session', session, {
        httpOnly: true,
        secure: true,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    })
}

export async function getSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    if (!session) return null

    try {
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ['HS256'],
        })
        return payload
    } catch (error) {
        console.error('Failed to verify session', error)
        return null
    }
}

export async function deleteSession() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
}

export async function verifySession() {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    const userId = await getSession()

    if (!userId || !session) {
        redirect('/login')
    }

    return userId
}
