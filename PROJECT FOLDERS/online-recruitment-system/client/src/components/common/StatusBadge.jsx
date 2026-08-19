import React from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  Award,
  Users,
  XCircle,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

const StatusBadge = ({ status, type = 'application', size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium space-x-1',
    md: 'px-2.5 py-1 text-xs font-semibold space-x-1.5',
    lg: 'px-3 py-1.5 text-sm font-semibold space-x-2',
  };

  if (type === 'job') {
    const jobConfig = {
      Active: {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
      },
      Closed: {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
      },
      Draft: {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
      },
    };

    const config = jobConfig[status] || jobConfig.Active;

    return (
      <span
        className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses[size]}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        <span>{status}</span>
      </span>
    );
  }

  // Application status config
  const appConfig = {
    Applied: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock,
    },
    'Under Review': {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Eye,
    },
    Shortlisted: {
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Award,
    },
    Interview: {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: Users,
    },
    Selected: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
    },
    Rejected: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
    },
  };

  const config = appConfig[status] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: FileCheck,
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses[size]}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{status}</span>
    </span>
  );
};

export default StatusBadge;
