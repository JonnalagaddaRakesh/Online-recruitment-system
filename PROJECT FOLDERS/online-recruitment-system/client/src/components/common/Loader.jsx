import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
  };

  return (
    <Loader2
      className={`animate-spin text-indigo-600 ${sizeClasses[size] || sizeClasses.md} ${className}`}
    />
  );
};

export const Loader = ({ fullScreen = false, text = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center space-y-3">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-slate-700">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 flex flex-col items-center justify-center space-y-3">
      <Spinner size="lg" />
      <p className="text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
};

export const Skeleton = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
  );
};

export default Loader;
