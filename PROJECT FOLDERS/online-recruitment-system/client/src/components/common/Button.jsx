import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg';

  const variants = {
    primary:
      'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow focus:ring-indigo-500 border border-transparent',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm focus:ring-indigo-500',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow focus:ring-rose-500 border border-transparent',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow focus:ring-emerald-500 border border-transparent',
    outline:
      'bg-transparent hover:bg-indigo-50 text-indigo-600 border border-indigo-300 focus:ring-indigo-500',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs space-x-1.5',
    md: 'px-4 py-2 text-sm space-x-2',
    lg: 'px-5 py-2.5 text-base space-x-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default Button;
