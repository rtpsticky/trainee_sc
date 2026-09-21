// Shared date helpers. Dates are always rendered in Thai time so the server-rendered
// HTML matches what the browser renders (avoids hydration mismatches) regardless of
// the timezone of the machine running the server.
const TZ = 'Asia/Bangkok'

export function formatDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
    if (!value) return '-'
    return new Date(value).toLocaleDateString('th-TH', { timeZone: TZ, ...options })
}

export function formatTime(value) {
    if (!value) return '-'
    return new Date(value).toLocaleTimeString('th-TH', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }) + ' น.'
}

export function formatDateTime(value) {
    if (!value) return '-'
    return `${formatDate(value)} ${formatTime(value)}`
}

// Group start / end dates are stored as UTC midnight (from <input type="date">).
export function formatDay(value) {
    if (!value) return '-'
    return new Date(value).toLocaleDateString('th-TH', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' })
}

// yyyy-mm-dd for <input type="date"> given a group start/end date.
export function toDayInputValue(value) {
    return value ? new Date(value).toISOString().slice(0, 10) : ''
}

// { date: 'yyyy-mm-dd', time: 'HH:mm' } in Thai time for the supervision form.
export function toDateTimeInputValues(value) {
    if (!value) return { date: '', time: '' }
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-CA', {
            timeZone: TZ, hourCycle: 'h23',
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
        }).formatToParts(new Date(value)).map(p => [p.type, p.value])
    )
    return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` }
}

export function formatTimeAgo(date) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    const units = [
        [31536000, 'ปี'], [2592000, 'เดือน'], [86400, 'วัน'], [3600, 'ชั่วโมง'], [60, 'นาที'],
    ]
    for (const [size, label] of units) {
        if (seconds >= size) return `${Math.floor(seconds / size)} ${label}ที่แล้ว`
    }
    return 'เมื่อสักครู่'
}

export const ROLE_LABELS = {
    STUDENT: 'นักศึกษา',
    TEACHER: 'อาจารย์',
    STAFF: 'เจ้าหน้าที่',
    ADMIN: 'ผู้บริหาร',
}

export const SUPERVISION_TYPE_LABELS = {
    ONSITE: 'นิเทศตัวต่อตัว',
    ONLINE: 'นิเทศออนไลน์',
    PHONE: 'นิเทศทางโทรศัพท์',
}

export const LOCATION_TYPE_LABELS = {
    HOSPITAL_CENTER: 'โรงพยาบาลศูนย์',
    HOSPITAL_GENERAL: 'โรงพยาบาลทั่วไป',
    HOSPITAL_COMMUNITY: 'โรงพยาบาลชุมชน',
    HEALTH_CENTER: 'สถานีอนามัย',
    OTHER: 'อื่นๆ',
}
