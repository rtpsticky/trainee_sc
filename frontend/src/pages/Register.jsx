import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { registerUser } from '../lib/api'
import { useAuth } from '../lib/auth'
import { ErrorAlert, Field, inputClass, primaryButton, secondaryButton, useServerAction } from '../components/ui'

const ROLE_OPTIONS = [
    { value: 'STUDENT', label: 'นักศึกษา', desc: 'นักศึกษาที่จะออกฝึกประสบการณ์วิชาชีพ', icon: 'fa-user-graduate' },
    { value: 'TEACHER', label: 'อาจารย์ที่ปรึกษา', desc: 'อาจารย์ผู้นิเทศและติดตามนักศึกษา', icon: 'fa-chalkboard-user' },
]

const STEPS = ['เลือกประเภทผู้สมัคร', 'ข้อมูลส่วนตัว', 'ตั้งชื่อผู้ใช้และรหัสผ่าน']

const AFTER_STEPS = [
    'เจ้าหน้าที่ตรวจสอบข้อมูลและอนุมัติบัญชีของท่าน',
    'เมื่อได้รับอนุมัติ เข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่านที่ตั้งไว้',
    'ดูกลุ่มฝึกงานและปฏิทินการนิเทศได้ที่หน้าหลัก',
]

export default function RegisterForm() {
    const systemName = useAuth().settings.SYSTEM_NAME
    const [role, setRole] = useState('STUDENT')
    const [step, setStep] = useState(0)
    const [submitted, setSubmitted] = useState(false)
    const { run, isPending, error, setError } = useServerAction()
    const formRef = useRef(null)

    useEffect(() => { document.title = `สมัครสมาชิก | ${systemName}` }, [systemName])

    // Checks the fields of one wizard step with the browser's own validation messages.
    const validateStep = (index) => {
        const section = formRef.current?.querySelector(`[data-step="${index}"]`)
        if (!section) return true
        for (const el of section.querySelectorAll('input, select, textarea')) {
            if (!el.checkValidity()) {
                setStep(index)
                // Wait for the step to become visible before showing the browser bubble.
                setTimeout(() => el.reportValidity(), 0)
                return false
            }
        }
        if (index === 2) {
            const form = formRef.current
            if (form.password.value !== form.confirmPassword.value) {
                setError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน')
                return false
            }
        }
        return true
    }

    const next = () => {
        setError('')
        if (validateStep(step)) setStep(s => Math.min(s + 1, STEPS.length - 1))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')
        for (let i = 0; i < STEPS.length; i++) if (!validateStep(i)) return
        const formData = new FormData(e.currentTarget)
        run(() => registerUser(formData), () => setSubmitted(true), false)
    }

    return (
        <div className="min-h-screen bg-page py-6 sm:py-10 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between gap-3 mb-6">
                    <Link to="/" className="flex items-center gap-3 min-w-0">
                        <img src="/main-logo.png" alt="มหาวิทยาลัยราชภัฏพิบูลสงคราม" className="w-12 h-12 object-contain flex-shrink-0" />
                        <span className="font-semibold text-brand-800 text-lg leading-tight truncate">{systemName}</span>
                    </Link>
                    <Link to="/login" className="btn btn-secondary btn-sm flex-shrink-0">มีบัญชีแล้ว? เข้าสู่ระบบ</Link>
                </div>

                <div className="block-card overflow-hidden">
                    <div className="px-6 sm:px-10 pt-8 pb-6 border-b border-line">
                        <h1 className="text-3xl font-semibold text-ink">สมัครสมาชิก</h1>
                        <p className="text-lg text-muted">
                            {submitted ? 'ส่งข้อมูลเรียบร้อยแล้ว' : `ขั้นตอนที่ ${step + 1} จาก ${STEPS.length}: ${STEPS[step]}`}
                        </p>
                        {!submitted && <Stepper current={step} />}
                    </div>

                    {submitted ? (
                        <div className="p-6 sm:p-10 text-center">
                            <span className="mx-auto mb-5 w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                <i className="fas fa-check text-4xl"></i>
                            </span>
                            <h2 className="text-2xl font-semibold text-ink mb-2">สมัครสมาชิกสำเร็จ</h2>
                            <p className="text-lg text-muted mb-8">ขั้นตอนต่อไปของท่าน</p>
                            <ol className="text-left max-w-xl mx-auto space-y-3 mb-8">
                                {AFTER_STEPS.map((s, i) => (
                                    <li key={s} className="flex items-start gap-4 rounded-2xl bg-page p-4">
                                        <span className="w-9 h-9 rounded-full bg-brand-600 text-white font-semibold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                                        <span className="text-lg text-ink pt-0.5">{s}</span>
                                    </li>
                                ))}
                            </ol>
                            <Link to="/login" className={`${primaryButton} text-lg px-8 py-4`}>
                                <i className="fas fa-right-to-bracket"></i> ไปหน้าเข้าสู่ระบบ
                            </Link>
                        </div>
                    ) : (
                        <form ref={formRef} onSubmit={handleSubmit} noValidate>
                            <div className="p-6 sm:p-10">
                                <ErrorAlert>{error}</ErrorAlert>
                                <input type="hidden" name="role" value={role} />

                                {/* Step 1: role */}
                                <div data-step="0" hidden={step !== 0}>
                                    <p className="text-lg text-ink mb-4">ท่านสมัครในฐานะใด? (เลือก 1 ข้อ)</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {ROLE_OPTIONS.map(opt => {
                                            const active = role === opt.value
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => setRole(opt.value)}
                                                    aria-pressed={active}
                                                    className={`relative text-left rounded-2xl border-2 p-6 transition ${active ? 'border-brand-600 bg-brand-50' : 'border-line hover:border-gray-400'}`}
                                                >
                                                    {active && <i className="fas fa-circle-check text-2xl text-brand-600 absolute top-4 right-4"></i>}
                                                    <span className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${active ? 'bg-brand-600 text-white' : 'bg-gray-100 text-brand-700'}`}>
                                                        <i className={`fas ${opt.icon} text-2xl`}></i>
                                                    </span>
                                                    <span className="block text-xl font-semibold text-ink">{opt.label}</span>
                                                    <span className="block text-base text-muted mt-1">{opt.desc}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Step 2: personal info */}
                                <div data-step="1" hidden={step !== 1} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <Field label="คำนำหน้า">
                                            <input type="text" name="prefix" placeholder="นาย, นางสาว" className={inputClass} />
                                        </Field>
                                        <Field label="ชื่อจริง" required>
                                            <input type="text" name="firstName" required className={inputClass} />
                                        </Field>
                                        <Field label="นามสกุล" required>
                                            <input type="text" name="lastName" required className={inputClass} />
                                        </Field>
                                    </div>
                                    <Field label="อีเมล" required hint="ใช้สำหรับติดต่อกลับ">
                                        <input type="email" name="email" required placeholder="name@example.com" className={inputClass} />
                                    </Field>
                                    {role === 'STUDENT' && (
                                        <div className="rounded-2xl bg-page p-5 space-y-4">
                                            <p className="text-lg font-medium text-ink"><i className="fas fa-user-graduate text-brand-600 mr-2"></i>ข้อมูลนักศึกษา</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <Field label="รหัสนักศึกษา" required>
                                                    <input type="text" name="studentId" required inputMode="numeric" className={inputClass} />
                                                </Field>
                                                <Field label="สาขาวิชา">
                                                    <input type="text" name="major" defaultValue="สาธารณสุขศาสตร์" className={inputClass} />
                                                </Field>
                                                <Field label="รุ่นปี" hint="เช่น 66">
                                                    <input type="number" name="academicYear" min="0" className={inputClass} />
                                                </Field>
                                            </div>
                                            <p className="text-base text-muted">
                                                <i className="fas fa-circle-info mr-1"></i>เจ้าหน้าที่จะจัดกลุ่มฝึกงานให้หลังจากบัญชีได้รับการอนุมัติ
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Step 3: account */}
                                <div data-step="2" hidden={step !== 2} className="space-y-5">
                                    <Field label="ชื่อผู้ใช้ (Username)" required hint="ใช้ตัวอักษรภาษาอังกฤษหรือตัวเลข จดจำไว้ใช้เข้าสู่ระบบ">
                                        <input type="text" name="username" required autoComplete="off" className={inputClass} />
                                    </Field>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Field label="รหัสผ่าน" required hint="อย่างน้อย 6 ตัวอักษร">
                                            <input type="password" name="password" minLength={6} required autoComplete="new-password" className={inputClass} />
                                        </Field>
                                        <Field label="ยืนยันรหัสผ่าน" required hint="พิมพ์รหัสผ่านซ้ำอีกครั้ง">
                                            <input type="password" name="confirmPassword" minLength={6} required autoComplete="new-password" className={inputClass} />
                                        </Field>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 sm:px-10 py-5 border-t border-line bg-gray-50 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
                                {step > 0
                                    ? <button type="button" onClick={() => { setError(''); setStep(s => s - 1) }} className={`${secondaryButton} text-lg`}><i className="fas fa-arrow-left"></i> ย้อนกลับ</button>
                                    : <Link to="/" className={`${secondaryButton} text-lg`}>ยกเลิก</Link>}
                                {step < STEPS.length - 1 ? (
                                    <button type="button" onClick={next} className={`${primaryButton} text-lg px-8`}>
                                        ถัดไป: {STEPS[step + 1]} <i className="fas fa-arrow-right"></i>
                                    </button>
                                ) : (
                                    <button type="submit" disabled={isPending} className={`${primaryButton} text-lg px-8`}>
                                        {isPending ? <><i className="fas fa-spinner fa-spin"></i> กำลังส่งข้อมูล...</> : <><i className="fas fa-paper-plane"></i> ส่งใบสมัคร</>}
                                    </button>
                                )}
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

function Stepper({ current }) {
    return (
        <ol className="mt-6 flex items-center">
            {STEPS.map((label, i) => {
                const state = i < current ? 'done' : i === current ? 'active' : 'todo'
                return (
                    <li key={label} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <span className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-lg flex-shrink-0 ${state === 'done' ? 'bg-green-600 text-white' : state === 'active' ? 'bg-brand-600 text-white' : 'bg-white border-2 border-gray-300 text-gray-500'}`}>
                                {state === 'done' ? <i className="fas fa-check"></i> : i + 1}
                            </span>
                            <span className={`hidden md:block text-base ${state === 'todo' ? 'text-muted' : 'text-ink font-medium'}`}>{label}</span>
                        </div>
                        {i < STEPS.length - 1 && <span className={`flex-1 h-1 mx-3 rounded-full ${i < current ? 'bg-green-600' : 'bg-gray-200'}`}></span>}
                    </li>
                )
            })}
        </ol>
    )
}
