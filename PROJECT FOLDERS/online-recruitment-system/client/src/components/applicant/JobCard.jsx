import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Building2,
  DollarSign,
  Clock,
  Briefcase,
  Users,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const JobCard = ({ job, showApply = true }) => {
  const isDeadlinePassed = new Date(job.deadline) < new Date();
  const daysLeft = Math.ceil(
    (new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Competitive';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()} / yr`;
    if (min) return `From $${min.toLocaleString()} / yr`;
    return `Up to $${max.toLocaleString()} / yr`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col justify-between">
      <div>
        {/* Top bar: Company & Badges */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
              {job.company ? job.company.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-600 tracking-wide uppercase">
                {job.company}
              </p>
              <Link to={`/jobs/${job._id}`}>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {job.title}
                </h3>
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
              {job.employmentType}
            </span>
            {job.hasApplied && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Applied
              </span>
            )}
          </div>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {job.description}
        </p>

        {/* Key details pills */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4">
          <div className="flex items-center space-x-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center space-x-1.5 truncate">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="font-semibold text-slate-700 truncate">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 truncate">
            <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{job.experienceRequired} exp</span>
          </div>
          <div className="flex items-center space-x-1.5 truncate">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className={daysLeft <= 3 ? 'text-rose-600 font-semibold truncate' : 'truncate'}>
              {isDeadlinePassed
                ? 'Expired'
                : daysLeft === 0
                ? 'Due today'
                : `${daysLeft} days left`}
            </span>
          </div>
        </div>

        {/* Skills preview tags */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {job.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-medium">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <Link
          to={`/jobs/${job._id}`}
          className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center transition-colors"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {showApply && (
          <div>
            {job.hasApplied ? (
              <Link
                to="/my-applications"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
              >
                Track Status
              </Link>
            ) : isDeadlinePassed || job.status === 'Closed' ? (
              <span className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 bg-slate-100 cursor-not-allowed">
                Closed
              </span>
            ) : (
              <Link
                to={`/jobs/${job._id}/apply`}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow transition-all"
              >
                Apply Now
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
