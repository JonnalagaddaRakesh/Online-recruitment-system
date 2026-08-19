import React from 'react';
import { FolderSearch, Plus } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = FolderSearch,
  title = 'No records found',
  description = 'There are no items matching your criteria at this moment.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm flex flex-col items-center">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} icon={Plus}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
