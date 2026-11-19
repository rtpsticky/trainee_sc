import 'server-only'
import { NextResponse } from 'next/server'

// Comma separated list of frontend origins allowed to call the API, e.g.
// CORS_ORIGINS="https://trainee-sc.example.workers.dev,http://localhost:5173"
const allowedOrigins = () =>
    (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim()).filter(Boolean)

function corsHeaders(request) {
    const origin = request.headers.get('origin')
    const allowed = allowedOrigins()
    const headers = { Vary: 'Origin' }
    if (origin && (allowed.includes('*') || allowed.includes(origin))) {
        headers['Access-Control-Allow-Origin'] = origin
        headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type'
        headers['Access-Control-Max-Age'] = '86400'
    }
    return headers
}

// Wraps route handlers so each one only returns a plain result object:
// { error, status? } becomes a 4xx response, anything else a 200 JSON body.
// Also answers CORS preflight requests for the route.
export function route(handlers) {
    const wrapped = {
        OPTIONS: (request) => new Response(null, { status: 204, headers: corsHeaders(request) }),
    }

    for (const [method, handler] of Object.entries(handlers)) {
        wrapped[method] = async (request, context) => {
            let body
            let status = 200
            try {
                const params = context?.params ? await context.params : {}
                body = (await handler({ request, params })) ?? { success: true }
                if (body.error) {
                    const { status: errorStatus, ...rest } = body
                    status = errorStatus || 400
                    body = rest
                }
            } catch (error) {
                console.error(`${method} ${new URL(request.url).pathname} failed:`, error)
                status = 500
                body = { error: 'เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง' }
            }
            return NextResponse.json(body, { status, headers: corsHeaders(request) })
        }
    }

    return wrapped
}

// Reads the request body as FormData whether it was sent as multipart/urlencoded or JSON,
// so the service parsers behave the same either way. JSON arrays become repeated keys.
export async function readForm(request) {
    const type = request.headers.get('content-type') || ''
    if (!type.includes('application/json')) {
        return request.formData().catch(() => new FormData())
    }

    const json = await request.json().catch(() => ({}))
    const form = new FormData()
    for (const [key, value] of Object.entries(json ?? {})) {
        for (const item of [].concat(value)) {
            if (item !== null && item !== undefined) form.append(key, String(item))
        }
    }
    return form
}

export const toId = (value) => parseInt(value, 10)
