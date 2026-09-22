'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { registerUser } from '../actions/register'
import { ErrorAlert, inputClass, labelClass, primaryButton, useServerAction } from '../components/ui'

const ROLE_OPTIONS = [
    { value: 'STUDENT', label: 'นักศึกษา', icon: 'fa-user-graduate' },
    { value: 'TEACHER', label: 'ที่ปรึกษา (อาจารย์)', icon: 'fa-chalkboard-teacher' },
]

export default function RegisterForm({ systemName, groups }) {
    const [role, setRole] = useState('STUDENT')
    const [submitted, setSubmitted] = useState(false)
    const { run, isPending, error } = useServerAction()

    const handleSubmit = (e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        run(() => registerUser(formData), () => setSubmitted(true))
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-2xl w-full space-y-6 bg-white p-8 rounded-lg card-shadow">
                <div>
                    <div className="mx-auto w-16 h-16 relative">
                        <Image src="/logo.jpeg" alt="มหาวิทยาลัยราชภัฏพิบูลสงคราม" fill className="object-contain" />
                    </div>
                    <h2 className="mt-4 text-center text-2xl font-extrabold text-blue-900">{systemName}</h2>
                    <p className="mt-1 text-center text-sm text-gray-600">สมัครสมาชิกเข้าใช้งานระบบ</p>
                </div>

                {submitted ? (
                    <div className="text-center py-6">
                        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
                            <i className="fas fa-check text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">สมัครสมาชิกสำเร็จ</h3>
                        <p className="text-sm text-gray-600 mt-2">
                            กรุณารอการอนุมัติจากผู้ดูแลระบบ ท่านจะสามารถเข้าสู่ระบบได้หลังบัญชีได้รับการอนุมัติแล้ว
                        </p>
                        <Link href="/login" className={`${primaryButton} mt-6 inline-flex`}>
                            <i className="fas fa-arrow-left mr-2"></i> กลับไปหน้าเข้าสู่ระบบ
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <ErrorAlert>{error}</ErrorAlert>

                        <div>
                            <label className={labelClass}>ประเภทผู้สมัคร</label>
                            <div className="grid grid-cols-2 gap-3">
                                {ROLE_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setRole(opt.value)}
                                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors ${role === opt.value
                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <i className={`fas ${opt.icon}`}></i> {opt.label}
                                    </button>
                                ))}
                            </div>
                            <input type="hidden" name="role" value={role} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>คำนำหน้า</label>
                                <input type="text" name="prefix" placeholder="นาย, นางสาว" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>ชื่อจริง <span className="text-red-500">*</span></label>
                                <input type="text" name="firstName" required className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>นามสกุล <span className="text-red-500">*</span></label>
                                <input type="text" name="lastName" required className={inputClass} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>อีเมล <span className="text-red-500">*</span></label>
                                <input type="email" name="email" required className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>ชื่อผู้ใช้ (Username) <span className="text-red-500">*</span></label>
                                <input type="text" name="username" required autoComplete="off" className={inputClass} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>รหัสผ่าน <span className="text-red-500">*</span></label>
                                <input type="password" name="password" minLength={6} required autoComplete="new-password" placeholder="อย่างน้อย 6 ตัวอักษร" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>ยืนยันรหัสผ่าน <span className="text-red-500">*</span></label>
                                <input type="password" name="confirmPassword" minLength={6} required autoComplete="new-password" className={inputClass} />
                            </div>
                        </div>

                        {role === 'STUDENT' && (
                            <div className="border-t border-gray-100 pt-4">
                                <p className="text-sm font-semibold text-gray-700 mb-3">
                                    <i className="fas fa-user-graduate mr-2 text-blue-500"></i>ข้อมูลนักศึกษา
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className={labelClass}>รหัสนักศึกษา <span className="text-red-500">*</span></label>
                                        <input type="text" name="studentId" required={role === 'STUDENT'} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>สาขาวิชา</label>
                                        <input type="text" name="major" defaultValue="สาธารณสุขศาสตร์" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>รุ่นปี (เช่น 66)</label>
                                        <input type="number" name="academicYear" min="0" className={inputClass} />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className={labelClass}>กลุ่มฝึกงาน</label>
                                    <select name="trainingGroupId" defaultValue="" className={inputClass}>
                                        <option value="">-- ยังไม่จัดกลุ่ม / ให้เจ้าหน้าที่จัดให้ --</option>
                                        {groups.map(g => {
                                            const full = g._count.students >= g.capacity
                                            return (
                                                <option key={g.id} value={g.id} disabled={full}>
                                                    {g.name} (รุ่น {g.generation}) - {g._count.students}/{g.capacity}{full ? ' เต็ม' : ''}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>
                            </div>
                        )}

                        <button type="submit" disabled={isPending} className={`${primaryButton} w-full`}>
                            {isPending ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
                        </button>

                        <p className="text-center text-sm text-gray-600">
                            มีบัญชีอยู่แล้ว? <Link href="/login" className="font-medium text-blue-600 hover:text-blue-800">เข้าสู่ระบบ</Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    )
}
