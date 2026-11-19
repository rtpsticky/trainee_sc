import { useId, useState, useTransition } from 'react';
import { Link } from 'react-router';
import ReactSelect from 'react-select';
import Swal from 'sweetalert2';

// Button / input class names, so every page shares one look.
export const inputClass = 'field-input';
export const labelClass = 'field-label';
export const primaryButton = 'btn btn-primary';
export const secondaryButton = 'btn btn-secondary';
export const dangerButton = 'btn btn-danger';
export const successButton = 'btn btn-success';

// ---------------------------------------------------------------- dialogs

const BRAND = '#1d4ed8';
const DANGER = '#dc2626';

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

class SafeHtml {
    constructor(value) { this.value = value; }
    toString() { return this.value; }
}

// Builds dialog HTML from a template; ${} values are escaped so names from the DB can't
// inject markup. Nested html`` results are already safe and are kept as-is.
export function html(strings, ...values) {
    const piece = (v) => (v instanceof SafeHtml ? v.value : escapeHtml(v));
    return new SafeHtml(strings.reduce((out, s, i) => out + s + (i < values.length ? piece(values[i]) : ''), ''));
}

const toHtml = (body) => (body == null ? undefined : String(body));

const toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2600,
    timerProgressBar: true,
});

export function notifySuccess(title = 'บันทึกเรียบร้อยแล้ว') {
    return toast.fire({ icon: 'success', title });
}

export function showInfo({ title, html: body, icon = 'info' }) {
    return Swal.fire({ title, html: toHtml(body), icon, confirmButtonText: 'ปิด', confirmButtonColor: BRAND });
}

// Asks first, then runs `action` inside the dialog. An { error } result keeps the
// dialog open and shows the message; success closes it and shows a toast.
export async function confirmAndRun({
    title, html: body, action, confirmText = 'ยืนยัน', successText = 'ดำเนินการเรียบร้อยแล้ว',
    icon = 'warning', danger = true,
}) {
    const result = await Swal.fire({
        title,
        html: toHtml(body),
        icon,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: danger ? DANGER : BRAND,
        cancelButtonColor: '#6b7280',
        reverseButtons: true,
        focusCancel: danger,
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading(),
        preConfirm: async () => {
            try {
                const res = await action();
                if (res?.error) {
                    Swal.showValidationMessage(res.error);
                    return false;
                }
                return res ?? true;
            } catch {
                Swal.showValidationMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
                return false;
            }
        },
    });
    if (result.isConfirmed) notifySuccess(successText);
    return result.isConfirmed;
}

export function confirmDialog({ title, html: body, confirmText = 'ยืนยัน', danger = false, icon = 'question' }) {
    return Swal.fire({
        title, html: toHtml(body), icon,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: danger ? DANGER : BRAND,
        cancelButtonColor: '#6b7280',
        reverseButtons: true,
    }).then(r => r.isConfirmed);
}

// Runs an API call while tracking pending state and the error it returns.
// Shows a success toast unless `successText` is false.
export function useServerAction() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState('');

    const run = (action, onSuccess, successText = 'บันทึกเรียบร้อยแล้ว') => {
        setError('');
        startTransition(async () => {
            try {
                const result = await action();
                if (result?.error) setError(result.error);
                else {
                    if (successText) notifySuccess(successText);
                    onSuccess?.(result);
                }
            } catch (e) {
                console.error(e);
                setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
            }
        });
    };

    return { run, isPending, error, setError };
}

// ---------------------------------------------------------------- layout blocks

export function PageHeader({ icon, title, description, children }) {
    return (
        <div className="block-card p-5 sm:p-6 mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
                {icon && (
                    <span className="hidden sm:flex w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 items-center justify-center flex-shrink-0">
                        <i className={`fas ${icon} text-2xl`}></i>
                    </span>
                )}
                <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-ink leading-tight">{title}</h1>
                    {description && <p className="text-base text-muted mt-1">{description}</p>}
                </div>
            </div>
            {children && <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">{children}</div>}
        </div>
    );
}

// A white block with an optional numbered badge, used to split pages and forms into clear steps.
export function Block({ number, title, description, icon, actions, children, className = '', bodyClassName = 'p-5 sm:p-6' }) {
    return (
        <section className={`block-card overflow-hidden ${className}`}>
            {title && (
                <div className="px-5 sm:px-6 py-4 border-b border-line flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        {number != null ? <StepNumber>{number}</StepNumber> : icon && (
                            <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                                <i className={`fas ${icon}`}></i>
                            </span>
                        )}
                        <div className="min-w-0">
                            <h2 className="text-xl font-semibold text-ink leading-snug">{title}</h2>
                            {description && <p className="text-[0.95rem] text-muted">{description}</p>}
                        </div>
                    </div>
                    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
                </div>
            )}
            <div className={bodyClassName}>{children}</div>
        </section>
    );
}

export function StepNumber({ children, state = 'active', size = 'md' }) {
    const styles = {
        active: 'bg-brand-600 text-white',
        done: 'bg-green-600 text-white',
        todo: 'bg-white text-gray-500 border-2 border-gray-300',
    };
    const sizes = { md: 'w-10 h-10 text-lg', lg: 'w-12 h-12 text-xl' };
    return (
        <span className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${styles[state]}`}>
            {state === 'done' ? <i className="fas fa-check"></i> : children}
        </span>
    );
}

// Numbered process flow. Each step: { title, description?, href?, icon?, count?, state? }
export function StepFlow({ steps, columns = steps.length }) {
    // Five steps get cramped beside the sidebar, so they only go side by side on very wide screens.
    const cols = { 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'md:grid-cols-3 2xl:grid-cols-5' }[columns] ?? 'lg:grid-cols-4';
    return (
        <ol className={`grid grid-cols-1 sm:grid-cols-2 ${cols} gap-4`}>
            {steps.map((step, index) => {
                const state = step.state ?? 'active';
                const body = (
                    <>
                        <div className="flex items-center justify-between mb-3">
                            <StepNumber state={state}>{index + 1}</StepNumber>
                            {step.count != null && (
                                <span className="text-3xl font-semibold text-ink">{step.count}</span>
                            )}
                            {step.count == null && step.icon && <i className={`fas ${step.icon} text-2xl text-brand-600/70`}></i>}
                        </div>
                        <p className="text-lg font-semibold text-ink leading-snug">{step.title}</p>
                        {step.description && <p className="text-[0.95rem] text-muted mt-1">{step.description}</p>}
                        {step.href && (
                            <span className="mt-3 inline-flex items-center text-[0.95rem] font-medium text-brand-700">
                                {step.cta ?? 'ไปที่หน้านี้'} <i className="fas fa-arrow-right ml-2 text-sm"></i>
                            </span>
                        )}
                    </>
                );
                const base = `relative h-full rounded-2xl border p-5 transition ${state === 'todo' ? 'bg-gray-50 border-line' : state === 'done' ? 'bg-green-50/60 border-green-200' : 'bg-white border-line'}`;
                return (
                    <li key={step.title} className="relative">
                        {step.href
                            ? <Link to={step.href} className={`${base} block hover:border-brand-600 hover:shadow-md`}>{body}</Link>
                            : <div className={base}>{body}</div>}
                    </li>
                );
            })}
        </ol>
    );
}

// Short numbered "how to use this page" strip.
export function HowTo({ steps }) {
    return (
        <div className="block-card px-5 py-4 mb-6">
            <p className="text-[0.95rem] font-semibold text-muted mb-3"><i className="fas fa-lightbulb text-yellow-500 mr-2"></i>วิธีใช้งานหน้านี้</p>
            <ol className="flex flex-col md:flex-row gap-3 md:gap-0">
                {steps.map((s, i) => (
                    <li key={s} className="flex items-center md:flex-1 gap-3">
                        <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 font-semibold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                        <span className="text-base text-ink">{s}</span>
                        {i < steps.length - 1 && <i className="fas fa-chevron-right text-gray-300 mx-3 hidden md:inline"></i>}
                    </li>
                ))}
            </ol>
        </div>
    );
}

// ---------------------------------------------------------------- form parts

export function ErrorAlert({ children }) {
    if (!children) return null;
    return (
        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-800 text-base rounded-xl flex items-start gap-3" role="alert">
            <i className="fas fa-exclamation-circle mt-1"></i><span>{children}</span>
        </div>
    );
}

export function Field({ label, required, hint, children, className = '' }) {
    return (
        <div className={className}>
            {label && (
                <label className={labelClass}>
                    {label} {required && <span className="text-red-600">*</span>}
                </label>
            )}
            {children}
            {hint && <p className="text-sm text-muted mt-1.5">{hint}</p>}
        </div>
    );
}

// Numbered section inside a form (1, 2, 3 ...).
export function FormSection({ number, title, children }) {
    return (
        <fieldset className="rounded-2xl border border-line bg-gray-50/60 p-4 sm:p-5">
            <legend className="sr-only">{title}</legend>
            <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-brand-600 text-white text-base font-semibold flex items-center justify-center">{number}</span>
                <h3 className="text-lg font-semibold text-ink">{title}</h3>
            </div>
            <div className="space-y-4">{children}</div>
        </fieldset>
    );
}

export function FormActions({ isPending, submitLabel, onCancel }) {
    return (
        <div className="px-5 sm:px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-line bg-gray-50">
            <button type="button" onClick={onCancel} className={secondaryButton}>ยกเลิก</button>
            <button type="submit" disabled={isPending} className={primaryButton}>
                {isPending ? <><i className="fas fa-spinner fa-spin"></i> กำลังบันทึก...</> : <><i className="fas fa-save"></i> {submitLabel}</>}
            </button>
        </div>
    );
}

const selectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: 52,
        borderRadius: 12,
        borderColor: state.isFocused ? BRAND : '#d1d5db',
        boxShadow: state.isFocused ? '0 0 0 4px #dbe7ff' : 'none',
        backgroundColor: state.isDisabled ? '#f3f4f6' : '#fff',
        fontSize: '1rem',
        '&:hover': { borderColor: state.isFocused ? BRAND : '#9ca3af' },
    }),
    valueContainer: (base) => ({ ...base, padding: '2px 12px' }),
    placeholder: (base) => ({ ...base, color: '#9ca3af' }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({ ...base, borderRadius: 12, overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,0,0,0.15)' }),
    option: (base, state) => ({
        ...base,
        padding: '12px 14px',
        fontSize: '1rem',
        backgroundColor: state.isSelected ? BRAND : state.isFocused ? '#eef4ff' : '#fff',
        color: state.isSelected ? '#fff' : state.isDisabled ? '#9ca3af' : '#1f2937',
    }),
    multiValue: (base) => ({ ...base, backgroundColor: '#eef4ff', borderRadius: 8 }),
    multiValueLabel: (base) => ({ ...base, color: '#1e40af', fontSize: '0.95rem', padding: '4px 8px' }),
    multiValueRemove: (base) => ({ ...base, borderRadius: 8, color: '#1e40af', ':hover': { backgroundColor: '#dbe7ff' } }),
};

// react-select with plain values: options are [{ value, label }], `value`/`defaultValue`
// are raw values (an array when isMulti). With `name`, it posts like a normal <select>.
export function Select({ options, value, defaultValue, onChange, isMulti = false, placeholder = 'เลือก...', ...props }) {
    const id = useId();
    const toOption = (v) => {
        if (isMulti) return (v ?? []).map(x => options.find(o => String(o.value) === String(x))).filter(Boolean);
        return options.find(o => String(o.value) === String(v ?? '')) ?? null;
    };

    return (
        <ReactSelect
            instanceId={id}
            options={options}
            isMulti={isMulti}
            placeholder={placeholder}
            styles={selectStyles}
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            menuPosition="fixed"
            noOptionsMessage={() => 'ไม่พบรายการ'}
            {...(value !== undefined ? { value: toOption(value) } : { defaultValue: toOption(defaultValue) })}
            onChange={(selected) => onChange?.(isMulti ? (selected ?? []).map(o => o.value) : selected?.value ?? '')}
            {...props}
        />
    );
}

// ---------------------------------------------------------------- data display

const STAT_COLORS = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    yellow: 'bg-amber-50 text-amber-700',
    purple: 'bg-purple-50 text-purple-700',
    indigo: 'bg-indigo-50 text-indigo-700',
};

export function StatCard({ title, value, icon, color = 'blue', suffix, href, subtext }) {
    const body = (
        <div className="flex items-center gap-4">
            <span className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${STAT_COLORS[color]}`}>
                <i className={`fas ${icon} text-2xl`}></i>
            </span>
            <div className="min-w-0">
                <p className="text-base text-muted">{title}</p>
                <p className="text-3xl font-semibold text-ink leading-tight">
                    {value}{suffix && <span className="text-base font-normal text-muted ml-1.5">{suffix}</span>}
                </p>
                {subtext && <p className="text-sm text-muted">{subtext}</p>}
            </div>
        </div>
    );
    return href
        ? <Link to={href} className="block-card p-5 block hover:border-brand-600 hover:shadow-md transition">{body}</Link>
        : <div className="block-card p-5">{body}</div>;
}

const BADGE_TONES = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-amber-100 text-amber-900',
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-700',
    teal: 'bg-teal-100 text-teal-800',
};

export function Badge({ tone = 'gray', icon, children }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.9rem] font-medium whitespace-nowrap ${BADGE_TONES[tone]}`}>
            {icon && <i className={`fas ${icon} text-xs`}></i>}{children}
        </span>
    );
}

export function SearchBox({ value, onChange, placeholder }) {
    return (
        <div className="relative w-full md:w-80">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="field-input pl-11"
            />
        </div>
    );
}

export function EmptyState({ icon = 'fa-inbox', title, children }) {
    return (
        <div className="py-12 px-6 text-center">
            <span className="mx-auto mb-4 w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                <i className={`fas ${icon} text-2xl`}></i>
            </span>
            <p className="text-lg font-medium text-ink">{title}</p>
            {children && <div className="text-base text-muted mt-1">{children}</div>}
        </div>
    );
}

// Segmented filter buttons, larger and easier to hit than a dropdown.
export function FilterTabs({ value, onChange, options }) {
    return (
        <div className="flex flex-wrap gap-2" role="tablist">
            {options.map(opt => {
                const active = value === opt.value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(opt.value)}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-base font-medium border transition-colors ${active ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-gray-300 text-ink hover:bg-gray-50'}`}
                    >
                        {opt.icon && <i className={`fas ${opt.icon}`}></i>}
                        {opt.label}
                        {opt.count != null && (
                            <span className={`min-w-6 px-1.5 rounded-full text-sm ${active ? 'bg-white/25 text-white' : 'bg-gray-100 text-muted'}`}>{opt.count}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
