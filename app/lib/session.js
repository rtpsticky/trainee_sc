import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const isProduction = process.env.NODE_ENV === 'production'

// Read lazily so `next build` still works without the variable; only a running production server needs it.
function getKey() {
    const secret = process.env.SESSION_SECRET
    if (!secret && isProduction) throw new Error('SESSION_SECRET must be set in production')
    return new TextEncoder().encode(secret || 'your-secret-key-at-least-32-chars-long')
}

export async function createSession(payload) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const session = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(getKey())

    const cookieStore = await cookies()
    cookieStore.set('session', session, {
        httpOnly: true,
        // `secure` cookies are dropped by some browsers on plain http://localhost
        secure: isProduction,
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
        const { payload } = await jwtVerify(session, getKey(), {
            algorithms: ['HS256'],
        })
        return payload
    } catch {
        return null
    }
}

export async function deleteSession() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
}
