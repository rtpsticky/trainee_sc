// Client for the backend API (VITE_API_URL). The mutation helpers keep the same
// names and arguments as the old server actions, and resolve to
// { success, ... } or { error }, so components handle results the same way.

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const TOKEN_KEY = 'trainee_sc.token'

// Fired after every successful change so pages reload their data
// (replaces Next's revalidatePath).
export const DATA_CHANGED = 'trainee_sc:data-changed'
// Fired when the API rejects the stored token, so the app can send the user to /login.
export const AUTH_EXPIRED = 'trainee_sc:auth-expired'

export function getToken() {
    try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}

export function setToken(token) {
    try {
        if (token) localStorage.setItem(TOKEN_KEY, token)
        else localStorage.removeItem(TOKEN_KEY)
    } catch { /* storage unavailable: the session just won't survive a reload */ }
}

// FormData -> JSON object; repeated keys (multi-selects, checkboxes) become arrays.
function formToJson(formData) {
    const json = {}
    for (const key of new Set(formData.keys())) {
        const values = formData.getAll(key)
        json[key] = values.length > 1 ? values : values[0]
    }
    return json
}

export async function request(method, path, body) {
    const headers = {}
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
    if (body !== undefined) headers['Content-Type'] = 'application/json'

    let res
    try {
        res = await fetch(BASE_URL + path, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body instanceof FormData ? formToJson(body) : body),
        })
    } catch {
        return { error: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง', status: 0 }
    }

    const data = await res.json().catch(() => ({}))
    if (res.status === 401 && token) window.dispatchEvent(new Event(AUTH_EXPIRED))
    if (!res.ok) return { error: data.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', status: res.status, ...data }
    return data
}

async function mutate(method, path, body) {
    const result = await request(method, path, body)
    if (!result.error) window.dispatchEvent(new Event(DATA_CHANGED))
    return result
}

// Auth
export const login = (formData) => request('POST', '/auth/login', formData)
export const fetchMe = () => request('GET', '/auth/me')
export const registerUser = (formData) => request('POST', '/auth/register', formData)

// Settings
export const updateSettings = (formData) => mutate('PUT', '/settings', formData)

// Locations
export const createLocation = (formData) => mutate('POST', '/locations', formData)
export const updateLocation = (id, formData) => mutate('PUT', `/locations/${id}`, formData)
export const deleteLocation = (id) => mutate('DELETE', `/locations/${id}`)

// Training groups
export const createGroup = (formData) => mutate('POST', '/groups', formData)
export const updateGroup = (id, formData) => mutate('PUT', `/groups/${id}`, formData)
export const deleteGroup = (id) => mutate('DELETE', `/groups/${id}`)
export const addStudentsToGroup = (groupId, studentIds) => mutate('POST', `/groups/${groupId}/students`, { studentIds })
export const removeStudentFromGroup = (groupId, studentId) => mutate('DELETE', `/groups/${groupId}/students/${studentId}`)

// Mentors
export const createMentor = (groupId, formData) => mutate('POST', `/groups/${groupId}/mentors`, formData)
export const updateMentor = (id, formData) => mutate('PUT', `/mentors/${id}`, formData)
export const deleteMentor = (id) => mutate('DELETE', `/mentors/${id}`)

// Users
export const createUser = (formData) => mutate('POST', '/users', formData)
export const updateUser = (id, formData) => mutate('PUT', `/users/${id}`, formData)
export const deleteUser = (id) => mutate('DELETE', `/users/${id}`)
export const approveUser = (id) => mutate('POST', `/users/${id}/approve`)
export const rejectUser = (id) => mutate('POST', `/users/${id}/reject`)

// Supervisions (the id travels in the form, as before)
export const createSupervision = (formData) => mutate('POST', '/supervisions', formData)
export const updateSupervision = (formData) => mutate('PUT', `/supervisions/${formData.get('id')}`, formData)
export const deleteSupervision = (id) => mutate('DELETE', `/supervisions/${id}`)
