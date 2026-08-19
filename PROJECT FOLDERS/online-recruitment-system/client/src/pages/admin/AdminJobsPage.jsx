import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Briefcase,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { jobService } from '../../services/jobService';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const AdminJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [empTypeFilter, setEmpTypeFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Delete modal state
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 8,
        status: statusFilter,
        employmentType: empTypeFilter !== 'all' ? empTypeFilter : undefined,
        search: search.trim() || undefined,
      };

      const res = await jobService.getJobs(params);
      if (res.success) {
        setJobs(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      console.error('Error fetching admin jobs:', err);
      toast.error('Could not load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, statusFilter, empTypeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleReset = () => {
    setSearch('');
    setStatusFilter('all');
    setEmpTypeFilter('all');
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;
    setDeleting(true);
    try {
      const res = await jobService.deleteJob(jobToDelete._id);
      if (res.success) {
        toast.success('Job posting deleted successfully');
        setJobToDelete(null);
        fetchJobs();
      }
    } catch (err) {
      toast.error('Failed to delete job posting');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Job Openings Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage, edit, create, and track status for all organization job postings.
          </p>
        </div>

        <Link to="/admin/jobs/create">
          <Button variant="primary" size="md" icon={PlusCircle}>
            Create Job Posting
          </Button>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="flex-1 flex items-center px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search by title, company, or location..."
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
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
            <option value="Draft">Draft</option>
          </select>

          <select
            value={empTypeFilter}
            onChange={(e) => {
              setEmpTypeFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium"
          >
            <option value="all">All Types</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Remote">Remote</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </select>

          <Button variant="secondary" size="sm" onClick={handleReset} title="Reset">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Jobs Table */}
      {loading ? (
        <Loader text="Loading job listings..." />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description="There are currently no job listings matching your query."
          actionLabel="Create a New Job"
          onAction={() => (window.location.href = '/admin/jobs/create')}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Job Title & Company</th>
                  <th className="px-6 py-3.5">Location & Type</th>
                  <th className="px-6 py-3.5">Vacancies</th>
                  <th className="px-6 py-3.5">Deadline</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => {
                  const deadlineStr = new Date(job.deadline).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const isExpired = new Date(job.deadline) < new Date();

                  return (
                    <tr key={job._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">{job.title}</div>
                        <div className="text-indigo-600 font-medium">{job.company}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <div>{job.location}</div>
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">
                          {job.employmentType}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {job.vacancies} {job.vacancies === 1 ? 'opening' : 'openings'}
                      </td>
                      <td className="px-6 py-4">
                        <div className={isExpired ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                          {deadlineStr}
                        </div>
                        {isExpired && (
                          <span className="text-[10px] text-rose-500 font-bold block">Expired</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={job.status} type="job" size="sm" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Link
                            to={`/jobs/${job._id}`}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Public Job View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/jobs/${job._id}/edit`}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit Job"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setJobToDelete(job)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Job"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

      {/* Delete Confirmation Modal */}
      {jobToDelete && (
        <Modal
          isOpen={Boolean(jobToDelete)}
          onClose={() => setJobToDelete(null)}
          title="Confirm Job Deletion"
          maxWidth="max-w-md"
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setJobToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={confirmDelete}
                loading={deleting}
              >
                Delete Job
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="font-bold text-sm text-slate-900">
                Are you sure you want to delete this job posting?
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              You are about to delete <span className="font-bold text-slate-800">"{jobToDelete.title}"</span> at{' '}
              <span className="font-bold text-slate-800">{jobToDelete.company}</span>. All candidate applications submitted for this job will also be removed permanently.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminJobsPage;
