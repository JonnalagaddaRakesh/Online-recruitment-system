import React from 'react';

export const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`block w-full rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-100 disabled:cursor-not-allowed ${
            Icon ? 'pl-9 pr-3' : 'px-3.5'
          } py-2.5 ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 text-rose-900 placeholder-rose-300'
              : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100 text-slate-900 placeholder-slate-400 bg-white'
          }`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
};

export const TextArea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        name={name}
        id={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`block w-full rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 px-3.5 py-2.5 disabled:bg-slate-100 disabled:cursor-not-allowed ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 text-rose-900 placeholder-rose-300'
            : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100 text-slate-900 placeholder-slate-400 bg-white'
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
};

export const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`block w-full rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 px-3.5 py-2.5 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 text-rose-900'
            : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100 text-slate-900'
        }`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
};

export default Input;
