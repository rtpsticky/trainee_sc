import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { headers } from 'next/headers'

const isProduction = process.env.NODE_ENV === 'production'

// Read lazily so `next build` still works without the variable; only a running production server needs it.
function getKey() {
    const secret = process.env.SESSION_SECRET
    if (!secret && isProduction) throw new Error('SESSION_SECRET must be set in production')
    return new TextEncoder().encode(secret || 'your-secret-key-at-least-32-chars-long')
}

// The frontend lives on another domain (Cloudflare), so the session travels as a
// Bearer token in the Authorization header instead of a cookie.
export async function createToken(payload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(getKey())
}

export async function getSession() {
    const authorization = (await headers()).get('authorization') || ''
    const [scheme, token] = authorization.split(' ')
    if (scheme !== 'Bearer' || !token) return null

    try {
        const { payload } = await jwtVerify(token, getKey(), {
            algorithms: ['HS256'],
        })
        return payload
    } catch {
        return null
    }
}
