import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Sparkles,
  FileText,
  Calendar,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  Clock,
} from 'lucide-react';
import { applicationService } from '../../services/applicationService';
import StatusBadge from '../../components/common/StatusBadge';
import StatusTimeline from '../../components/applicant/StatusTimeline';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const STATUS_PIPELINE = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview',
  'Selected',
  'Rejected',
];

const AdminApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchApplication = async () => {
    try {
      const res = await applicationService.getApplicationById(id);
      if (res.success) {
        setApplication(res.data);
      }
    } catch (err) {
      toast.error('Could not load application details');
      navigate('/admin/applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await applicationService.updateStatus(id, newStatus);
      if (res.success) {
        toast.success(`Application updated to '${newStatus}'`);
        setApplication((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading application dossier..." />;
  }

  if (!application) return null;

  const job = application.jobId || {};
  const applicant = application.applicantId || {};
  const profile = application.applicantProfile || {};
  const appliedDate = new Date(application.appliedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        to="/admin/applications"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        <span>Back to All Applications</span>
      </Link>

      {/* Main Header Dossier */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-2xl shrink-0">
            {applicant.name ? applicant.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {applicant.name}
              </h1>
              <StatusBadge status={application.status} type="application" size="sm" />
            </div>
            <p className="text-xs text-slate-500">
              Applied for <span className="font-semibold text-slate-800">{job.title}</span> at{' '}
              <span className="font-semibold text-indigo-600">{job.company}</span>
            </p>
            <p className="text-[11px] text-slate-400">Application Date: {appliedDate}</p>
          </div>
        </div>

        {/* Status Pipeline Changer */}
        <div className="flex flex-col items-end gap-2 w-full md:w-auto bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Update Pipeline Status
          </span>
          <div className="flex items-center space-x-2">
            <select
              value={application.status}
              disabled={updating}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              {STATUS_PIPELINE.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stepper Pipeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Application Progression Pipeline
        </h3>
        <StatusTimeline currentStatus={application.status} />
      </div>

      {/* Two Column Grid: Applicant Details + Resume & Job */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Applicant Qualifications & Cover Letter */}
        <div className="lg:col-span-2 space-y-6">
          {/* Qualifications */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Candidate Qualifications
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Education Background</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {application.education || profile.education || 'Not specified'}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Experience Summary</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-line leading-relaxed">
                  {application.experience || profile.experience || 'Not specified'}
                </p>
              </div>

              {application.skills && application.skills.length > 0 && (
                <div>
                  <span className="font-bold text-slate-700 block mb-2">Candidate Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {application.skills.map((sk, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-lg text-[11px]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {application.coverLetter && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Cover Letter</span>
                  <p className="text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line leading-relaxed">
                    {application.coverLetter}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Contact info & Resume */}
        <div className="space-y-6">
          {/* Contact Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Candidate Contact
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center space-x-2.5 text-slate-700">
                <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate">{applicant.email}</span>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-700">
                <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{applicant.phone || profile.phone || 'No phone provided'}</span>
              </div>
              {profile.city && (
                <div className="flex items-center space-x-2.5 text-slate-700">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    {profile.city}, {profile.state}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Resume Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Resume Document
            </h3>

            {application.resume ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <FileText className="w-6 h-6 text-indigo-600 shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {application.resume}
                    </p>
                    <span className="text-[10px] text-slate-400">PDF/DOC Document</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <a
                    href={`/uploads/resumes/${application.resume}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Resume in Browser</span>
                  </a>
                  <a
                    href={`/uploads/resumes/${application.resume}`}
                    download
                    className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No resume document attached.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminApplicationDetailPage;
