import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Eye,
  ExternalLink,
  RotateCcw,
  CheckCircle,
  Briefcase,
} from 'lucide-react';
import { applicationService } from '../../services/applicationService';
import { jobService } from '../../services/jobService';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview',
  'Selected',
  'Rejected',
];

const AdminApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Status updating tracking map
  const [updatingId, setUpdatingId] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        status: statusFilter,
        jobId: jobFilter,
        search: search.trim() || undefined,
      };

      const res = await applicationService.getAllApplications(params);
      if (res.success) {
        setApplications(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      console.error('Error fetching admin applications:', err);
      toast.error('Could not load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await jobService.getJobs({ limit: 100, status: 'all' });
        if (res.success) {
          setJobsList(res.data || []);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [page, statusFilter, jobFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchApplications();
  };

  const handleReset = () => {
    setSearch('');
    setStatusFilter('all');
    setJobFilter('all');
    setPage(1);
  };

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      const res = await applicationService.updateStatus(appId, newStatus);
      if (res.success) {
        toast.success(`Application updated to '${newStatus}'`);
        // Update locally in list
        setApplications((prev) =>
          prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
        );
      }
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Applicant Submissions
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review candidate profiles, download resumes, and manage recruitment pipeline stages.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="flex-1 flex items-center px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search candidate name, email, or job..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs focus:outline-none text-slate-900"
            />
          </div>
          <Button type="submit" variant="primary" size="sm">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium"
          >
            <option value="all">All Pipeline Stages</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Job filter */}
          <select
            value={jobFilter}
            onChange={(e) => {
              setJobFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium max-w-xs truncate"
          >
            <option value="all">All Jobs</option>
            {jobsList.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title} ({j.company})
              </option>
            ))}
          </select>

          <Button variant="secondary" size="sm" onClick={handleReset} title="Reset Filters">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <Loader text="Loading candidate applications..." />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications found"
          description="There are no applications matching your current filter criteria."
          actionLabel="Reset Filters"
          onAction={handleReset}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Applicant Name</th>
                  <th className="px-6 py-3.5">Target Job</th>
                  <th className="px-6 py-3.5">Applied Date</th>
                  <th className="px-6 py-3.5">Resume</th>
                  <th className="px-6 py-3.5">Pipeline Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => {
                  const appliedDate = new Date(app.appliedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {app.applicantId?.name || 'Candidate'}
                        </div>
                        <div className="text-slate-500 text-[11px]">{app.applicantId?.email}</div>
                        {app.applicantId?.phone && (
                          <div className="text-slate-400 text-[10px]">{app.applicantId.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">
                          {app.jobId?.title || 'Job Opening'}
                        </div>
                        <div className="text-indigo-600 text-[11px]">
                          {app.jobId?.company}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{appliedDate}</td>
                      <td className="px-6 py-4">
                        {app.resume ? (
                          <a
                            href={`/uploads/resumes/${app.resume}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 mr-1" />
                            <span>Resume</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No file</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <select
                            value={app.status}
                            disabled={updatingId === app._id}
                            onChange={(e) => handleStatusChange(app._id, e.target.value)}
                            className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                          >
                            {STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/admin/applications/${app._id}`}
                          className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 font-semibold text-xs bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Full Detail</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplicationsPage;
