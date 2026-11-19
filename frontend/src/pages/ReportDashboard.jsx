import { Block, EmptyState, PageHeader, StatCard } from '../components/ui';

const RESULTS = [
    { key: 'EXCELLENT', label: 'ดีเยี่ยม', color: 'bg-green-600' },
    { key: 'GOOD', label: 'ดี', color: 'bg-blue-600' },
    { key: 'FAIR', label: 'พอใช้', color: 'bg-amber-500' },
    { key: 'IMPROVE', label: 'ต้องปรับปรุง', color: 'bg-red-600' },
];

export default function ReportDashboard({ data }) {
    if (!data || data.error) {
        return <div className="block-card p-6 text-lg text-red-700">ไม่สามารถโหลดข้อมูลรายงานได้ กรุณาลองใหม่อีกครั้ง</div>;
    }

    const { counts, supervision, locationStats } = data;
    const totalResults = supervision.results.reduce((acc, curr) => acc + curr._count.result, 0);
    const maxStudents = Math.max(1, ...locationStats.map(l => l.studentCount));
    const printedAt = new Date().toLocaleDateString('th-TH', { dateStyle: 'long' });

    return (
        <div>
            <div className="print:hidden">
                <PageHeader icon="fa-chart-column" title="รายงานสรุปผล" description={`ข้อมูล ณ วันที่ ${printedAt}`}>
                    <button onClick={() => window.print()} className="btn btn-secondary text-lg">
                        <i className="fas fa-print text-brand-600"></i> พิมพ์รายงาน
                    </button>
                </PageHeader>
            </div>

            {/* Header for print */}
            <div className="hidden print:block mb-8 text-center">
                <h1 className="text-2xl font-bold">รายงานสรุปผลการฝึกประสบการณ์วิชาชีพ</h1>
                <p className="text-base">สาขาวิชาสาธารณสุขศาสตร์ มหาวิทยาลัยราชภัฏพิบูลสงคราม</p>
                <p className="text-sm mt-1">ข้อมูล ณ วันที่ {printedAt}</p>
            </div>

            <div className="space-y-6">
                <Block number={1} title="ภาพรวมระบบ">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="นักศึกษาฝึกงาน" value={counts.students} suffix="คน" icon="fa-user-graduate" color="blue" subtext={`${counts.groups} กลุ่มฝึกงาน`} />
                        <StatCard title="แหล่งฝึกงาน" value={counts.locations} suffix="แห่ง" icon="fa-hospital" color="purple" subtext="ที่เปิดใช้งานอยู่" />
                        <StatCard title="การนิเทศทั้งหมด" value={supervision.total} suffix="ครั้ง" icon="fa-clipboard-check" color="indigo" subtext={`เสร็จสิ้น ${supervision.completed} ครั้ง`} />
                        <StatCard title="นิเทศคงค้าง" value={supervision.pending} suffix="ครั้ง" icon="fa-hourglass-half" color="yellow" subtext="รอดำเนินการ" />
                    </div>
                </Block>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 break-inside-avoid">
                    <Block number={2} title="ผลการประเมินการนิเทศ" description={supervision.completed > 0 ? `จากการนิเทศที่เสร็จสิ้น ${supervision.completed} ครั้ง` : undefined}>
                        {totalResults > 0 ? (
                            <div className="space-y-5">
                                {RESULTS.map(r => {
                                    const count = supervision.results.find(x => x.result === r.key)?._count.result ?? 0;
                                    const percent = Math.round((count / totalResults) * 100);
                                    return (
                                        <div key={r.key}>
                                            <div className="flex justify-between items-end mb-1.5">
                                                <span className="text-lg font-medium text-ink">{r.label}</span>
                                                <span className="text-base text-muted"><b className="text-ink text-lg">{count}</b> ครั้ง ({percent}%)</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                                                <div className={`h-4 rounded-full ${r.color}`} style={{ width: `${percent}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : <EmptyState icon="fa-chart-pie" title="ยังไม่มีผลการประเมิน">ผลจะแสดงเมื่อมีการบันทึกการนิเทศที่เสร็จสิ้น</EmptyState>}
                    </Block>

                    <Block number={3} title="จำนวนนักศึกษาแต่ละแหล่งฝึก" bodyClassName="">
                        {locationStats.length > 0 ? (
                            <ul className="divide-y divide-line max-h-[26rem] overflow-y-auto print:max-h-none">
                                {locationStats.map((loc, i) => (
                                    <li key={loc.id} className="px-5 sm:px-6 py-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="w-8 h-8 rounded-full bg-page text-muted text-sm font-semibold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-base font-medium text-ink truncate">{loc.name}</p>
                                                <p className="text-sm text-muted">จ.{loc.province}</p>
                                            </div>
                                            <span className="text-xl font-semibold text-ink">{loc.studentCount} <span className="text-base font-normal text-muted">คน</span></span>
                                        </div>
                                        <div className="ml-11 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                            <div className="h-2.5 rounded-full bg-brand-600" style={{ width: `${(loc.studentCount / maxStudents) * 100}%` }}></div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : <EmptyState icon="fa-hospital" title="ยังไม่มีข้อมูล" />}
                    </Block>
                </div>
            </div>
        </div>
    );
}
