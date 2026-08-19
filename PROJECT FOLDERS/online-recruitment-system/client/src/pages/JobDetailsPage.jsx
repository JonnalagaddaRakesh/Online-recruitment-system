import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Briefcase,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Share2,
  FileCheck,
} from 'lucide-react';
import { jobService } from '../services/jobService';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import toast from 'react-hot-toast';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isApplicant } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await jobService.getJobById(id);
        if (res.success) {
          setJob(res.data);
        }
      } catch (err) {
        toast.error('Could not load job details');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

  if (loading) {
    return <Loader fullScreen text="Loading job information..." />;
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Job Not Found</h2>
        <p className="text-xs text-slate-500">The requested job posting may have been removed.</p>
        <Link to="/jobs">
          <Button variant="primary" size="sm">
            Back to All Jobs
          </Button>
        </Link>
      </div>
    );
  }

  const isExpired = new Date(job.deadline) < new Date();
  const isClosed = job.status === 'Closed' || isExpired;
  const deadlineFormatted = new Date(job.deadline).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Competitive / Undisclosed';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()} USD / Year`;
    if (min) return `From $${min.toLocaleString()} USD / Year`;
    return `Up to $${max.toLocaleString()} USD / Year`;
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Job link copied to clipboard!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <Link
        to="/jobs"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        <span>Back to Job Listings</span>
      </Link>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold text-2xl shrink-0">
            {job.company ? job.company.charAt(0).toUpperCase() : 'C'}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                {job.company}
              </span>
              <StatusBadge status={job.status} type="job" size="sm" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>{job.employmentType}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            size="md"
            onClick={handleShare}
            icon={Share2}
            title="Share Job"
          >
            Share
          </Button>

          {job.hasApplied ? (
            <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Already Applied</span>
            </div>
          ) : isClosed ? (
            <div className="flex items-center space-x-2 bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-xs font-semibold cursor-not-allowed">
              <AlertCircle className="w-4 h-4 text-slate-400" />
              <span>Applications Closed</span>
            </div>
          ) : (
            <Link to={`/jobs/${job._id}/apply`}>
              <Button variant="primary" size="lg" className="rounded-xl shadow-md">
                Apply for Position
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Grid Layout: Main Details + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Job Description & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              About the Role
            </h2>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Responsibilities */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Key Responsibilities
            </h2>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {job.responsibilities}
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Skills & Qualifications Required
            </h2>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {job.requirements}
            </div>

            {/* Skills Chips */}
            {job.skills && job.skills.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Required Competencies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Overview Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Job Overview
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Offered Salary</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Experience Level</p>
                  <p className="font-bold text-slate-800 mt-0.5">{job.experienceRequired}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Education Requirement</p>
                  <p className="font-bold text-slate-800 mt-0.5">{job.educationRequired}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Open Vacancies</p>
                  <p className="font-bold text-slate-800 mt-0.5">{job.vacancies} Positions</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Application Deadline</p>
                  <p className="font-bold text-slate-800 mt-0.5">{deadlineFormatted}</p>
                  {isExpired && (
                    <span className="inline-block text-[11px] text-rose-600 font-semibold mt-1">
                      ⚠️ Deadline has passed
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Apply trigger in Sidebar */}
            <div className="pt-4 border-t border-slate-100">
              {job.hasApplied ? (
                <Link
                  to="/my-applications"
                  className="block w-full text-center py-2.5 px-4 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs border border-indigo-200 transition-colors"
                >
                  Track Your Application
                </Link>
              ) : isClosed ? (
                <button
                  disabled
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-400 font-semibold text-xs cursor-not-allowed"
                >
                  Applications Closed
                </button>
              ) : (
                <Link to={`/jobs/${job._id}/apply`} className="block">
                  <Button variant="primary" size="md" className="w-full rounded-xl">
                    Apply Now
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
