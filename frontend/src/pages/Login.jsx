import { useActionState, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { login } from '../lib/api'
import { useAuth } from '../lib/auth'
import { ErrorAlert, notifySuccess } from '../components/ui'
import { LOGO_ALT, ORG } from '../lib/org'

const HELP_STEPS = [
    'กรอกชื่อผู้ใช้ที่ได้ตั้งไว้ตอนสมัครสมาชิก',
    'กรอกรหัสผ่าน (กดรูปตาเพื่อดูรหัสที่พิมพ์)',
    'กดปุ่ม "เข้าสู่ระบบ"',
]

export default function LoginForm() {
    const { settings, signIn } = useAuth()
    const systemName = settings.SYSTEM_NAME
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => { document.title = `เข้าสู่ระบบ | ${systemName}` }, [systemName])

    const [state, action, isPending] = useActionState(async (_prevState, formData) => {
        const username = String(formData.get('username') || '').trim()
        const result = await login(formData)
        if (result.error) return { message: result.error, username }
        signIn(result.token, result.user)
        notifySuccess(`ยินดีต้อนรับ คุณ${result.user.firstName}`)
        navigate('/', { replace: true })
    }, undefined)

    return (
        <div className="min-h-screen bg-page flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden block-card">
                {/* Info panel */}
                <div className="bg-gradient-to-br from-brand-800 to-brand-600 text-white p-8 sm:p-10 flex flex-col">
                    <Link to="/" className="inline-flex items-center gap-2 text-blue-100 hover:text-white text-base mb-8">
                        <i className="fas fa-arrow-left"></i> กลับหน้าแรก
                    </Link>
                    <img src="/main-logo.png" alt={LOGO_ALT} className="w-20 h-20 object-contain bg-white rounded-2xl p-2 mb-6" />
                    <h1 className="text-2xl sm:text-3xl font-bold leading-snug mb-2">{systemName}</h1>
                    <div className="text-lg text-blue-100 font-light mb-8 leading-relaxed">
                        <p className="font-normal text-white">{ORG.program}</p>
                        <p>{ORG.faculty} {ORG.university}</p>
                    </div>

                    <div className="mt-auto rounded-2xl bg-white/10 p-5">
                        <p className="text-lg font-medium mb-4">วิธีเข้าสู่ระบบ</p>
                        <ol className="space-y-3">
                            {HELP_STEPS.map((s, i) => (
                                <li key={s} className="flex items-start gap-3">
                                    <span className="w-8 h-8 rounded-full bg-white text-brand-700 font-semibold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                                    <span className="text-base text-blue-50 pt-0.5">{s}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white p-8 sm:p-10">
                    <h2 className="text-3xl font-semibold text-ink mb-1">เข้าสู่ระบบ</h2>
                    <p className="text-lg text-muted mb-8">กรอกชื่อผู้ใช้และรหัสผ่านของท่าน</p>

                    <form action={action} className="space-y-6">
                        <ErrorAlert>{state?.message}</ErrorAlert>

                        <div>
                            <label htmlFor="username" className="field-label text-lg">
                                <span className="inline-flex w-7 h-7 rounded-full bg-brand-50 text-brand-700 text-base items-center justify-center mr-2">1</span>
                                ชื่อผู้ใช้
                            </label>
                            <div className="relative">
                                <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input
                                    id="username" name="username" type="text" required autoFocus
                                    autoComplete="username" defaultValue={state?.username}
                                    placeholder="เช่น std66001"
                                    className="field-input pl-11 py-4 text-lg"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="field-label text-lg">
                                <span className="inline-flex w-7 h-7 rounded-full bg-brand-50 text-brand-700 text-base items-center justify-center mr-2">2</span>
                                รหัสผ่าน
                            </label>
                            <div className="relative">
                                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input
                                    id="password" name="password" required
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    placeholder="รหัสผ่าน"
                                    className="field-input pl-11 pr-14 py-4 text-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-lg text-gray-500 hover:bg-gray-100"
                                    aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                                >
                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={isPending} className="btn btn-primary w-full text-lg py-4">
                            {isPending
                                ? <><i className="fas fa-spinner fa-spin"></i> กำลังเข้าสู่ระบบ...</>
                                : <><span className="inline-flex w-7 h-7 rounded-full bg-white/20 text-base items-center justify-center">3</span> เข้าสู่ระบบ</>}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-line text-center">
                        <p className="text-base text-muted mb-3">ยังไม่มีบัญชีผู้ใช้?</p>
                        <Link to="/register" className="btn btn-secondary w-full text-lg">
                            <i className="fas fa-user-plus text-brand-600"></i> สมัครสมาชิกใหม่
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
