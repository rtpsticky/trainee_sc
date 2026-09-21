'use client';

import { useEffect } from 'react';

const SIZES = {
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
};

// Shared dialog: dimmed backdrop, Esc / backdrop click to close, scrolls on small screens.
export default function Modal({ title, icon = 'fa-edit', iconClass = 'bg-blue-100 text-blue-600', size = 'lg', onClose, children }) {
    useEffect(() => {
        const onKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-label={title}>
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative flex min-h-full items-start justify-center p-4 sm:pt-16">
                <div className={`relative bg-white rounded-xl shadow-2xl w-full ${SIZES[size]} overflow-hidden`}>
                    <div className="flex items-center justify-between px-6 pt-6 pb-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                            <span className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${iconClass}`}>
                                <i className={`fas ${icon}`}></i>
                            </span>
                            {title}
                        </h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="ปิด">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
