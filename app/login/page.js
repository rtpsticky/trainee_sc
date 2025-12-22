'use client'

import { useActionState } from 'react'
import Image from 'next/image'
import { login } from '../actions/auth'

export default function LoginPage() {
    const [state, action, isPending] = useActionState(login, undefined)

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg card-shadow">
                <div>
                    <div className="mx-auto w-20 h-20 relative">
                        <Image
                            src="/logo.jpeg"
                            alt="มหาวิทยาลัยราชภัฏพิบูลสงคราม"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-900">
                        ระบบฝึกงาน
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        สาขาสาธารณสุขศาสตร์ มหาวิทยาลัยราชภัฏพิบูลสงคราม
                    </p>
                </div>
                <form className="mt-8 space-y-6" action={action}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">
                                ชื่อผู้ใช้
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="ชื่อผู้ใช้"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                รหัสผ่าน
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="รหัสผ่าน"
                            />
                        </div>
                    </div>

                    {state?.message && (
                        <div className="text-red-500 text-sm text-center">
                            {state.message}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <i className="fas fa-lock group-hover:text-blue-200 text-blue-500 transition ease-in-out duration-150"></i>
                            </span>
                            {isPending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
