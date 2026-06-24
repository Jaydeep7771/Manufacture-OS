import { clsx } from 'clsx'

export default function Input({ label, error, prefix, suffix, className, ...props }) {
  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-slate-500 text-sm pointer-events-none">{prefix}</span>
        )}
        <input
          className={clsx(
            'w-full rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'py-2',
            prefix ? 'pl-7 pr-3' : 'px-3',
            suffix ? 'pr-10' : '',
            error && 'border-red-400 focus:ring-red-400'
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-slate-500 text-sm pointer-events-none">{suffix}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className, ...props }) {
  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <select
        className={clsx(
          'w-full rounded-lg border border-slate-200 bg-white text-sm text-slate-800 px-3 py-2 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          error && 'border-red-400'
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
