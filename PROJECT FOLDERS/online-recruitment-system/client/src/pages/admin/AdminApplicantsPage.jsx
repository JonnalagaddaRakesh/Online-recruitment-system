import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Eye,
  Mail,
  Phone,
  GraduationCap,
  Sparkles,
  FileText,
  Calendar,
  Clock,
  Shield,
  Activity,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { applicantService } from '../../services/applicantService';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const AdminApplicantsPage = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Search & Pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modal inspection
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [applicantDetails, setApplicantDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
      };
      const res = await applicantService.getApplicants(params);
      if (res.success) {
        setApplicants(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      console.error('Error fetching applicants:', err);
      toast.error('Could not load applicant directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchApplicants();
  };

  const handleReset = () => {
    setSearch('');
    setPage(1);
  };

  const openApplicantModal = async (applicant) => {
    setSelectedApplicant(applicant);
    setLoadingDetails(true);
    try {
      const res = await applicantService.getApplicantById(applicant._id);
      if (res.success) {
        setApplicantDetails(res.data);
      }
    } catch (err) {
      toast.error('Failed to load candidate profile details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Applicant Database & Timestamps
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Track registered candidates, review qualification profiles, and inspect exact login & registration timestamps.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="flex-1 flex items-center px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search candidate name, email, education, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs focus:outline-none text-slate-900"
            />
          </div>
          <Button type="submit" variant="primary" size="sm">
            Search
          </Button>
          <Button variant="secondary" size="sm" onClick={handleReset} title="Reset Search">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>

      {/* Applicants Table with Timestamps */}
      {loading ? (
        <Loader text="Loading registered candidates from MongoDB Atlas..." />
      ) : applicants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No applicants found"
          description="There are currently no registered applicant accounts matching your query."
          actionLabel="Reset Search"
          onAction={handleReset}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-slate-500 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Candidate</th>
                  <th className="px-5 py-3.5">Education & Skills</th>
                  <th className="px-5 py-3.5">Applications</th>
                  <th className="px-5 py-3.5">Registered At</th>
                  <th className="px-5 py-3.5">Last Login At</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applicants.map((cand) => (
                  <tr key={cand._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 text-sm">{cand.name}</div>
                      <div className="text-slate-500 text-[11px]">{cand.email}</div>
                      {cand.phone && (
                        <div className="text-slate-400 text-[10px]">{cand.phone}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-700 max-w-xs">
                      <div className="truncate font-medium">{cand.education}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cand.skills && cand.skills.length > 0 ? (
                          cand.skills.slice(0, 2).map((sk, index) => (
                            <span
                              key={index}
                              className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-semibold"
                            >
                              {sk}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[10px]">No skills listed</span>
                        )}
                        {cand.skills?.length > 2 && (
                          <span className="text-[10px] text-slate-400">
                            +{cand.skills.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                        {cand.applicationsCount} submitted
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-1.5 text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium">{formatTimestamp(cand.registeredDate || cand.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit">
                        <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="font-bold text-[11px]">{formatTimestamp(cand.lastLogin)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openApplicantModal(cand)}
                        icon={Eye}
                      >
                        Profile Dossier
                      </Button>
                    </td>
                  </tr>
                ))}
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

      {/* Candidate Profile & Login Timestamps Inspector Modal */}
      {selectedApplicant && (
        <Modal
          isOpen={Boolean(selectedApplicant)}
          onClose={() => {
            setSelectedApplicant(null);
            setApplicantDetails(null);
          }}
          title="Candidate Profile & Audit Timestamps"
          maxWidth="max-w-3xl"
          footer={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedApplicant(null);
                setApplicantDetails(null);
              }}
            >
              Close
            </Button>
          }
        >
          {loadingDetails ? (
            <Loader text="Fetching candidate history and login timestamps..." />
          ) : applicantDetails ? (
            <div className="space-y-6">
              {/* Header profile banner */}
              <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="w-14 h-14 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">
                  {applicantDetails.user?.name
                    ? applicantDetails.user.name.charAt(0).toUpperCase()
                    : 'C'}
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {applicantDetails.user?.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>{applicantDetails.user?.email}</span>
                    {applicantDetails.user?.phone && (
                      <span>• {applicantDetails.user?.phone}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Timestamp Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Account Created At</p>
                    <p className="text-xs font-extrabold text-slate-900">
                      {formatTimestamp(applicantDetails.user?.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Last Login Timestamp</p>
                    <p className="text-xs font-extrabold text-slate-900">
                      {formatTimestamp(applicantDetails.user?.lastLogin)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Login History Activity Feed */}
              {applicantDetails.user?.loginHistory && applicantDetails.user.loginHistory.length > 0 && (
                <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                  <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    <span>Login Activity History & Session Timestamps</span>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {applicantDetails.user.loginHistory.map((rec, i) => (
                      <div key={i} className="pt-2 first:pt-0 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="font-semibold text-slate-800">
                            {formatTimestamp(rec.timestamp)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          <span>IP: {rec.ipAddress || '127.0.0.1'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education & Experience */}
              <div className="space-y-3 text-xs border-t border-slate-100 pt-4">
                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                    Education
                  </span>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {applicantDetails.profile?.education || 'No education provided'}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                    Experience
                  </span>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 whitespace-pre-line">
                    {applicantDetails.profile?.experience || 'No experience summary provided'}
                  </p>
                </div>

                {applicantDetails.profile?.skills && (
                  <div>
                    <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                      Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {applicantDetails.profile.skills.map((sk, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-lg text-xs"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {applicantDetails.profile?.resume && (
                  <div>
                    <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                      Uploaded Resume File
                    </span>
                    <a
                      href={`/uploads/resumes/${applicantDetails.profile.resume}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl font-semibold transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{applicantDetails.profile.resume}</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </Modal>
      )}
    </div>
  );
};

export default AdminApplicantsPage;
