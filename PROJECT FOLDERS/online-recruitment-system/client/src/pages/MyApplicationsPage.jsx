import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  ArrowRight,
  Filter,
  Eye,
  ExternalLink,
  Briefcase,
  Clock,
} from 'lucide-react';
import { applicationService } from '../services/applicationService';
import StatusBadge from '../components/common/StatusBadge';
import StatusTimeline from '../components/applicant/StatusTimeline';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationService.getMyApplications({
        status: statusFilter,
      });
      if (res.success) {
        setApplications(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
      toast.error('Could not load your applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track real-time hiring progress across all your submitted job applications.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">All Applications ({applications.length})</option>
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview">Interview</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <Loader text="Loading your applications..." />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications found"
          description="You haven't applied for any jobs matching this filter yet. Explore active listings and take the next step in your career."
          actionLabel="Browse Available Jobs"
          onAction={() => (window.location.href = '/jobs')}
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const job = app.jobId || {};
            const appliedDate = new Date(app.appliedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={app._id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Left: Job Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      {job.company || 'Company'}
                    </span>
                    <StatusBadge status={app.status} type="application" size="sm" />
                  </div>

                  <Link to={`/jobs/${job._id}`}>
                    <h3 className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                      {job.title || 'Job Opening'}
                    </h3>
                  </Link>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.employmentType || 'Full Time'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Applied on {appliedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-3 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedApp(app)}
                    icon={Eye}
                  >
                    View Status & Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApp && (
        <Modal
          isOpen={Boolean(selectedApp)}
          onClose={() => setSelectedApp(null)}
          title="Application Status & Details"
          maxWidth="max-w-2xl"
          footer={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedApp(null)}
            >
              Close
            </Button>
          }
        >
          <div className="space-y-6">
            {/* Header info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  {selectedApp.jobId?.company}
                </p>
                <h4 className="text-base font-bold text-slate-900">
                  {selectedApp.jobId?.title}
                </h4>
              </div>
              <StatusBadge status={selectedApp.status} type="application" size="md" />
            </div>

            {/* Stepper Timeline */}
            <div>
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Hiring Pipeline Progress
              </h5>
              <StatusTimeline currentStatus={selectedApp.status} />
            </div>

            {/* Application Data */}
            <div className="space-y-3 text-xs border-t border-slate-100 pt-4">
              <div>
                <span className="font-bold text-slate-700 block mb-1">
                  Submitted Education:
                </span>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {selectedApp.education || 'Not specified'}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">
                  Experience Summary:
                </span>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-line">
                  {selectedApp.experience || 'Not specified'}
                </p>
              </div>

              {selectedApp.coverLetter && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1">
                    Cover Letter:
                  </span>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-line">
                    {selectedApp.coverLetter}
                  </p>
                </div>
              )}

              {selectedApp.resume && (
                <div className="pt-2">
                  <span className="font-bold text-slate-700 block mb-1.5">
                    Attached Resume:
                  </span>
                  <a
                    href={`/uploads/resumes/${selectedApp.resume}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Submitted Resume</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyApplicationsPage;
