'use client';

import { useState, useTransition } from 'react';
import Modal from './Modal';

export const inputClass = 'w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm py-2.5 px-3 bg-white';
export const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5';
export const primaryButton = 'inline-flex items-center justify-center rounded-lg px-5 py-2.5 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors';
export const secondaryButton = 'inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-2.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors';
export const dangerButton = 'inline-flex items-center justify-center rounded-lg px-5 py-2.5 bg-red-600 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 transition-colors';

// Runs a server action while tracking pending state and the error it returns.
// Unlike <form action={fn}>, this keeps what the user typed when the action fails.
export function useServerAction() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState('');

    const run = (action, onSuccess) => {
        setError('');
        startTransition(async () => {
            try {
                const result = await action();
                if (result?.error) setError(result.error);
                else onSuccess?.(result);
            } catch (e) {
                console.error(e);
                setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
            }
        });
    };

    return { run, isPending, error, setError };
}

export function ErrorAlert({ children }) {
    if (!children) return null;
    return (
        <div className="mb-4 px-4 py-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r" role="alert">
            <i className="fas fa-exclamation-circle mr-2"></i>{children}
        </div>
    );
}

export function FormActions({ isPending, submitLabel, onCancel }) {
    return (
        <div className="px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-gray-100 bg-gray-50">
            <button type="button" onClick={onCancel} className={secondaryButton}>ยกเลิก</button>
            <button type="submit" disabled={isPending} className={primaryButton}>
                {isPending ? 'กำลังบันทึก...' : submitLabel}
            </button>
        </div>
    );
}

export function ConfirmDelete({ title, children, action, onDone, onClose }) {
    const { run, isPending, error } = useServerAction();

    return (
        <Modal title={title} icon="fa-exclamation-triangle" iconClass="bg-red-100 text-red-600" size="md" onClose={onClose}>
            <div className="px-6 pb-4">
                <ErrorAlert>{error}</ErrorAlert>
                <div className="text-sm text-gray-600">{children}</div>
            </div>
            <div className="px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-gray-100 bg-gray-50">
                <button type="button" onClick={onClose} className={secondaryButton}>ยกเลิก</button>
                <button type="button" disabled={isPending} onClick={() => run(action, onDone)} className={dangerButton}>
                    {isPending ? 'กำลังลบ...' : 'ยืนยันการลบ'}
                </button>
            </div>
        </Modal>
    );
}

export function StatCard({ title, value, icon, color = 'blue' }) {
    const colors = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        red: 'bg-red-100 text-red-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        purple: 'bg-purple-100 text-purple-600',
    };
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colors[color]}`}>
                    <i className={`fas ${icon} text-xl`}></i>
                </div>
            </div>
        </div>
    );
}

export function SearchBox({ value, onChange, placeholder }) {
    return (
        <div className="relative w-full md:w-64">
            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm w-full"
            />
        </div>
    );
}
