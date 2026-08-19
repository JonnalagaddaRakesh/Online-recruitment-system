import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
  Users,
  Building,
} from 'lucide-react';
import { jobService } from '../services/jobService';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/applicant/JobCard';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';

const HomePage = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const res = await jobService.getJobs({ limit: 4, status: 'Active' });
        if (res.success) {
          setFeaturedJobs(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load featured jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedJobs();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (locationQuery.trim()) params.append('location', locationQuery.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 rounded-b-[2.5rem] shadow-2xl">
        {/* Background glow accents */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Modern Full-Stack Recruitment Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Find Your Next <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Career Opportunity
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Discover verified jobs matching your exact skills and career ambitions.
            Apply with zero hassle and track your application status in real-time.
          </p>

          {/* Hero Search Box */}
          <form
            onSubmit={handleHeroSearch}
            className="max-w-3xl mx-auto bg-white p-2 sm:p-3 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2 border border-slate-100 text-slate-900"
          >
            <div className="flex-1 flex items-center px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-200">
              <Search className="w-5 h-5 text-indigo-600 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Job title, skills, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none placeholder-slate-400"
              />
            </div>
            <div className="flex-1 flex items-center px-3 py-2">
              <MapPin className="w-5 h-5 text-indigo-600 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="City, state, or Remote..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none placeholder-slate-400"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="rounded-xl px-6"
            >
              Search Jobs
            </Button>
          </form>

          {/* Quick CTA Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-400 pt-2">
            <span>Popular Searches:</span>
            {['React', 'Node.js', 'Remote', 'Frontend', 'Full Time'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => navigate(`/jobs?search=${tag}`)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Streamlined Hiring for Modern Teams
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Everything candidates and hiring managers need in one cohesive platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">Search Jobs</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore active job postings with faceted filtering across salary, experience, and remote preferences.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">Easy Application</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Seamlessly submit your profile, cover letter, and resume files (PDF/DOCX) in just a few clicks.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">Track Applications</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time multi-stage status tracker from initial submission through review, interview, and selection.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">Enterprise Security</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Protected by JWT authentication, role-based authorization, and duplicate application prevention.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Job Openings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Top hand-picked roles currently actively hiring candidates.
            </p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>View All Jobs</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <Loader text="Loading featured roles..." />
        ) : featuredJobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-500">No active job postings at this moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ready to Accelerate Your Career?
            </h3>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
              Create an applicant account today to browse verified job openings, build your profile, and receive status updates.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="px-6 py-3 rounded-xl bg-white text-indigo-600 font-bold text-sm hover:bg-indigo-50 shadow-md transition-all text-center"
                >
                  Create Candidate Account
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-xl bg-indigo-700/50 hover:bg-indigo-700 text-white font-semibold text-sm border border-indigo-400/40 transition-all text-center"
                >
                  Admin & User Login
                </Link>
              </>
            ) : isAdmin ? (
              <Link
                to="/admin"
                className="px-6 py-3 rounded-xl bg-white text-indigo-600 font-bold text-sm hover:bg-indigo-50 shadow-md transition-all text-center"
              >
                Go to Admin Dashboard
              </Link>
            ) : (
              <Link
                to="/jobs"
                className="px-6 py-3 rounded-xl bg-white text-indigo-600 font-bold text-sm hover:bg-indigo-50 shadow-md transition-all text-center"
              >
                Explore Active Openings
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
