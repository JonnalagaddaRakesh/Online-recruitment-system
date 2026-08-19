import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  FileText,
  CheckCircle2,
  Award,
  Clock,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import StatsCard from '../../components/admin/StatsCard';
import {
  StatusDistributionChart,
  ApplicationsPerJobChart,
  EmploymentTypeChart,
} from '../../components/admin/Charts';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await dashboardService.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
      toast.error('Could not load live dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <Loader fullScreen text="Aggregating recruitment metrics..." />;
  }

  const cards = stats?.cards || {};
  const charts = stats?.charts || {};
  const recentApplications = stats?.recentApplications || [];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Recruiter Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time pipeline analytics, application statistics, and job performance.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link to="/admin/jobs/create">
            <Button variant="primary" size="md" icon={PlusCircle}>
              Post New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Total Jobs"
          value={cards.totalJobs}
          icon={Briefcase}
          color="indigo"
          subtitle={`${cards.activeJobs || 0} active`}
        />
        <StatsCard
          title="Active Openings"
          value={cards.activeJobs}
          icon={TrendingUp}
          color="emerald"
          subtitle="Currently open"
        />
        <StatsCard
          title="Total Applications"
          value={cards.totalApplications}
          icon={FileText}
          color="blue"
          subtitle="Received to date"
        />
        <StatsCard
          title="Registered Candidates"
          value={cards.totalApplicants}
          icon={Users}
          color="purple"
          subtitle="In talent pool"
        />
        <StatsCard
          title="Shortlisted"
          value={cards.shortlistedApplicants}
          icon={Award}
          color="amber"
          subtitle="Advanced candidates"
        />
        <StatsCard
          title="Selected"
          value={cards.selectedApplicants}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Hired offers"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusDistributionChart data={charts.applicationsByStatus || []} />
        <ApplicationsPerJobChart data={charts.applicationsPerJob || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <EmploymentTypeChart data={charts.jobsByEmploymentType || []} />
        </div>

        {/* Recent Applications Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">Recent Applications</h4>
                <p className="text-xs text-slate-500">Latest submissions across all jobs</p>
              </div>
              <Link
                to="/admin/applications"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No recent applications received yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100 uppercase tracking-wider font-semibold">
                      <th className="pb-3 font-semibold">Candidate</th>
                      <th className="pb-3 font-semibold">Applied Position</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentApplications.map((app) => (
                      <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3">
                          <div className="font-bold text-slate-800">
                            {app.applicantId?.name || 'Applicant'}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                            {app.applicantId?.email}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="font-medium text-slate-800">
                            {app.jobId?.title || 'Job Opening'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {app.jobId?.company}
                          </div>
                        </td>
                        <td className="py-3">
                          <StatusBadge status={app.status} type="application" size="sm" />
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            to={`/admin/applications/${app._id}`}
                            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold text-xs"
                          >
                            <span>Review</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
