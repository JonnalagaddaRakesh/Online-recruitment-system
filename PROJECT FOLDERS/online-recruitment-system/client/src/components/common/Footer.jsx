import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Heart, Shield, CheckCircle2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">TalentSphere</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Next-generation Online Recruitment System connecting top talent with industry-leading companies.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              For Applicants
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/jobs" className="hover:text-indigo-400 transition-colors">
                  Explore All Jobs
                </Link>
              </li>
              <li>
                <Link to="/my-applications" className="hover:text-indigo-400 transition-colors">
                  Application Tracker
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-indigo-400 transition-colors">
                  Applicant Profile
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-indigo-400 transition-colors">
                  Create Candidate Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Employers & Admin */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Admin & Enterprise
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/admin" className="hover:text-indigo-400 transition-colors">
                  Admin Portal
                </Link>
              </li>
              <li>
                <Link to="/admin/jobs/create" className="hover:text-indigo-400 transition-colors">
                  Post a New Job
                </Link>
              </li>
              <li>
                <Link to="/admin/applications" className="hover:text-indigo-400 transition-colors">
                  Review Applications
                </Link>
              </li>
              <li>
                <Link to="/admin/applicants" className="hover:text-indigo-400 transition-colors">
                  Candidate Database
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Security & Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Security & Compliance
            </h4>
            <div className="flex items-start space-x-2 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>JWT & Role-based Access Control with encrypted password storage.</span>
            </div>
            <div className="flex items-start space-x-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Duplicate application prevention & deadline validation.</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TalentSphere Inc. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center">
            Built with React, Node.js, Express & MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
