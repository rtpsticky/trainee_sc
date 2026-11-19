import { useEffect } from 'react';

const SIZES = {
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
};

// Shared dialog: dimmed backdrop, Esc / backdrop click to close, scrolls on small screens.
export default function Modal({ title, subtitle, icon = 'fa-edit', iconClass = 'bg-brand-50 text-brand-600', size = 'lg', onClose, children }) {
    useEffect(() => {
        const onKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKeyDown);
        const { overflow } = document.body.style;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = overflow;
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-label={title}>
            <div className="fixed inset-0 bg-gray-900/50" onClick={onClose}></div>
            <div className="relative flex min-h-full items-start justify-center p-3 sm:p-6 sm:pt-12">
                <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${SIZES[size]} overflow-hidden`}>
                    <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-5 border-b border-line">
                        <div className="flex items-center gap-4 min-w-0">
                            <span className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconClass}`}>
                                <i className={`fas ${icon} text-xl`}></i>
                            </span>
                            <div className="min-w-0">
                                <h3 className="text-xl sm:text-2xl font-semibold text-ink leading-tight">{title}</h3>
                                {subtitle && <p className="text-base text-muted">{subtitle}</p>}
                            </div>
                        </div>
                        <button type="button" onClick={onClose} className="w-11 h-11 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-ink flex-shrink-0" aria-label="ปิด">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
