import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  FileText,
  Users,
  Search,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isApplicant, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'text-indigo-600 bg-indigo-50 font-semibold'
        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
      isActive
        ? 'text-indigo-600 bg-indigo-50 font-semibold'
        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
    }`;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 bg-clip-text text-transparent">
                TalentSphere
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase -mt-1">
                Recruitment System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {!isAuthenticated && (
              <>
                <NavLink to="/" className={navLinkClass}>
                  Home
                </NavLink>
                <NavLink to="/jobs" className={navLinkClass}>
                  Find Jobs
                </NavLink>
              </>
            )}

            {isAuthenticated && isApplicant && (
              <>
                <NavLink to="/" className={navLinkClass}>
                  Home
                </NavLink>
                <NavLink to="/jobs" className={navLinkClass}>
                  Explore Jobs
                </NavLink>
                <NavLink to="/my-applications" className={navLinkClass}>
                  My Applications
                </NavLink>
                <NavLink to="/profile" className={navLinkClass}>
                  Profile
                </NavLink>
              </>
            )}

            {isAuthenticated && isAdmin && (
              <>
                <NavLink to="/admin" end className={navLinkClass}>
                  <div className="flex items-center space-x-1.5">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </div>
                </NavLink>
                <NavLink to="/admin/jobs" className={navLinkClass}>
                  <div className="flex items-center space-x-1.5">
                    <Briefcase className="w-4 h-4" />
                    <span>Job Management</span>
                  </div>
                </NavLink>
                <NavLink to="/admin/applications" className={navLinkClass}>
                  <div className="flex items-center space-x-1.5">
                    <FileText className="w-4 h-4" />
                    <span>Applications</span>
                  </div>
                </NavLink>
                <NavLink to="/admin/applicants" className={navLinkClass}>
                  <div className="flex items-center space-x-1.5">
                    <Users className="w-4 h-4" />
                    <span>Applicants</span>
                  </div>
                </NavLink>
              </>
            )}
          </div>

          {/* Auth Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all"
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize leading-tight">
                      {user?.role}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {user?.email}
                      </p>
                    </div>

                    {isApplicant && (
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <UserIcon className="w-4 h-4 mr-2 text-slate-400" />
                          My Profile
                        </Link>
                        <Link
                          to="/my-applications"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <FileText className="w-4 h-4 mr-2 text-slate-400" />
                          My Applications
                        </Link>
                      </>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2 text-slate-400" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          {!isAuthenticated ? (
            <>
              <NavLink
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass}
              >
                Home
              </NavLink>
              <NavLink
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass}
              >
                Find Jobs
              </NavLink>
              <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm"
                >
                  Register
                </Link>
              </div>
            </>
          ) : (
            <>
              {isApplicant && (
                <>
                  <NavLink
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileNavLinkClass}
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileNavLinkClass}
                  >
                    Explore Jobs
                  </NavLink>
                  <NavLink
                    to="/my-applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileNavLinkClass}
                  >
                    My Applications
                  </NavLink>
                  <NavLink
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileNavLinkClass}
                  >
                    My Profile
                  </NavLink>
                </>
              )}

              {isAdmin && (
                <>
                  <NavLink
                    to="/admin"
                    end
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileNavLinkClass}
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/admin/jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileNavLinkClass}
                  >
                    Job Management
                  </NavLink>
                  <NavLink
                    to="/admin/applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileNavLinkClass}
                  >
                    Applications
                  </NavLink>
                  <NavLink
                    to="/admin/applicants"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileNavLinkClass}
                  >
                    Applicants
                  </NavLink>
                </>
              )}

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center space-x-3 mb-3 px-2">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg bg-rose-50 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
