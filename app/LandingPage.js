import Link from 'next/link';
import Image from 'next/image';

const FEATURES = [
    {
        icon: 'fa-user-plus',
        title: 'สมัครสมาชิกออนไลน์',
        desc: 'นักศึกษาและอาจารย์ที่ปรึกษาสมัครสมาชิกได้ด้วยตนเอง และรอการอนุมัติจากผู้ดูแลระบบ',
    },
    {
        icon: 'fa-users',
        title: 'จัดกลุ่มฝึกประสบการณ์วิชาชีพ',
        desc: 'จัดสรรนักศึกษาเข้ากลุ่มฝึกงานและสถานที่ฝึกประสบการณ์วิชาชีพอย่างเป็นระบบ',
    },
    {
        icon: 'fa-chalkboard-teacher',
        title: 'นิเทศติดตามผล',
        desc: 'อาจารย์ที่ปรึกษานัดหมายและบันทึกผลการนิเทศติดตามนักศึกษาได้ทุกที่ทุกเวลา',
    },
    {
        icon: 'fa-file-alt',
        title: 'รายงานผลการฝึกงาน',
        desc: 'สรุปและติดตามความก้าวหน้าของนักศึกษาแต่ละกลุ่มได้อย่างครบถ้วน',
    },
];

export default function LandingPage({ settings }) {
    const year = new Date().getFullYear() + 543;

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Top bar */}
            <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                        <div className="w-10 h-10 relative flex-shrink-0 mr-3">
                            <Image src="/main-logo.png" alt="มหาวิทยาลัยราชภัฏพิบูลสงคราม" fill className="object-contain" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-blue-900 text-sm sm:text-base leading-tight truncate">{settings.SYSTEM_NAME}</p>
                            <p className="text-xs text-gray-500">มหาวิทยาลัยราชภัฏพิบูลสงคราม</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 rounded-lg transition-colors">
                            เข้าสู่ระบบ
                        </Link>
                        <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                            สมัครสมาชิก
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center relative z-10">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs sm:text-sm font-medium text-blue-100 mb-6">
                        สาขาวิชาสาธารณสุขศาสตร์ · คณะวิทยาศาสตร์และเทคโนโลยี
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-4">
                        {settings.SYSTEM_NAME}
                    </h1>
                    <p className="max-w-2xl mx-auto text-blue-100 text-base sm:text-lg mb-10">
                        ระบบกลางสำหรับบริหารจัดการการฝึกประสบการณ์วิชาชีพ ตั้งแต่การสมัครสมาชิก จัดกลุ่มฝึกงาน
                        การนิเทศติดตาม จนถึงการรายงานผล อย่างครบถ้วนและเป็นทางการ
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/register"
                            className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 rounded-lg bg-white text-blue-800 font-semibold hover:bg-blue-50 transition-colors shadow-lg"
                        >
                            <i className="fas fa-user-plus mr-2"></i> สมัครสมาชิก
                        </Link>
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 rounded-lg border border-white/40 text-white font-semibold hover:bg-white/10 transition-colors"
                        >
                            <i className="fas fa-sign-in-alt mr-2"></i> เข้าสู่ระบบ
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
                <div className="text-center mb-12">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">ระบบให้บริการอะไรบ้าง</h2>
                    <p className="text-gray-500 mt-2">ครอบคลุมทุกขั้นตอนของการฝึกประสบการณ์วิชาชีพ</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {FEATURES.map(f => (
                        <div key={f.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                                <i className={`fas ${f.icon} text-lg`}></i>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                            <p className="text-sm text-gray-500">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-blue-950 text-blue-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                    <p>&copy; {year} {settings.SYSTEM_NAME} มหาวิทยาลัยราชภัฏพิบูลสงคราม</p>
                    <p className="text-blue-300">สงวนลิขสิทธิ์</p>
                </div>
            </footer>
        </div>
    );
}
