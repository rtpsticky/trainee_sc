import { useEffect } from 'react';
import { Link } from 'react-router';

const STEPS = [
    { icon: 'fa-user-plus', title: 'สมัครสมาชิก', desc: 'กรอกข้อมูลส่วนตัวและตั้งรหัสผ่าน ใช้เวลาประมาณ 3 นาที' },
    { icon: 'fa-user-check', title: 'รอการอนุมัติ', desc: 'เจ้าหน้าที่ตรวจสอบข้อมูลและอนุมัติบัญชีของท่าน' },
    { icon: 'fa-right-to-bracket', title: 'เข้าสู่ระบบ', desc: 'ใช้ชื่อผู้ใช้และรหัสผ่านที่ตั้งไว้ เพื่อดูกลุ่มฝึกงาน' },
    { icon: 'fa-clipboard-check', title: 'ฝึกงานและรับการนิเทศ', desc: 'ดูตารางฝึกงาน นัดหมายนิเทศ และติดตามผลได้ทุกที่' },
];

const FEATURES = [
    { icon: 'fa-people-group', color: 'bg-blue-50 text-blue-700', title: 'จัดกลุ่มฝึกงาน', desc: 'จัดนักศึกษาเข้ากลุ่มและแหล่งฝึกอย่างเป็นระบบ พร้อมพี่เลี้ยงประจำกลุ่ม' },
    { icon: 'fa-calendar-days', color: 'bg-amber-50 text-amber-700', title: 'ปฏิทินฝึกงาน', desc: 'ดูช่วงเวลาฝึกงานและวันนัดนิเทศในรูปแบบปฏิทินที่อ่านง่าย' },
    { icon: 'fa-chalkboard-user', color: 'bg-green-50 text-green-700', title: 'นิเทศติดตามผล', desc: 'อาจารย์นัดหมายและบันทึกผลการนิเทศได้ทันทีหลังเสร็จสิ้น' },
    { icon: 'fa-chart-column', color: 'bg-purple-50 text-purple-700', title: 'รายงานสรุปผล', desc: 'สรุปภาพรวมการฝึกงานและผลการประเมิน พร้อมพิมพ์เป็นเอกสาร' },
];

export default function LandingPage({ settings }) {
    const year = new Date().getFullYear() + 543;

    useEffect(() => { document.title = settings.SYSTEM_NAME; }, [settings.SYSTEM_NAME]);

    return (
        <div className="min-h-screen bg-page">
            {/* Top bar */}
            <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-line">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                    <Link to="/" className="flex items-center gap-3 min-w-0">
                        <img src="/main-logo.png" alt="มหาวิทยาลัยราชภัฏพิบูลสงคราม" className="w-12 h-12 object-contain flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="font-semibold text-brand-800 text-base sm:text-lg leading-tight truncate">{settings.SYSTEM_NAME}</p>
                            <p className="text-sm text-muted hidden sm:block">มหาวิทยาลัยราชภัฏพิบูลสงคราม</p>
                        </div>
                    </Link>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Link to="/login" className="btn btn-secondary btn-sm sm:px-5 sm:py-2.5 sm:text-base">เข้าสู่ระบบ</Link>
                        <Link to="/register" className="btn btn-primary btn-sm sm:px-5 sm:py-2.5 sm:text-base hidden sm:inline-flex">สมัครสมาชิก</Link>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
                {/* Hero */}
                <section className="rounded-3xl bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 text-white px-6 sm:px-12 py-12 sm:py-16 relative overflow-hidden">
                    <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/5"></div>
                    <div className="absolute right-24 -bottom-24 w-64 h-64 rounded-full bg-white/5"></div>
                    <div className="relative max-w-3xl">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-white/15 text-base mb-5">
                            สาขาวิชาสาธารณสุขศาสตร์ · คณะวิทยาศาสตร์และเทคโนโลยี
                        </span>
                        <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5">{settings.SYSTEM_NAME}</h1>
                        <p className="text-lg sm:text-xl text-blue-100 font-light mb-8">
                            ระบบกลางสำหรับการฝึกประสบการณ์วิชาชีพ ตั้งแต่สมัครสมาชิก จัดกลุ่มฝึกงาน นิเทศติดตาม จนถึงรายงานผล
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link to="/register" className="btn bg-white text-brand-800 hover:bg-blue-50 text-lg px-8 py-4 shadow-lg">
                                <i className="fas fa-user-plus"></i> สมัครสมาชิก
                            </Link>
                            <Link to="/login" className="btn border-2 border-white/60 text-white hover:bg-white/10 text-lg px-8 py-4">
                                <i className="fas fa-right-to-bracket"></i> เข้าสู่ระบบ
                            </Link>
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section className="block-card p-6 sm:p-10">
                    <div className="text-center mb-8">
                        <p className="text-base font-medium text-brand-600 mb-1">เริ่มต้นใช้งานง่าย ๆ</p>
                        <h2 className="text-2xl sm:text-3xl font-semibold text-ink">ขั้นตอนการใช้งาน 4 ขั้นตอน</h2>
                    </div>
                    <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {STEPS.map((s, i) => (
                            <li key={s.title} className="relative rounded-2xl bg-page p-6 text-center">
                                <span className="mx-auto mb-4 w-16 h-16 rounded-full bg-brand-600 text-white text-3xl font-bold flex items-center justify-center shadow-md">
                                    {i + 1}
                                </span>
                                <i className={`fas ${s.icon} text-2xl text-brand-600 mb-3`}></i>
                                <h3 className="text-xl font-semibold text-ink mb-2">{s.title}</h3>
                                <p className="text-base text-muted">{s.desc}</p>
                                {i < STEPS.length - 1 && (
                                    <i className="fas fa-arrow-right absolute top-1/2 -right-4 -translate-y-1/2 text-2xl text-gray-300 hidden lg:block"></i>
                                )}
                            </li>
                        ))}
                    </ol>
                    <div className="text-center mt-8">
                        <Link to="/register" className="btn btn-primary text-lg px-8 py-4">
                            เริ่มขั้นตอนที่ 1 สมัครสมาชิก <i className="fas fa-arrow-right"></i>
                        </Link>
                    </div>
                </section>

                {/* Features */}
                <section>
                    <h2 className="text-2xl sm:text-3xl font-semibold text-ink text-center mb-6">ระบบนี้ช่วยอะไรได้บ้าง</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {FEATURES.map(f => (
                            <div key={f.title} className="block-card p-6">
                                <span className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${f.color}`}>
                                    <i className={`fas ${f.icon} text-2xl`}></i>
                                </span>
                                <h3 className="text-xl font-semibold text-ink mb-2">{f.title}</h3>
                                <p className="text-base text-muted">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact */}
                <section className="block-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div className="flex items-center gap-4">
                        <span className="w-14 h-14 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-headset text-2xl"></i>
                        </span>
                        <div>
                            <h2 className="text-xl font-semibold text-ink">ต้องการความช่วยเหลือ?</h2>
                            <p className="text-base text-muted">ติดต่อเจ้าหน้าที่ฝ่ายฝึกประสบการณ์วิชาชีพ</p>
                        </div>
                    </div>
                    {settings.CONTACT_EMAIL && (
                        <a href={`mailto:${settings.CONTACT_EMAIL}`} className="btn btn-secondary text-lg">
                            <i className="fas fa-envelope text-brand-600"></i> {settings.CONTACT_EMAIL}
                        </a>
                    )}
                </section>
            </main>

            <footer className="bg-brand-900 text-blue-100 mt-6">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-base">
                    <p>&copy; {year} {settings.SYSTEM_NAME}</p>
                    <p className="text-blue-300">มหาวิทยาลัยราชภัฏพิบูลสงคราม</p>
                </div>
            </footer>
        </div>
    );
}
