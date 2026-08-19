import React from 'react';
import { CheckCircle, Clock, Eye, Award, Users, CheckCircle2, XCircle } from 'lucide-react';

const stages = [
  { key: 'Applied', label: 'Applied', icon: Clock },
  { key: 'Under Review', label: 'Under Review', icon: Eye },
  { key: 'Shortlisted', label: 'Shortlisted', icon: Award },
  { key: 'Interview', label: 'Interview', icon: Users },
  { key: 'Selected', label: 'Selected', icon: CheckCircle2 },
];

const StatusTimeline = ({ currentStatus }) => {
  const isRejected = currentStatus === 'Rejected';

  const getStageIndex = (status) => {
    switch (status) {
      case 'Applied':
        return 0;
      case 'Under Review':
        return 1;
      case 'Shortlisted':
        return 2;
      case 'Interview':
        return 3;
      case 'Selected':
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = isRejected ? -1 : getStageIndex(currentStatus);

  return (
    <div className="w-full py-4">
      {isRejected ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center space-x-3 text-rose-800">
          <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
          <div>
            <h4 className="text-sm font-bold">Application Status: Rejected</h4>
            <p className="text-xs text-rose-600">
              Thank you for your interest. Unfortunately, the hiring team has decided to proceed with other candidates at this time.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Progress bar line */}
          <div className="hidden sm:block absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-slate-200 z-0">
            <div
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{
                width: `${(currentIndex / (stages.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Stepper items */}
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              const isPassed = idx < currentIndex;
              const isCurrent = idx === currentIndex;

              let iconContainerClass = 'bg-slate-100 text-slate-400 border-slate-200';
              let textClass = 'text-slate-400';

              if (isPassed) {
                iconContainerClass = 'bg-indigo-600 text-white border-indigo-600';
                textClass = 'text-indigo-600 font-semibold';
              } else if (isCurrent) {
                iconContainerClass = 'bg-white text-indigo-600 border-indigo-600 ring-4 ring-indigo-50';
                textClass = 'text-indigo-900 font-bold';
              }

              return (
                <div
                  key={stage.key}
                  className="flex sm:flex-col items-center space-x-3 sm:space-x-0 text-center sm:w-28"
                >
                  <div
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${iconContainerClass}`}
                  >
                    {isPassed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`text-xs mt-1 sm:mt-2 text-left sm:text-center ${textClass}`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusTimeline;
