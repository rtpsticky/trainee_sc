'use client';

import { useMemo } from 'react';

export default function ReportDashboard({ data }) {
    if (!data || data.error) {
        return <div className="p-4 text-red-500">Error loading report data.</div>;
    }

    const { counts, supervision, locationStats } = data;

    // Prepare chart-like data for Supervision Results
    const resultOrder = ['EXCELLENT', 'GOOD', 'FAIR', 'IMPROVE'];
    const resultLabels = {
        'EXCELLENT': 'ดีเยี่ยม',
        'GOOD': 'ดี',
        'FAIR': 'พอใช้',
        'IMPROVE': 'ปรับปรุง'
    };
    const resultColors = {
        'EXCELLENT': 'bg-green-500',
        'GOOD': 'bg-blue-500',
        'FAIR': 'bg-yellow-500',
        'IMPROVE': 'bg-red-500'
    };

    // Calculate percentages for results
    const totalResults = supervision.results.reduce((acc, curr) => acc + curr._count.result, 0);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-6">
            <div className="flex justify-end mb-6 print:hidden">
                <button
                    onClick={handlePrint}
                    className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors shadow-sm"
                >
                    <i className="fas fa-print"></i>
                    <span>พิมพ์รายงาน</span>
                </button>
            </div>

            {/* Header for Print */}
            <div className="hidden print:block mb-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900">รายงานสรุปผลการดำเนินงาน</h1>
                <p className="text-gray-500">ระบบติดตามการฝึกงาน หลักสูตรสาธารณสุขศาสตร์</p>
                <p className="text-sm text-gray-400 mt-1">ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH', { dateStyle: 'long' })}</p>
            </div>

            {/* Overview Stats */}
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <i className="fas fa-chart-line mr-2 text-blue-600"></i> ภาพรวมระบบ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="นักศึกษาฝึกงาน"
                    value={counts.students}
                    suffix="คน"
                    icon="fa-user-graduate"
                    color="blue"
                    subtext={`${counts.groups} กลุ่มฝึกงาน`}
                />
                <StatCard
                    title="สถานที่ฝึกงาน"
                    value={counts.locations}
                    suffix="แห่ง"
                    icon="fa-hospital"
                    color="purple"
                    subtext="ที่เปิดใช้งานอยู่"
                />
                <StatCard
                    title="การนิเทศทั้งหมด"
                    value={supervision.total}
                    suffix="ครั้ง"
                    icon="fa-clipboard-check"
                    color="indigo"
                    subtext={`${supervision.completed} เสร็จสิ้น`}
                />
                <StatCard
                    title="นิเทศคงค้าง"
                    value={supervision.pending}
                    suffix="รายการ"
                    icon="fa-clock"
                    color="yellow"
                    subtext="รอดำเนินการ"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 break-inside-avoid">
                {/* Supervision Results Analysis */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <i className="fas fa-poll mr-2 text-green-600"></i> ผลการประเมินการนิเทศ
                    </h3>

                    {supervision.completed > 0 ? (
                        <div className="space-y-4">
                            {resultOrder.map(key => {
                                const found = supervision.results.find(r => r.result === key);
                                const count = found ? found._count.result : 0;
                                const percentage = totalResults > 0 ? Math.round((count / totalResults) * 100) : 0;

                                return (
                                    <div key={key}>
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-sm font-medium text-gray-700">{resultLabels[key]}</span>
                                            <span className="text-sm text-gray-500 font-medium">{count} ครั้ง ({percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className={`h-2.5 rounded-full ${resultColors[key]} transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="pt-4 mt-4 border-t border-gray-100 text-center">
                                <p className="text-sm text-gray-500">จากการนิเทศที่เสร็จสิ้นทั้งหมด {supervision.completed} ครั้ง</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <i className="fas fa-chart-pie text-4xl mb-2"></i>
                            <p>ยังไม่มีข้อมูลผลการประเมิน</p>
                        </div>
                    )}
                </div>

                {/* Location Breakdown Table Preview (Top 5+ or scrollable) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <i className="fas fa-map-marker-alt mr-2 text-red-600"></i> จำนวนนักศึกษาแต่ละแห่ง
                    </h3>
                    <div className="overflow-auto flex-1 max-h-[300px] print:max-h-none">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 font-medium text-gray-700">สถานที่ฝึกงาน</th>
                                    <th className="px-4 py-2 font-medium text-gray-700 text-right">จำนวน (คน)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {locationStats.map((loc) => (
                                    <tr key={loc.id}>
                                        <td className="px-4 py-3 text-gray-800">
                                            <div className="font-medium">{loc.name}</div>
                                            <div className="text-xs text-gray-500">{loc.province}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                                            {loc.studentCount}
                                        </td>
                                    </tr>
                                ))}
                                {locationStats.length === 0 && (
                                    <tr><td colSpan="2" className="px-4 py-8 text-center text-gray-400">ยังไม่มีข้อมูล</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, suffix, icon, color, subtext }) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        yellow: 'bg-yellow-50 text-yellow-600',
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
                    <i className={`fas ${icon} text-xl`}></i>
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <div className="flex items-baseline space-x-2">
                    <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
                    <span className="text-sm text-gray-500 font-medium">{suffix}</span>
                </div>
                {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
            </div>
        </div>
    );
}
