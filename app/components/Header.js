'use client';

export default function Header({ title, user, icon }) {
    return (
        <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10 sticky top-0">
            <div className="flex items-center md:hidden">
                <button className="text-gray-500 hover:text-gray-700 focus:outline-none mr-4">
                    <i className="fas fa-bars"></i>
                </button>
                <h2 className="text-lg font-semibold text-gray-800">
                    {title}
                </h2>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 hidden md:block">
                <i className={`fas ${icon} mr-2 text-blue-600`}></i> {title}
            </h2>

            <div className="flex items-center space-x-4">
                <div className="relative hidden sm:block">
                    <i className="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
                    <input type="text" placeholder="ค้นหา..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm" />
                </div>

                <div className="flex items-center">
                    <div className="mr-3 text-right hidden sm:block">
                        <p className="text-sm font-medium">
                            {user?.role === 'STUDENT' ? 'นักศึกษา' : user?.role === 'TEACHER' ? 'อาจารย์' : 'เจ้าหน้าที่'} {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">ฝ่ายฝึกประสบการณ์วิชาชีพ</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className={`fas ${user?.role === 'STUDENT' ? 'fa-user-graduate' : 'fa-user-tie'} text-blue-600`}></i>
                    </div>
                </div>
            </div>
        </header>
    );
}
