import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  Filter,
  RotateCcw,
  Briefcase,
  X,
} from 'lucide-react';
import { jobService } from '../services/jobService';
import JobCard from '../components/applicant/JobCard';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';

const JobListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [employmentType, setEmploymentType] = useState(searchParams.get('employmentType') || 'all');
  const [experience, setExperience] = useState(searchParams.get('experience') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  // Sync state when URL params change
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlLoc = searchParams.get('location') || '';
    const urlType = searchParams.get('employmentType') || 'all';
    const urlExp = searchParams.get('experience') || 'all';
    const urlSort = searchParams.get('sort') || 'newest';
    const urlPage = parseInt(searchParams.get('page'), 10) || 1;

    setSearch(urlSearch);
    setLocation(urlLoc);
    setEmploymentType(urlType);
    setExperience(urlExp);
    setSort(urlSort);
    setPage(urlPage);
  }, [searchParams]);

  // Main fetch function
  const fetchJobs = async (searchQuery, locQuery, typeQuery, expQuery, sortQuery, pageNum) => {
    setLoading(true);
    try {
      const params = {
        page: pageNum || page,
        limit: 6,
        status: 'Active',
      };

      const term = searchQuery !== undefined ? searchQuery : search;
      const loc = locQuery !== undefined ? locQuery : location;
      const emp = typeQuery !== undefined ? typeQuery : employmentType;
      const exp = expQuery !== undefined ? expQuery : experience;
      const s = sortQuery !== undefined ? sortQuery : sort;

      if (term && term.trim()) params.search = term.trim();
      if (loc && loc.trim() && loc !== 'all') params.location = loc.trim();
      if (emp && emp !== 'all') params.employmentType = emp;
      if (exp && exp !== 'all') params.experience = exp;
      if (s) params.sort = s;

      const res = await jobService.getJobs(params);
      if (res.success) {
        setJobs(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced auto-search when typing
  const debounceTimerRef = useRef(null);
  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchJobs(value, location, employmentType, experience, sort, 1);
      // Update URL silently
      const newParams = new URLSearchParams(searchParams);
      if (value.trim()) newParams.set('search', value.trim());
      else newParams.delete('search');
      newParams.delete('page');
      setSearchParams(newParams, { replace: true });
    }, 350);
  };

  const handleLocationChange = (value) => {
    setLocation(value);
    setPage(1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchJobs(search, value, employmentType, experience, sort, 1);
      const newParams = new URLSearchParams(searchParams);
      if (value.trim()) newParams.set('location', value.trim());
      else newParams.delete('location');
      newParams.delete('page');
      setSearchParams(newParams, { replace: true });
    }, 350);
  };

  // Trigger search on mount and filter changes
  useEffect(() => {
    fetchJobs();
  }, [page, employmentType, experience, sort]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setPage(1);
    fetchJobs(search, location, employmentType, experience, sort, 1);

    const newParams = new URLSearchParams();
    if (search.trim()) newParams.set('search', search.trim());
    if (location.trim()) newParams.set('location', location.trim());
    if (employmentType !== 'all') newParams.set('employmentType', employmentType);
    if (experience !== 'all') newParams.set('experience', experience);
    if (sort !== 'newest') newParams.set('sort', sort);
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setSearch('');
    setLocation('');
    setEmploymentType('all');
    setExperience('all');
    setSort('newest');
    setPage(1);
    setSearchParams({});
    fetchJobs('', '', 'all', 'all', 'newest', 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore Job Openings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Discover and apply to verified career opportunities from leading organizations.
        </p>
      </div>

      {/* Main Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center"
      >
        <div className="flex-1 w-full flex items-center px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-indigo-600 mr-2.5 shrink-0" />
          <input
            type="text"
            placeholder="Search by job title (e.g. React), company, or skills..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-none text-slate-900 placeholder-slate-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="w-full md:w-64 flex items-center px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white transition-all">
          <MapPin className="w-4 h-4 text-indigo-600 mr-2.5 shrink-0" />
          <input
            type="text"
            placeholder="Location / Remote..."
            value={location}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-none text-slate-900 placeholder-slate-400"
          />
          {location && (
            <button
              type="button"
              onClick={() => handleLocationChange('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button type="submit" variant="primary" size="md" className="w-full md:w-auto">
            Search
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleResetFilters}
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </form>

      {/* Filters & Sorting Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Employment Type */}
          <select
            value={employmentType}
            onChange={(e) => {
              setEmploymentType(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="all">All Employment Types</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Remote">Remote</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </select>

          {/* Experience Level */}
          <select
            value={experience}
            onChange={(e) => {
              setExperience(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="all">All Experience Levels</option>
            <option value="0-1">0-1 Years (Entry Level)</option>
            <option value="2-4">2-4 Years (Mid Level)</option>
            <option value="4-6">4-6 Years (Senior)</option>
            <option value="5+">5+ Years (Lead / Expert)</option>
          </select>
        </div>

        {/* Sort Options */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-semibold">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="newest">Newest First</option>
            <option value="salary_desc">Salary: High to Low</option>
            <option value="salary_asc">Salary: Low to High</option>
            <option value="deadline">Approaching Deadline</option>
          </select>
        </div>
      </div>

      {/* Results Count & Active Filters feedback */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <span className="font-bold text-slate-900">{jobs.length}</span> of{' '}
          <span className="font-bold text-slate-900">{totalCount}</span> available roles
          {search && (
            <span className="ml-1 text-indigo-600 font-semibold">
              matching "{search}"
            </span>
          )}
        </span>
      </div>

      {/* Job Grid */}
      {loading ? (
        <Loader text="Searching available roles in MongoDB Atlas..." />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description={
            search
              ? `We couldn't find any job postings matching "${search}". Try checking for typos or searching for a broader skill like "React", "Node", or "Developer".`
              : 'We couldn\'t find any job postings matching your current criteria. Try adjusting your filters or search keywords.'
          }
          actionLabel="Reset Search Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
};

export default JobListPage;
