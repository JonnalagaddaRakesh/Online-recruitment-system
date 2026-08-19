import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'indigo',
  subtitle,
}) => {
  const colorSchemes = {
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'hover:border-indigo-200',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'hover:border-emerald-200',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'hover:border-blue-200',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'hover:border-purple-200',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'hover:border-amber-200',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'hover:border-rose-200',
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.indigo;

  return (
    <div
      className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm ${scheme.border} transition-all`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div
          className={`w-10 h-10 rounded-xl ${scheme.bg} ${scheme.text} flex items-center justify-center`}
        >
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value !== undefined ? value : '0'}
        </span>
        {subtitle && (
          <span className="text-xs text-slate-500 font-medium">{subtitle}</span>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
